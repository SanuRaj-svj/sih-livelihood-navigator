import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Headphones, Mic, Phone, PhoneCall, RotateCcw, Send, Wifi, WifiOff } from 'lucide-react';

const LOCAL_PROMPTS = [
  'Welcome to Livelihood Assistant. Please tell us about your work, skills, or interests.',
  'What is your age?',
  'Which state and district do you currently live in?',
  'What skills or traditional work skills do you have?',
];

const xmlPrompt = (xml) => {
  const sayMatch = xml.match(/<Say[^>]*>([\s\S]*?)<\/Say>/i);
  if (!sayMatch) return 'Please tell us more about your livelihood journey.';
  return sayMatch[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
};

const isProviderFailure = (xml) => xml.includes('unable to process your response');

const postForm = async (path, values) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Backend returned ${response.status}`);
  return body;
};

function IvrDemo() {
  const [callId, setCallId] = useState('');
  const [prompt, setPrompt] = useState('Press start to begin your free IVR demonstration.');
  const [answer, setAnswer] = useState('');
  const [digits, setDigits] = useState('');
  const [messages, setMessages] = useState([]);
  const [isCalling, setIsCalling] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [localStep, setLocalStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const addMessage = (speaker, text) => {
    setMessages((current) => [...current, { id: `${Date.now()}-${current.length}`, speaker, text }]);
  };

  const startDemo = async () => {
    const nextCallId = `browser-demo-${Date.now()}`;
    setCallId(nextCallId);
    setMessages([]);
    setIsCalling(true);
    setLocalStep(0);
    setIsComplete(false);
    try {
      const xml = await postForm('/api/ivr/voice', { CallSid: nextCallId, Language: 'en' });
      setPrompt(xmlPrompt(xml));
      setIsLive(!isProviderFailure(xml));
    } catch {
      setPrompt(LOCAL_PROMPTS[0]);
      setIsLive(false);
    }
  };

  const sendAnswer = async (value = answer) => {
    const cleanAnswer = value.trim();
    const keypadAnswer = digits.trim();
    if ((!cleanAnswer && !keypadAnswer) || isComplete) return;
    const liveAtStart = isLive;
    const visibleAnswer = cleanAnswer || `Keypad response ${keypadAnswer}`;
    addMessage('caller', visibleAnswer);
    setAnswer('');
    setDigits('');
    setIsCalling(true);

    if (isLive) {
      try {
        const xml = await postForm('/api/ivr/gather', {
          CallSid: callId,
          SpeechResult: cleanAnswer,
          Digits: keypadAnswer,
        });
        if (isProviderFailure(xml)) throw new Error('AI service unavailable');
        setPrompt(xmlPrompt(xml));
        addMessage('assistant', xmlPrompt(xml));
        setIsCalling(false);
        return;
      } catch {
        setIsLive(false);
      }
    }

    if (!liveAtStart) {
      void postForm('/api/ivr/demo-answer', { CallSid: callId, SpeechResult: visibleAnswer }).catch(() => {});
    }

    const nextStep = localStep + 1;
    if (nextStep >= LOCAL_PROMPTS.length) {
      const completion = 'Thank you. Your livelihood profile has been recorded for the demonstration.';
      setIsComplete(true);
      setPrompt(completion);
      addMessage('assistant', completion);
    } else {
      setLocalStep(nextStep);
      setPrompt(LOCAL_PROMPTS[nextStep]);
      addMessage('assistant', LOCAL_PROMPTS[nextStep]);
    }
    setIsCalling(false);
  };

  const reset = () => {
    setCallId('');
    setPrompt('Press start to begin your free IVR demonstration.');
    setAnswer('');
    setDigits('');
    setMessages([]);
    setIsCalling(false);
    setIsLive(false);
    setLocalStep(0);
    setIsComplete(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-secondary)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent-secondary)]">
              <Headphones className="h-3.5 w-3.5" /> Presentation mode
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Livelihood IVR</h1>
            <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
              A free browser simulation of the phone conversation. No Twilio upgrade or phone number is required.
            </p>
          </div>
          <div className={`flex items-center gap-2 self-start rounded-full border px-3 py-2 text-xs font-bold md:self-auto ${isLive ? 'border-emerald-500 text-emerald-600' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
            {isLive ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isLive ? 'Express IVR connected' : 'Local demo mode'}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="app-card overflow-hidden rounded-3xl">
            <div className="bg-[var(--color-text-primary)] p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Phone simulator</span>
                <PhoneCall className="h-5 w-5 text-orange-300" />
              </div>
              <div className="mt-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/30">
                  <Phone className="h-9 w-9" />
                </div>
                <p className="mt-5 text-lg font-bold">{isCalling ? 'Call in progress' : 'Ready to call'}</p>
                <p className="mt-1 text-sm text-slate-300">{callId || 'No session started'}</p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <button type="button" onClick={startDemo} className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 btn-bouncy">
                <PhoneCall className="h-4 w-4" /> Start free demo call
              </button>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6'].map((digit) => (
                  <button key={digit} type="button" onClick={() => setDigits((value) => `${value}${digit}`)} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3 text-lg font-bold hover:border-[var(--color-accent-primary)]">
                    {digit}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendAnswer()} placeholder="Type the caller's answer" className="app-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm" />
                <button type="button" onClick={() => sendAnswer()} title="Send response" className="btn-accent rounded-xl px-4"><Send className="h-5 w-5" /></button>
              </div>
              <button type="button" onClick={reset} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <RotateCcw className="h-4 w-4" /> Reset session
              </button>
            </div>
          </section>

          <section className="app-card flex min-h-[520px] flex-col rounded-3xl p-6 sm:p-8">
            <div className="border-b border-[var(--color-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">Live prompt</p>
              <AnimatePresence mode="wait">
                <motion.p key={prompt} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-2xl font-bold leading-tight text-[var(--color-text-primary)]">“{prompt}”</motion.p>
              </AnimatePresence>
            </div>
            <div className="flex-1 space-y-3 overflow-auto py-5">
              {messages.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">Conversation turns will appear here during the demo.</p> : messages.map((message) => (
                <div key={message.id} className={`flex ${message.speaker === 'caller' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.speaker === 'caller' ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-primary)]'}`}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">{message.speaker}</p>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
              <Mic className="mr-1 inline h-3.5 w-3.5" /> Speech input is simulated by typing; keypad input is simulated with the buttons.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default IvrDemo;
