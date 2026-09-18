import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SPEECH_CODES = {
  en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
  gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN', or: 'or-IN', bho: 'hi-IN', mag: 'hi-IN', bns: 'hi-IN',
};

const COMMANDS = [
  { terms: ['sign up', 'register', 'signup', 'पंजीकरण', 'रजिस्टर', 'रजिस्टर करीं', 'पंजीकरण करी', 'पंजीकरण करूं', 'नाम लिखाओ', 'नाम लिखाव'], path: '/register', responseKey: 'signup' },
  { terms: ['log in', 'login', 'sign in', 'लॉग इन', 'लॉगिन करीं', 'लॉगिन करूं', 'अंदर जाओ', 'अंदर जाव'], path: '/login', responseKey: 'login' },
  { terms: ['profile', 'प्रोफाइल', 'प्रोफाइल खोलीं', 'प्रोफाइल खोलूं', 'मेरी जानकारी', 'अपनी जानकारी'], path: '/profile', responseKey: 'profile' },
  { terms: ['recommendation', 'recommendations', 'सिफारिश', 'सुझाव', 'सिफारिश देखीं', 'सुझाव देखी', 'सुझाव देखौ', 'सलाह देखौ'], path: '/recommendations', responseKey: 'recommendations' },
  { terms: ['roadmap', 'journey', 'यात्रा', 'रोजगार यात्रा', 'यात्रा खोलीं', 'रोडमैप देखी', 'अपनी यात्रा', 'रस्ता देखौ'], path: '/roadmap', responseKey: 'journey' },
  { terms: ['ivr', 'voice demo', 'फोन डेमो', 'आवाज डेमो', 'फोन वाला डेमो', 'बोलने वाला डेमो'], path: '/ivr-demo', responseKey: 'voiceDemo' },
  { terms: ['certificate', 'verify', 'प्रमाणपत्र', 'सर्टिफिकेट', 'प्रमाणपत्र जांचीं', 'प्रमाणपत्र जांचौ'], path: '/certificate-verifier', responseKey: 'certificate' },
  { terms: ['home', 'landing', 'मुख्य पृष्ठ', 'घर', 'मुख्य पन्ना', 'घरे चलीं', 'घर चलौ', 'मुख्य जगह'], path: '/', responseKey: 'home' },
];

const RESPONSES = {
  en: { signup: 'Opening signup.', login: 'Opening login.', profile: 'Opening your profile.', recommendations: 'Opening recommendations.', journey: 'Opening your livelihood journey.', voiceDemo: 'Opening the voice demo.', certificate: 'Opening certificate verification.', home: 'Opening the home page.', unknown: 'I heard you, but I do not recognize that command yet.' },
  hi: { signup: 'साइन अप खोल रहा हूं।', login: 'लॉगिन खोल रहा हूं।', profile: 'आपकी प्रोफाइल खोल रहा हूं।', recommendations: 'सिफारिशें खोल रहा हूं।', journey: 'आपकी आजीविका यात्रा खोल रहा हूं।', voiceDemo: 'वॉयस डेमो खोल रहा हूं।', certificate: 'प्रमाणपत्र सत्यापन खोल रहा हूं।', home: 'मुख्य पृष्ठ खोल रहा हूं।', unknown: 'मैंने आपकी बात सुनी, लेकिन यह आदेश समझ नहीं आया।' },
  bho: { signup: 'साइन अप खोलत बानी।', login: 'लॉगिन खोलत बानी।', profile: 'रउरा प्रोफाइल खोलत बानी।', recommendations: 'सुझाव खोलत बानी।', journey: 'रउरा आजीविका यात्रा खोलत बानी।', voiceDemo: 'आवाज डेमो खोलत बानी।', certificate: 'प्रमाणपत्र जांच खोले के बा।', home: 'मुख्य पन्ना खोलत बानी।', unknown: 'हम रउरा बात सुननी, बाकिर ई आदेश समझ में ना आइल।' },
  mag: { signup: 'साइन अप खोल रहल हिअइ।', login: 'लॉगिन खोल रहल हिअइ।', profile: 'अहाँक प्रोफाइल खोल रहल हिअइ।', recommendations: 'सुझाव खोल रहल हिअइ।', journey: 'अहाँक आजीविका यात्रा खोल रहल हिअइ।', voiceDemo: 'आवाज डेमो खोल रहल हिअइ।', certificate: 'प्रमाणपत्र जांच खोल रहल हिअइ।', home: 'मुख्य पन्ना खोल रहल हिअइ।', unknown: 'हम अहाँक बात सुनली, मुदा ई आदेश समझ में नै अइल।' },
  bns: { signup: 'नाम लिखाने का पन्ना खोल रए हैं।', login: 'लॉगिन खोल रए हैं।', profile: 'आपकी जानकारी खोल रए हैं।', recommendations: 'सुझाव खोल रए हैं।', journey: 'आपकी आजीविका यात्रा खोल रए हैं।', voiceDemo: 'बोलने वाला डेमो खोल रए हैं।', certificate: 'प्रमाणपत्र जांच खोल रए हैं।', home: 'घर वाला पन्ना खोल रए हैं।', unknown: 'आपकी बात सुन ली, पर ई बात समझ में नइ आई।' },
};

