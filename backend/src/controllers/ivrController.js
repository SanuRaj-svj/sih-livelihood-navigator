const VoiceSession = require('../models/VoiceSession');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const env = require('../config/env');
const { sendAnswerNotification } = require('../services/emailNotificationService');
const { createVoiceTwin } = require('../services/livelihoodWorkflowService');

const LANGUAGE_CODES = { hi: 'hi-IN', en: 'en-IN' };

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const say = (text, language) => {
  const voiceLanguage = LANGUAGE_CODES[language] || LANGUAGE_CODES.hi;
  return `<Say language="${voiceLanguage}">${escapeXml(text)}</Say>`;
};

const gather = (prompt, language) => {
  const voiceLanguage = LANGUAGE_CODES[language] || LANGUAGE_CODES.hi;
  return `<Gather input="speech dtmf" action="/api/ivr/gather" method="POST" language="${voiceLanguage}" speechTimeout="auto">${say(prompt, language)}</Gather><Redirect method="POST">/api/ivr/voice</Redirect>`;
};

const xml = (body) => `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;

const normalizeLanguage = (value) => {
  const language = String(value || 'hi').toLowerCase().split(/[-_]/)[0];
  return Object.prototype.hasOwnProperty.call(LANGUAGE_CODES, language) ? language : 'hi';
};

const normalizeVoiceCommand = (text) => {
  const normalized = String(text || '').trim().toLowerCase();
  if (/^(repeat|again|रिपीट|दोबारा|फिर से)$/.test(normalized)) return 'REPEAT';
  if (/^(skip|pass|छोड़ें|छोड़ें|पता नहीं)$/.test(normalized)) return 'SKIP';
  if (/^(yes|yeah|correct|confirm|हाँ|हां|सही|ठीक)$/.test(normalized)) return 'YES';
  if (/^(no|nope|incorrect|change|नहीं|गलत)$/.test(normalized)) return 'NO';
  return null;
};

const confirmationPrompt = (profile, language) => {
  const summary = [
    profile.age ? `${profile.age} years old` : null,
    profile.location?.district ? `living in ${profile.location.district}` : null,
    profile.aspirations?.length ? `interested in ${profile.aspirations.join(', ')}` : null,
  ].filter(Boolean).join(', ');
  return language === 'hi'
    ? `आपकी जानकारी ${summary || 'दर्ज जानकारी'} के रूप में मिली है। सुझाव बनाने से पहले पुष्टि करें। सही है तो हाँ कहें, सुधार के लिए नहीं कहें।`
    : `I recorded ${summary || 'your details'}. Before preparing recommendations, please confirm. Say yes if correct, or no to make a correction.`;
};

const confirmationResult = (text, language) => {
  const command = normalizeVoiceCommand(text);
  if (command === 'YES' || command === 'NO') return command;
  if (language === 'hi' && /^(जी हाँ|बिल्कुल|ठीक है)$/.test(String(text || '').trim())) return 'YES';
  return null;
};

const getConversationGateReason = ({ user, profile }) => {
  if (!user) return 'Sign in and verify your certificate and identity before starting the livelihood conversation.';
  if (!profile) return 'Create your beneficiary profile and upload your SC certificate before starting the conversation.';
  if (profile.verification?.scCertificateStatus !== 'VERIFIED' || profile.verification?.scCertificateIdentityMatch !== true) {
    return 'Your SC certificate and identity must be verified by an officer before the livelihood conversation can begin.';
  }
  return null;
};

const requestInterviewTurn = async ({ text, language, sessionId, profile, unknownSlots = [] }) => {
  const response = await fetch(`${env.AI_SERVICE_URL}/v1/interview/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_text: text, language, session_id: sessionId, profile: profile || {}, unknown_slots: unknownSlots }),
    signal: AbortSignal.timeout(env.AI_SERVICE_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`AI interview service responded with HTTP ${response.status}`);
  return response.json();
};

