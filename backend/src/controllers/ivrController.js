const VoiceSession = require('../models/VoiceSession');
const env = require('../config/env');
const { sendAnswerNotification } = require('../services/emailNotificationService');

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

const requestInterviewTurn = async ({ text, language, sessionId, profile }) => {
  const response = await fetch(`${env.AI_SERVICE_URL}/v1/interview/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_text: text, language, session_id: sessionId, profile: profile || {} }),
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
    await VoiceSession.findOneAndUpdate(
      { sessionId: callId },
      { $set: { language, status: 'ACTIVE' }, $setOnInsert: { sessionId: callId, turns: [], extractedProfileData: {} } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const prompt = language === 'hi'
      ? 'नमस्ते। आजीविका सहायता में आपका स्वागत है। कृपया अपने काम, कौशल या रुचि के बारे में बताएं।'
      : 'Welcome to Livelihood Assistant. Please tell us about your work, skills, or interests.';
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

    const interview = await requestInterviewTurn({
      text,
      language: session.language,
      sessionId: session.sessionId,
      profile: session.extractedProfileData,
    });
    if (interview.next_question?.text) session.turns.push({ speaker: 'SYSTEM', text: interview.next_question.text });
    session.extractedProfileData = interview.profile || session.extractedProfileData;
    session.status = interview.is_complete ? 'COMPLETED' : 'ACTIVE';
    await session.save();

    if (interview.is_complete) {
      const prompt = session.language === 'hi'
        ? 'धन्यवाद। आपकी जानकारी दर्ज हो गई है। जल्द ही आपके लिए सुझाव तैयार किए जाएंगे।'
        : 'Thank you. Your information has been recorded. We will prepare your recommendations shortly.';
      return res.type('application/xml').send(xml(`${say(prompt, session.language)}<Hangup/>`));
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

module.exports = { startCall, gatherInput, recordDemoAnswer };