const ACTION_PHRASES = {
  about: ['about', 'हमारे बारे में', 'हमर बारे में', 'हमार बारे में', 'हमाई जानकारी'],
  features: ['features', 'why it matters', 'सुविधाएं', 'खासियत'],
  top: ['top', 'ऊपर', 'ऊपर चलो', 'ऊपर जाओ'],
  back: ['go back', 'back', 'पीछे', 'पाछे जाओ', 'पाछू जाओ'],
  logout: ['logout', 'log out', 'लॉग आउट', 'बाहर निकलो'],
  submit: ['submit', 'save', 'save profile', 'सहेजें', 'सेव करो', 'जमा करो', 'बचाओ'],
  next: ['next', 'next section', 'अगला', 'आगे बढ़ो', 'अगिला'],
  previous: ['previous', 'previous section', 'back section', 'पिछला', 'पाछला'],
  retry: ['retry', 'try again', 'फिर कोशिश', 'दोबारा'],
  enroll: ['enroll', 'join course', 'नामांकन', 'दाखिला', 'जुड़ो'],
  recommendationsFilter: ['show recommendations', 'courses', 'पाठ्यक्रम', 'कोर्स'],
  centersFilter: ['training centers', 'centres', 'केंद्र', 'प्रशिक्षण केंद्र'],
  opportunitiesFilter: ['jobs', 'employment', 'काम', 'रोजगार'],
};

const includesPhrase = (text, phrases) => phrases.some((phrase) => text.includes(phrase));

const clickMatchingControl = (labels) => {
  const controls = [...document.querySelectorAll('button, input[type="submit"], a')];
  const control = controls.find((element) => {
    const label = `${element.innerText || ''} ${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''}`.toLowerCase();
    return labels.some((value) => label.includes(value));
  });
  if (!control) return false;
  control.click();
  return true;
};

const getRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('Ask me to open a page or start your livelihood journey.');

  const speak = (text) => {
    setMessage(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_CODES[language] || 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = (spokenText) => {
    const normalized = spokenText.toLowerCase();

    if (includesPhrase(normalized, ACTION_PHRASES.about)) {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
      speak('Opening the about section.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.features)) {
      document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' });
      speak('Opening the features section.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.top)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      speak('Moving to the top.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.back)) {
      window.history.back();
      speak('Going back.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.logout)) {
      if (clickMatchingControl(['logout', 'लॉग आउट'])) speak('Logging out.');
      else speak('There is no active login to close.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.submit)) {
      if (clickMatchingControl(['save & generate', 'save profile', 'submit', 'register', 'get started', 'log in'])) speak('Submitting the current form.');
      else speak('I could not find a form to submit on this page.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.next)) {
      if (clickMatchingControl(['next section', 'next'])) speak('Moving to the next section.');
      else speak('There is no next section available here.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.previous)) {
      if (clickMatchingControl(['back', 'previous'])) speak('Moving to the previous section.');
      else speak('There is no previous section available here.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.retry)) {
      if (clickMatchingControl(['retry', 'try again', 'फिर प्रयास'])) speak('Trying again.');
      else speak('There is nothing to retry on this page.');
      return;
    }
    if (includesPhrase(normalized, ACTION_PHRASES.enroll)) {
      if (clickMatchingControl(['enroll in training', 'enroll', 'दाखिला'])) speak('Opening enrollment.');
      else speak('I could not find an enrollment action here.');
      return;
    }
    if (location.pathname === '/recommendations' && includesPhrase(normalized, ACTION_PHRASES.centersFilter)) {
      if (clickMatchingControl(['training centres', 'training centers', 'प्रशिक्षण केंद्र'])) speak('Showing training centres.');
      else speak('The training centre filter is not available yet.');
      return;
    }
    if (location.pathname === '/recommendations' && includesPhrase(normalized, ACTION_PHRASES.opportunitiesFilter)) {
      if (clickMatchingControl(['employment opportunities', 'employment', 'रोजगार अवसर'])) speak('Showing employment opportunities.');
      else speak('The employment filter is not available yet.');
      return;
    }
    const command = COMMANDS.find((item) => item.terms.some((term) => normalized.includes(term)));
    if (command) {
      const responseSet = RESPONSES[language] || RESPONSES.hi;
      speak(responseSet[command.responseKey] || RESPONSES.en[command.responseKey]);
      window.setTimeout(() => navigate(command.path), 450);
      return;
    }
    const responseSet = RESPONSES[language] || RESPONSES.hi;
    speak(responseSet.unknown);
  };

  const startListening = () => {
    const Recognition = getRecognition();
    if (!Recognition) {
      speak('Voice control is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new Recognition();
    recognition.lang = SPEECH_CODES[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      setTranscript(spokenText);
      handleCommand(spokenText);
    };
    recognition.onerror = () => {
      setIsListening(false);
      speak('I could not hear that clearly. Please try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className="voice-assistant" aria-live="polite">
      {isOpen && (
        <div className="voice-assistant-panel">
          <div className="voice-assistant-heading">
            <div>
              <strong>Talk to Navigator</strong>
              <span>Voice-enabled website control</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} title="Close voice assistant" aria-label="Close voice assistant">
              <X size={17} />
            </button>
          </div>
          <p>{message}</p>
          {transcript && <small>“{transcript}”</small>}
          <button type="button" className={`voice-listen-button ${isListening ? 'is-listening' : ''}`} onClick={startListening}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Listening...' : 'Speak a command'}
          </button>
          <div className="voice-assistant-hint"><Volume2 size={14} /> Try: “open recommendations”</div>
        </div>
      )}
      <button type="button" className={`voice-assistant-trigger ${isListening ? 'is-listening' : ''}`} onClick={() => setIsOpen((value) => !value)} title="Talk to Navigator" aria-label="Talk to Navigator">
        {isOpen ? <X size={21} /> : <Mic size={21} />}
      </button>
    </div>
  );
}