const startCall = async (req, res, next) => {
  try {
    const callId = String(req.body.CallSid || req.body.call_id || '').trim();
    if (!callId) return res.status(400).type('application/xml').send(xml(say('Missing call identifier.', 'en')));

    const language = normalizeLanguage(req.body.Language || req.body.language);
    const profile = req.user ? await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id verification') : null;
    const gateReason = getConversationGateReason({ user: req.user, profile });
    if (gateReason) return res.type('application/xml').send(xml(`${say(gateReason, language)}<Hangup/>`));
    const session = await VoiceSession.findOneAndUpdate(
      { sessionId: callId },
      {
        $set: {
          language,
          status: 'ACTIVE',
          currentSlot: 'age',
          skippedSlots: [],
          workflowSnapshot: null,
          ...(profile ? { beneficiaryId: profile._id } : {}),
        },
        $setOnInsert: { sessionId: callId, turns: [], extractedProfileData: {} },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const prompt = language === 'hi'
      ? 'नमस्ते। आजीविका सहायता में आपका स्वागत है। कृपया अपने काम, कौशल या रुचि के बारे में बताएं।'
      : 'Welcome to Livelihood Assistant. Please tell us about your work, skills, or interests.';
    if (!session.turns.some((turn) => turn.speaker === 'SYSTEM')) {
      session.turns.push({ speaker: 'SYSTEM', text: prompt });
      await session.save();
    }
    return res.type('application/xml').send(xml(gather(prompt, language)));
  } catch (error) {
    return res.type('application/xml').send(xml(`${say(
      'We are unable to process your response right now. Please try again later.',
      'en',
    )}<Hangup/>`));
  }
};

const gatherInput = async (req, res, next) => {
  try {
    const callId = String(req.body.CallSid || req.body.call_id || '').trim();
    const session = await VoiceSession.findOne({ sessionId: callId });
    if (!session) return res.status(404).type('application/xml').send(xml(say('This call session was not found. Please call again.', 'en')));

    const speech = String(req.body.SpeechResult || '').trim();
    const digits = String(req.body.Digits || '').trim();
    const text = speech || (digits ? `keypad response ${digits}` : '');
    if (!text) return res.type('application/xml').send(xml(gather(
      session.language === 'hi' ? 'कृपया बोलकर या नंबर दबाकर उत्तर दें।' : 'Please speak your answer or press a number.',
      session.language,
    )));

    session.turns.push({ speaker: 'USER', text });
    await session.save();
    void sendAnswerNotification({ session, answer: text });

    const command = normalizeVoiceCommand(text);
    if (session.status === 'AWAITING_CONFIRMATION') {
      const confirmed = confirmationResult(text, session.language);
      if (confirmed === 'YES') {
        try {
          const twin = await createVoiceTwin({
            sessionId: session.sessionId,
            extractedProfileData: session.extractedProfileData,
            beneficiaryProfileId: session.beneficiaryId,
          });
          session.workflowSnapshot = twin?.toObject ? twin.toObject() : twin;
        } catch (assessmentError) {
          console.warn(`Voice livelihood assessment unavailable: ${assessmentError.message}`);
        }
        session.status = 'COMPLETED';
        await session.save();
        const thanks = session.language === 'hi'
          ? 'धन्यवाद। आपकी पुष्टि की गई जानकारी से आजीविका सुझाव तैयार किए गए हैं।'
          : 'Thank you. Your confirmed details have been used to prepare livelihood recommendations.';
        return res.type('application/xml').send(xml(`${say(thanks, session.language)}<Hangup/>`));
      }
      if (confirmed === 'NO') {
        session.status = 'ACTIVE';
        await session.save();
        const correctionPrompt = session.language === 'hi'
          ? 'कृपया बताएं कि कौन-सी जानकारी सुधारनी है।'
          : 'Please say which detail you would like to correct.';
        return res.type('application/xml').send(xml(gather(correctionPrompt, session.language)));
      }
      return res.type('application/xml').send(xml(gather(confirmationPrompt(session.extractedProfileData, session.language), session.language)));
    }

    if (command === 'REPEAT') {
      const lastPrompt = [...session.turns].reverse().find((turn) => turn.speaker === 'SYSTEM')?.text;
      const prompt = lastPrompt || (session.language === 'hi' ? 'कृपया अपने काम और कौशल के बारे में बताएं।' : 'Please tell us about your work and skills.');
      session.turns.push({ speaker: 'SYSTEM', text: prompt });
      await session.save();
      return res.type('application/xml').send(xml(gather(prompt, session.language)));
    }

    if (command === 'SKIP' && session.currentSlot && !session.skippedSlots.includes(session.currentSlot)) {
      session.skippedSlots.push(session.currentSlot);
    }

    const interview = await requestInterviewTurn({
      text: command === 'SKIP' ? 'I prefer not to answer this question.' : text,
      language: session.language,
      sessionId: session.sessionId,
      profile: session.extractedProfileData,
      unknownSlots: session.skippedSlots,
    });
    if (interview.next_question?.text) {
      session.currentSlot = interview.next_question.slot || '';
      session.turns.push({ speaker: 'SYSTEM', text: interview.next_question.text });
    }
    session.extractedProfileData = interview.profile || session.extractedProfileData;
    session.status = interview.is_complete ? 'AWAITING_CONFIRMATION' : 'ACTIVE';
    if (interview.is_complete) {
      session.currentSlot = '';
      const prompt = confirmationPrompt(session.extractedProfileData, session.language);
      session.turns.push({ speaker: 'SYSTEM', text: prompt });
    }
    await session.save();

    if (interview.is_complete) {
      const prompt = confirmationPrompt(session.extractedProfileData, session.language);
      return res.type('application/xml').send(xml(gather(prompt, session.language)));
    }

    const prompt = interview.next_question?.text || (session.language === 'hi' ? 'कृपया और जानकारी दें।' : 'Please tell us more.');
    return res.type('application/xml').send(xml(gather(prompt, session.language)));
  } catch (error) {
    return res.type('application/xml').send(xml(`${say(
      'We are unable to process your response right now. Please try again later.',
      'en',
    )}<Hangup/>`));
  }
};

const recordDemoAnswer = async (req, res, next) => {
  try {
    const callId = String(req.body.CallSid || req.body.call_id || '').trim();
    const answer = String(req.body.SpeechResult || req.body.answer || '').trim();
    const session = await VoiceSession.findOne({ sessionId: callId });
    if (!session || !answer) return res.status(400).json({ success: false, message: 'Call session and answer are required' });

    session.turns.push({ speaker: 'USER', text: answer });
    await session.save();
    const emailSent = await sendAnswerNotification({ session, answer });
    return res.status(200).json({ success: true, recorded: true, emailSent });
  } catch (error) {
    return next(error);
  }
};

module.exports = { startCall, gatherInput, recordDemoAnswer, normalizeVoiceCommand, getConversationGateReason };
