import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { User, GraduationCap, MapPin, Briefcase, Mic, MicOff, CheckCircle, ArrowRight, ArrowLeft, Volume2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION:
  - Page Background: var(--color-bg) [#FFF8F0 light / #14141F dark]
  - Card Surface: var(--color-surface) [#FFFFFF light / #1E1E2E dark]
  - Primary Text (Headings): var(--color-text-primary) [#1A1A2E light / #FAFAFA dark]
  - Secondary Text (Body/Labels): var(--color-text-secondary) [#4A4A5E light / #C4C4D4 dark]
  - Muted Text (Placeholders): var(--color-text-muted) [#8B8B9E both]
  - Primary Accent Button: var(--color-accent-primary) [#E85D2E light / #FF8B5E dark]
  - Secondary Accent: var(--color-accent-secondary) [#0F766E light / #2DD4BF dark]
  - Border Color: var(--color-border) [#E8E2D9 light / #2E2E42 dark]
*/

const INDIAN_STATES_DISTRICTS = {
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Ujjain', 'Gwalior', 'Jabalpur', 'Sagar', 'Satna', 'Rewa'],
  'Bihar': ['Patna', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Rohtas'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Agra', 'Prayagraj', 'Gorakhpur', 'Noida'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Hooghly', 'Darjeeling', 'Murshidabad'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
};

const SPEECH_LANGUAGES = [
  { code: 'en-IN', label: 'English (en-IN)' },
  { code: 'hi-IN', label: 'हिन्दी (hi-IN)' },
  { code: 'bn-IN', label: 'বাংলা (bn-IN)' },
  { code: 'mr-IN', label: 'मराठी (mr-IN)' },
  { code: 'ta-IN', label: 'தமிழ் (ta-IN)' },
  { code: 'te-IN', label: 'తెలుగు (te-IN)' },
  { code: 'gu-IN', label: 'ગુજરાતી (gu-IN)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (kn-IN)' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (pa-IN)' },
  { code: 'or-IN', label: 'ଓଡ଼ିଆ (or-IN)' },
  { code: 'bho-IN', label: 'भोजपुरी (bho-IN)' },
  { code: 'mag-IN', label: 'मगही (mag-IN)' },
  { code: 'bns-IN', label: 'बुंदेली (bns-IN)' },
];

const PROFILE_ASSISTANT_PROMPTS = {
  en: {
    title: 'Profile assistant',
    intro: 'I will ask a few quick questions to complete your profile in a simple and guided way.',
    fieldPrompt: {
      age: { field: 'age', prompt: 'What is your age?', helper: 'Type your age or say it out loud.' },
      gender: { field: 'gender', prompt: 'What is your gender?', helper: 'Choose or say your gender.' },
      educationLevel: { field: 'educationLevel', prompt: 'What is your education level?', helper: 'Tell us your highest completed education level.' },
      state: { field: 'state', prompt: 'Which state do you live in?', helper: 'Mention your state name.' },
      district: { field: 'district', prompt: 'Which district are you from?', helper: 'Mention your district name.' },
      block: { field: 'block', prompt: 'Which block or village are you from?', helper: 'Tell us your block or village name.' },
      currentOccupation: { field: 'currentOccupation', prompt: 'What is your current occupation?', helper: 'Tell us your main work or job.' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'What is your current household income range?', helper: 'Mention your approximate income range.' },
      skills: { field: 'skills', prompt: 'Which skills do you already have?', helper: 'List your skills, separated by commas.' },
      employmentPreference: { field: 'employmentPreference', prompt: 'What is your employment preference?', helper: 'Choose the type of work you prefer.' },
    },
  },
  hi: {
    title: 'प्रोफाइल सहायक',
    intro: 'मैं आपके प्रोफाइल को आसान और अनुशासित तरीके से भरने के लिए कुछ छोटी सवाल पूछूँगा।',
    fieldPrompt: {
      age: { field: 'age', prompt: 'आपकी आयु कितनी है?', helper: 'आयु लिखें या बोलकर बताएं।' },
      gender: { field: 'gender', prompt: 'आपका लिंग क्या है?', helper: 'अपना लिंग चुनें या बताएं।' },
      educationLevel: { field: 'educationLevel', prompt: 'आपका शिक्षा स्तर क्या है?', helper: 'आपके द्वारा पूरा किया गया सर्वोच्च शिक्षा स्तर बताएं।' },
      state: { field: 'state', prompt: 'आप किस राज्य में रहते हैं?', helper: 'अपना राज्य लिखें।' },
      district: { field: 'district', prompt: 'आप किस जिले से हैं?', helper: 'अपना जिला लिखें।' },
      block: { field: 'block', prompt: 'आपका ब्लॉक या गांव क्या है?', helper: 'अपने ब्लॉक या गांव का नाम बताएं।' },
      currentOccupation: { field: 'currentOccupation', prompt: 'आपका वर्तमान व्यवसाय क्या है?', helper: 'अपने मुख्य काम या नौकरी के बारे में बताएं।' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'आपके परिवार की वर्तमान आय का स्तर क्या है?', helper: 'अपनी अनुमानित आय श्रेणी बताएं।' },
      skills: { field: 'skills', prompt: 'आपके पास कौन-कौन से कौशल हैं?', helper: 'कौशल comma से अलग करके लिखें।' },
      employmentPreference: { field: 'employmentPreference', prompt: 'आपको किस प्रकार का रोजगार पसंद है?', helper: 'अपनी पसंदीदा रोजगार शैली चुनें।' },
    },
  },
  bho: {
    title: 'प्रोफाइल सहायक',
    intro: 'हमनी आपके प्रोफाइल के लिए कुछ सरल सवाल पूछतें, ताकि जल्दी से पूरा हो जाव।',
    fieldPrompt: {
      age: { field: 'age', prompt: 'तनी उम्र का कय是真的吗?', helper: 'उम्र लिखलें या बोल के बतावें।' },
      gender: { field: 'gender', prompt: 'तनी लिंग के बा?', helper: 'अपना लिंग चुनलें या बतावें।' },
      educationLevel: { field: 'educationLevel', prompt: 'तनी शिक्षा स्तर का कय बा?', helper: 'अपने सबसे ऊँच शिक्षा स्तर बतावें।' },
      state: { field: 'state', prompt: 'तुम कहिया राज्य में रहैत बानी?', helper: 'अपना राज्य लिखलें।' },
      district: { field: 'district', prompt: 'तुम कोन जिलवा से बा?', helper: 'अपना जिला लिखलें।' },
      block: { field: 'block', prompt: 'तनी ब्लॉक या गांव का नाम के बा?', helper: 'अपना ब्लॉक या गांव लिखलें।' },
      currentOccupation: { field: 'currentOccupation', prompt: 'तनी मौजूदन काम या आजीविका केतना बा?', helper: 'अपना मुख्य काम बतावें।' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'तनी परिवार की आय केतना बा?', helper: 'अपनी अनुमानित आय श्रेणी बतावें।' },
      skills: { field: 'skills', prompt: 'तनी के कौशल बा?', helper: 'कौशल comma से अलग क के लिखलें।' },
      employmentPreference: { field: 'employmentPreference', prompt: 'तनी रोजगार पसंदीदा केन चीज बा?', helper: 'अपनी पसंदीदा रोजगार शैली चुनलें।' },
    },
  },
  mag: {
    title: 'प्रोफाइल सहयोगी',
    intro: 'हमनी आपके प्रोफाइल भरल के लिहाजे कुछ छोट सवाल पूछतब, ताकि जल्दी पूरा हो जए।',
    fieldPrompt: {
      age: { field: 'age', prompt: 'तनी उम्र केतना बा?', helper: 'उम्र लिखलें या बोल के बतावें।' },
      gender: { field: 'gender', prompt: 'तनी लिंग के बा?', helper: 'अपना लिंग चुनलें या बतावें।' },
      educationLevel: { field: 'educationLevel', prompt: 'तनी शिक्षा स्तर के बा?', helper: 'अपने उच्चतम शिक्षा स्तर बतावें।' },
      state: { field: 'state', prompt: 'अखर हम राज्य केमाँ रहीं?', helper: 'अपना राज्य लिखलें।' },
      district: { field: 'district', prompt: 'तनी जिला केमाँ बा?', helper: 'अपना जिला लिखलें।' },
      block: { field: 'block', prompt: 'तनी ब्लॉक या गाँव के बा?', helper: 'अपना ब्लॉक या गाँव लिखलें।' },
      currentOccupation: { field: 'currentOccupation', prompt: 'तनी वर्तमान काम के बा?', helper: 'अपना मुख्य काम बतावें।' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'तनी परिवार की आय केतना बा?', helper: 'अपनी अनुमानित आय श्रेणी बतावें।' },
      skills: { field: 'skills', prompt: 'तनी के कौशल बा?', helper: 'कौशल comma से अलग क लिखलें।' },
      employmentPreference: { field: 'employmentPreference', prompt: 'तनी रोजगार पसंद के बा?', helper: 'अपनी पसंदीदा रोजगार शैली चुनलें।' },
    },
  },
  bns: {
    title: 'प्रोफाइल सहायक',
    intro: 'हम तपाईं के प्रोफाइल भरने खातिर कुछ सरल सवाल पूछेंगे, ताकि जल्दी पूरा हो जाए।',
    fieldPrompt: {
      age: { field: 'age', prompt: 'तपाईं की उमर कत है?', helper: 'उमर लिखें या बोलकर बताइए।' },
      gender: { field: 'gender', prompt: 'तपाईं का लिंग क्या है?', helper: 'अपना लिंग चुनें या बताइए।' },
      educationLevel: { field: 'educationLevel', prompt: 'तपाईं का शिक्षा स्तर क्या है?', helper: 'अपने उच्चतम शिक्षा स्तर का उल्लेख करें।' },
      state: { field: 'state', prompt: 'तपाईं कउन राज्य में रहते हैं?', helper: 'अपना राज्य लिखें।' },
      district: { field: 'district', prompt: 'तपाईं का जिला कौन सा है?', helper: 'अपना जिला लिखें।' },
      block: { field: 'block', prompt: 'तपाईं का ब्लॉक या गाँव क्या है?', helper: 'अपना ब्लॉक या गाँव लिखें।' },
      currentOccupation: { field: 'currentOccupation', prompt: 'तपाईं का वर्तमान काम क्या है?', helper: 'अपना मुख्य काम बताइए।' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'तपाईं के परिवार की वर्तमान आय की श्रेणी क्या है?', helper: 'अपनी अनुमानित आय श्रेणी बताइए।' },
      skills: { field: 'skills', prompt: 'तपाईं के कौन-कौन से कौशल हैं?', helper: 'कौशलों को comma से अलग करके लिखें।' },
      employmentPreference: { field: 'employmentPreference', prompt: 'तपाईं को किस प्रकार का रोजगार पसंद है?', helper: 'अपनी पसंदीदा रोजगार शैली चुनें।' },
    },
  },
};

const PROFILE_ASSISTANT_FIELD_ORDER = {
  1: ['age', 'gender'],
  2: ['educationLevel', 'state', 'district', 'block'],
  3: ['currentOccupation', 'currentIncomeRange'],
  4: ['skills', 'employmentPreference'],
};

const ProfileForm = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [assistantFieldIndex, setAssistantFieldIndex] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const activeLanguagePrompts = PROFILE_ASSISTANT_PROMPTS[language] || PROFILE_ASSISTANT_PROMPTS.en;
  const currentFieldOrder = PROFILE_ASSISTANT_FIELD_ORDER[step] || ['age'];
  const currentFieldName = currentFieldOrder[assistantFieldIndex[step] ?? 0] || currentFieldOrder[0];
  const assistantQuestion = activeLanguagePrompts.fieldPrompt[currentFieldName] || activeLanguagePrompts.fieldPrompt.age;

  // Web Speech API state
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('hi-IN');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [activeVoiceField, setActiveVoiceField] = useState('skills');
  const recognitionRef = useRef(null);
  const activeVoiceFieldRef = useRef('skills');

  const [formData, setFormData] = useState({
    personal: { age: '', gender: 'Male' },
    education: { level: '10th Pass', field: 'General' },
    location: { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Fanda', village: 'Karond' },
    livelihood: { currentOccupation: 'Weaver', familyOccupation: 'Agriculture', currentIncomeRange: '< 50000' },
    skills: 'Weaving, Embroidery',
    traditionalSkills: 'Handloom',
    interests: 'Textiles, Tailoring',
    aspirations: 'Small Business Owner',
    employmentPreference: 'ANY',
    preferredLanguage: 'Hindi',
    source: 'FORM',
  });

  const currentDistricts = INDIAN_STATES_DISTRICTS[formData.location.state] || [
    'Bhopal', 'Indore', 'Patna', 'Muzaffarpur', 'Varanasi', 'Lucknow', 'Jaipur', 'Jodhpur',
  ];

  const parseSpokenAge = (text) => {
    const normalized = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const directMatch = normalized.match(/\b(\d{1,3})\b/);
    if (directMatch) return String(Number(directMatch[1]));

    const numberWords = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
      ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
      sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
      thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
      एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9,
      दस: 10, ग्यारह: 11, बारह: 12, तेरह: 13, चौदह: 14, पंद्रह: 15, पन्द्रह: 15,
      सोलह: 16, सत्रह: 17, अठारह: 18, उन्नीस: 19, बीस: 20, तीस: 30, चालीस: 40,
      पचास: 50, साठ: 60, सत्तर: 70, अस्सी: 80, नब्बे: 90,
      eka: 1, do: 2, teen: 3, char: 4, paanch: 5, chhah: 6, saat: 7, aath: 8, nau: 9,
      das: 10, gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16,
      satarah: 17, atharah: 18, unnis: 19, bees: 20, tees: 30, chalis: 40, pachas: 50,
      saath: 60, sattar: 70, assi: 80, nabbe: 90,
    };
    const words = normalized.split(/\s+/).filter(Boolean);
    const direct = words.find((word) => numberWords[word] !== undefined);
    if (direct) return String(numberWords[direct]);
    return '';
  };

  const findMatchingState = (value) => {
    const normalized = value.toLowerCase().trim();
    const stateKey = Object.keys(INDIAN_STATES_DISTRICTS).find((state) => {
      const stateNorm = state.toLowerCase();
      return stateNorm === normalized || stateNorm.includes(normalized) || normalized.includes(stateNorm);
    });
    return stateKey || '';
  };

  const findMatchingDistrict = (state, value) => {
    const stateDistricts = INDIAN_STATES_DISTRICTS[state] || [];
    const normalized = value.toLowerCase().trim();
    const district = stateDistricts.find((district) => {
      const districtNorm = district.toLowerCase();
      return districtNorm === normalized || districtNorm.includes(normalized) || normalized.includes(districtNorm);
    });
    return district || value;
  };

  const normalizeText = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const parseNaturalAnswer = (field, rawValue) => {
    if (!rawValue) return '';
    const value = String(rawValue).trim();

    switch (field) {
      case 'age': {
        const age = parseSpokenAge(value);
        return age || value;
      }
      case 'gender': {
        const normalized = normalizeText(value);
        if (normalized.includes('female') || normalized.includes('woman') || normalized.includes('girl') || normalized.includes('महिला') || normalized.includes('स्त्री')) return 'Female';
        if (normalized.includes('male') || normalized.includes('man') || normalized.includes('boy') || normalized.includes('पुरुष') || normalized.includes('male')) return 'Male';
        if (normalized.includes('other') || normalized.includes('non-binary') || normalized.includes('अन्य')) return 'Other';
        return value;
      }
      case 'educationLevel': {
        const normalized = normalizeText(value);
        if (normalized.includes('below 8') || normalized.includes('8th') || normalized.includes('below eighth') || normalized.includes('8 वीं') || normalized.includes('8th pass')) return 'Below 8th';
        if (normalized.includes('10th') || normalized.includes('matric') || normalized.includes('10 वीं') || normalized.includes('10th pass')) return '10th Pass';
        if (normalized.includes('12th') || normalized.includes('intermediate') || normalized.includes('12 वीं') || normalized.includes('12th pass')) return '12th Pass';
        if (normalized.includes('iti') || normalized.includes('diploma') || normalized.includes('iti diploma')) return 'ITI/Diploma';
        if (normalized.includes('graduate') || normalized.includes('bachelor') || normalized.includes('graduate') || normalized.includes('स्नातक')) return 'Graduate';
        if (normalized.includes('post graduate') || normalized.includes('masters') || normalized.includes('postgraduate')) return 'Post Graduate';
        return value;
      }
      case 'state': {
        const match = findMatchingState(value);
        return match || value;
      }
      case 'district': {
        const state = formData.location.state;
        return findMatchingDistrict(state, value);
      }
      case 'block': return value;
      case 'currentOccupation': return value;
      case 'currentIncomeRange': {
        const normalized = normalizeText(value);
        if (normalized.includes('under 50000') || normalized.includes('less than 50000') || normalized.includes('below 50000') || normalized.includes('50000') && normalized.includes('less')) return '< 50000';
        if (normalized.includes('50000') && normalized.includes('100000') || normalized.includes('50k') && normalized.includes('1 lakh') || normalized.includes('50 thousand') && normalized.includes('1 lakh')) return '50000-100000';
        if (normalized.includes('100000') && normalized.includes('200000') || normalized.includes('1 lakh') && normalized.includes('2 lakh') || normalized.includes('100k') && normalized.includes('200k')) return '100000-200000';
        if (normalized.includes('above 200000') || normalized.includes('more than 200000') || normalized.includes('2 lakh') && normalized.includes('more')) return '> 200000';
        return value;
      }
      case 'skills': return value;
      case 'employmentPreference': {
        const normalized = normalizeText(value);
        if (normalized.includes('self employment') || normalized.includes('self job') || normalized.includes('business') || normalized.includes('entrepreneur') || normalized.includes('swavalamban')) return 'SELF_EMPLOYMENT';
        if (normalized.includes('wage employment') || normalized.includes('job') || normalized.includes('salary') || normalized.includes('service')) return 'WAGE_EMPLOYMENT';
        if (normalized.includes('hybrid') || normalized.includes('both') || normalized.includes('mix')) return 'HYBRID';
        if (normalized.includes('any') || normalized.includes('any opportunity') || normalized.includes('any job')) return 'ANY';
        return value;
      }
      default:
        return value;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setFormData((prev) => ({ ...prev, source: 'VOICE' }));
        const selectedSpeechLanguage = SPEECH_LANGUAGES.find((item) => item.code === speechLang);
        toast.success(`Microphone active (${selectedSpeechLanguage?.label || speechLang})! Speak now.`, { id: 'speech-toast' });
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          currentTranscript += transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        setLiveTranscript(currentTranscript);

        if (currentTranscript.trim()) {
          mapTranscriptToFormState(currentTranscript.trim(), activeVoiceFieldRef.current);
        }

        if (finalTranscript.trim()) {
          const normalizedFinal = finalTranscript.trim();
          const parsedValue = parseNaturalAnswer(activeVoiceFieldRef.current, normalizedFinal);
          const committedValue = parsedValue || normalizedFinal;

          setAssistantAnswer(committedValue);
          advanceAssistantField(activeVoiceFieldRef.current, committedValue);
          recognition.stop();
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          toast.error(`Speech recognition: ${event.error}`, { id: 'speech-toast' });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [speechLang]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const speakPrompt = () => {
      if (isListening) return;
      const utterance = new SpeechSynthesisUtterance(assistantQuestion.prompt);
      utterance.lang = speechLang;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    speakPrompt();
  }, [assistantQuestion.prompt, isListening, speechLang]);

  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await client.get('/beneficiaries/profile/me');
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setFormData({
            personal: { age: p.personal?.age || '', gender: p.personal?.gender || 'Male' },
            education: { level: p.education?.level || '10th Pass', field: p.education?.field || 'General' },
            location: {
              state: p.location?.state || 'Madhya Pradesh',
              district: p.location?.district || 'Bhopal',
              block: p.location?.block || '',
              village: p.location?.village || '',
            },
            livelihood: {
              currentOccupation: p.livelihood?.currentOccupation || '',
              familyOccupation: p.livelihood?.familyOccupation || '',
              currentIncomeRange: p.livelihood?.currentIncomeRange || '< 50000',
            },
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '',
            traditionalSkills: Array.isArray(p.traditionalSkills) ? p.traditionalSkills.join(', ') : p.traditionalSkills || '',
            interests: Array.isArray(p.interests) ? p.interests.join(', ') : p.interests || '',
            aspirations: Array.isArray(p.aspirations) ? p.aspirations.join(', ') : p.aspirations || '',
            employmentPreference: p.employmentPreference || 'ANY',
            preferredLanguage: p.preferredLanguage || 'Hindi',
            source: p.source || 'FORM',
          });
        }
      } catch (err) {
        console.log('No pre-existing profile found, starting fresh form.');
      } finally {
        setFetching(false);
      }
    };
    fetchExistingProfile();
  }, []);

  const mapTranscriptToFormState = (text, targetField = activeVoiceField) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const normalizedValue = parseNaturalAnswer(targetField, text);

      if (targetField === 'skills') updated.skills = normalizedValue || text;
      else if (targetField === 'interests') updated.interests = normalizedValue || text;
      else if (targetField === 'aspirations') updated.aspirations = normalizedValue || text;
      else if (targetField === 'currentOccupation') updated.livelihood = { ...updated.livelihood, currentOccupation: normalizedValue || text };
      else if (targetField === 'age') {
        const parsedAge = parseSpokenAge(text);
        if (parsedAge) updated.personal = { ...updated.personal, age: parsedAge };
      } else if (targetField === 'gender') {
        const parsedGender = parseNaturalAnswer('gender', text);
        if (parsedGender) updated.personal = { ...updated.personal, gender: parsedGender };
      } else if (targetField === 'educationLevel') {
        const parsedEducation = parseNaturalAnswer('educationLevel', text);
        if (parsedEducation) updated.education = { ...updated.education, level: parsedEducation };
      } else if (targetField === 'state') {
        const parsedState = parseNaturalAnswer('state', text);
        if (parsedState) {
          const matchedState = findMatchingState(parsedState);
          const newState = matchedState || parsedState;
          const defaultDistrict = INDIAN_STATES_DISTRICTS[newState]?.[0] || updated.location.district || 'Bhopal';
          updated.location = { ...updated.location, state: newState, district: defaultDistrict };
        }
      } else if (targetField === 'district') {
        const parsedDistrict = parseNaturalAnswer('district', text);
        if (parsedDistrict) updated.location = { ...updated.location, district: parsedDistrict };
      } else if (targetField === 'block') updated.location = { ...updated.location, block: normalizedValue || text };
      else if (targetField === 'currentIncomeRange') {
        const parsedIncome = parseNaturalAnswer('currentIncomeRange', text);
        if (parsedIncome) updated.livelihood = { ...updated.livelihood, currentIncomeRange: parsedIncome };
      } else if (targetField === 'employmentPreference') {
        const parsedPreference = parseNaturalAnswer('employmentPreference', text);
        if (parsedPreference) updated.employmentPreference = parsedPreference;
      }
      return updated;
    });
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleStateChange = (newState) => {
    const defaultDistrict = INDIAN_STATES_DISTRICTS[newState]?.[0] || 'Default District';
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, state: newState, district: defaultDistrict },
    }));
  };

  const handleAssistantStepSelection = (nextStep) => {
    setStep(nextStep);
    setAssistantFieldIndex((prev) => ({ ...prev, [nextStep]: 0 }));
    setAssistantAnswer('');
  };

  const toggleSpeechRecognition = (targetField) => {
    activeVoiceFieldRef.current = targetField;
    setActiveVoiceField(targetField);
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        setLiveTranscript('');
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Speech start error:', err);
      }
    }
  };

  const advanceAssistantField = (fieldName, nextValue) => {
    const updateFieldValue = (field, nextValue) => {
      switch (field) {
        case 'age':
          setFormData((prev) => ({ ...prev, personal: { ...prev.personal, age: nextValue } }));
          break;
        case 'gender':
          setFormData((prev) => ({ ...prev, personal: { ...prev.personal, gender: nextValue } }));
          break;
        case 'educationLevel':
          setFormData((prev) => ({ ...prev, education: { ...prev.education, level: nextValue } }));
          break;
        case 'state': {
          const matchedState = findMatchingState(nextValue);
          if (matchedState) {
            handleStateChange(matchedState);
          } else {
            setFormData((prev) => ({
              ...prev,
              location: { ...prev.location, state: nextValue },
            }));
          }
          break;
        }
        case 'district':
          setFormData((prev) => ({ ...prev, location: { ...prev.location, district: nextValue } }));
          break;
        case 'block':
          setFormData((prev) => ({ ...prev, location: { ...prev.location, block: nextValue } }));
          break;
        case 'currentOccupation':
          setFormData((prev) => ({
            ...prev,
            livelihood: { ...prev.livelihood, currentOccupation: nextValue },
          }));
          break;
        case 'currentIncomeRange':
          setFormData((prev) => ({
            ...prev,
            livelihood: { ...prev.livelihood, currentIncomeRange: nextValue },
          }));
          break;
        case 'skills':
          setFormData((prev) => ({ ...prev, skills: nextValue }));
          break;
        case 'employmentPreference':
          setFormData((prev) => ({ ...prev, employmentPreference: nextValue }));
          break;
        default:
          break;
      }
    };

    updateFieldValue(fieldName, nextValue);
    setAssistantAnswer('');

    const nextIndex = (assistantFieldIndex[step] ?? 0) + 1;
    const totalFields = PROFILE_ASSISTANT_FIELD_ORDER[step]?.length || 1;

    if (nextIndex < totalFields) {
      setAssistantFieldIndex((prev) => ({ ...prev, [step]: nextIndex }));
      return;
    }

    setAssistantFieldIndex((prev) => ({ ...prev, [step]: 0 }));
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const applyAssistantAnswer = () => {
    const rawValue = assistantAnswer.trim();
    if (!rawValue) {
      toast.error('Please answer the question first.');
      return;
    }

    const parsedValue = parseNaturalAnswer(assistantQuestion.field, rawValue);
    const value = parsedValue || rawValue;
    advanceAssistantField(assistantQuestion.field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      personal: {
        age: Number(formData.personal.age) || 25,
        gender: formData.personal.gender,
      },
      education: formData.education,
      location: formData.location,
      livelihood: formData.livelihood,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      traditionalSkills: formData.traditionalSkills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map((s) => s.trim()).filter(Boolean),
      aspirations: formData.aspirations.split(',').map((s) => s.trim()).filter(Boolean),
      employmentPreference: formData.employmentPreference,
      preferredLanguage: formData.preferredLanguage,
      source: formData.source,
    };

    try {
      const res = await client.post('/beneficiaries/profile', payload);
      if (res.data.success) {
        toast.success('Beneficiary profile updated successfully!');
        navigate('/recommendations');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: t('personalTab'), icon: User },
    { title: t('educationTab'), icon: MapPin },
    { title: t('occupationTab'), icon: Briefcase },
    { title: t('skillsTab'), icon: GraduationCap },
  ];

  const renderCurrentFieldInput = () => {
    const field = assistantQuestion.field;
    const currentValue = {
      age: formData.personal.age,
      gender: formData.personal.gender,
      educationLevel: formData.education.level,
      state: formData.location.state,
      district: formData.location.district,
      block: formData.location.block,
      currentOccupation: formData.livelihood.currentOccupation,
      currentIncomeRange: formData.livelihood.currentIncomeRange,
      skills: formData.skills,
      employmentPreference: formData.employmentPreference,
    }[field];

    const fieldClassName = 'w-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-medium outline-none';

    switch (field) {
      case 'gender':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        );
      case 'educationLevel':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            <option value="Below 8th">Below 8th</option>
            <option value="8th Pass">8th Pass</option>
            <option value="10th Pass">10th Pass</option>
            <option value="12th Pass">12th Pass</option>
            <option value="ITI/Diploma">ITI / Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        );
      case 'state':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        );
      case 'district':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            {currentDistricts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        );
      case 'currentIncomeRange':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            <option value="< 50000">&lt; ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹1,00,000</option>
            <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
            <option value="> 200000">&gt; ₹2,00,000</option>
          </select>
        );
      case 'employmentPreference':
        return (
          <select
            value={currentValue}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            className={fieldClassName}
          >
            <option value="SELF_EMPLOYMENT">SELF_EMPLOYMENT</option>
            <option value="WAGE_EMPLOYMENT">WAGE_EMPLOYMENT</option>
            <option value="HYBRID">HYBRID</option>
            <option value="ANY">ANY</option>
          </select>
        );
      default:
        return (
          <input
            type={field === 'age' ? 'number' : 'text'}
            value={currentValue || assistantAnswer}
            onChange={(e) => setAssistantAnswer(e.target.value)}
            placeholder={assistantQuestion.helper}
            className={fieldClassName}
          />
        );
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-10 h-10 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('profileTitle')}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">{t('profileSub')}</p>
        </div>

        {/* Voice Controls & Language Switcher */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] shadow-xs">
            <Globe className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
            <select
              value={speechLang}
              onChange={(event) => {
                setSpeechLang(event.target.value);
                const selected = SPEECH_LANGUAGES.find((item) => item.code === event.target.value);
                toast.success(`Speech language changed to ${selected?.label || event.target.value}`);
              }}
              aria-label="Speech language"
              className="bg-transparent outline-none cursor-pointer"
            >
              {SPEECH_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSpeechRecognition('skills')}
            type="button"
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-extrabold transition-all btn-bouncy ${
              isListening
                ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                : 'bg-[var(--color-surface)] text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white animate-bounce" />
                <span>Mic Active (Stop)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                <span>Web Speech Mic</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
              {activeLanguagePrompts.title}
            </p>
            <h2 className="mt-2 text-xl font-black text-[var(--color-text-primary)]">
              {assistantQuestion.prompt}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{assistantQuestion.helper}</p>
          </div>
          <button
            type="button"
            onClick={() => toggleSpeechRecognition(assistantQuestion.field)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold border ${
              isListening
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'border-[var(--color-accent-secondary)] bg-[var(--color-bg)] text-[var(--color-accent-secondary)]'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {isListening ? 'Listening' : 'Speak'}
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={assistantAnswer}
            onChange={(event) => setAssistantAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyAssistantAnswer();
              }
            }}
            placeholder={assistantQuestion.helper}
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20"
          />
          <button
            type="button"
            onClick={applyAssistantAnswer}
            className="rounded-xl bg-[var(--color-accent-primary)] px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
          >
            Next
          </button>
        </div>
      </div>

      {/* Live Voice Transcription Banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-[var(--color-surface)] border border-[var(--color-accent-secondary)] rounded-2xl p-4 flex items-center space-x-3 shadow-md"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-secondary)] text-white flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-[var(--color-accent-secondary)] uppercase tracking-wider">
                Listening ({SPEECH_LANGUAGES.find((item) => item.code === speechLang)?.label || speechLang}) → Target Field: <span className="underline">{activeVoiceField}</span>
              </p>
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate mt-0.5">
                {liveTranscript ? `"${liveTranscript}"` : 'Speak into microphone to populate field live...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {steps.map((s, idx) => {
          const isDone = step > idx + 1;
          const isCurrent = step === idx + 1;
          return (
            <div
              key={idx}
              onClick={() => setStep(idx + 1)}
              className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                isCurrent
                  ? 'btn-accent shadow-md'
                  : isDone
                  ? 'badge-secondary'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]'
              }`}
            >
              <div className="flex justify-center mb-1">
                {isDone ? <CheckCircle className="w-4 h-4 text-[var(--color-accent-secondary)]" /> : <s.icon className="w-4 h-4" />}
              </div>
              <p className="text-[11px] font-extrabold tracking-wider uppercase">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg relative overflow-hidden">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${step}-${assistantQuestion.field}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent-primary)]">
                    {activeLanguagePrompts.title}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-[var(--color-text-primary)] flex items-center space-x-2">
                    <span>{assistantQuestion.prompt}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSpeechRecognition(assistantQuestion.field)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold border ${
                    isListening
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-[var(--color-accent-secondary)] bg-[var(--color-bg)] text-[var(--color-accent-secondary)]'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  {isListening ? 'Listening' : 'Speak'}
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {assistantQuestion.helper}
                </label>
                {renderCurrentFieldInput()}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] hover:opacity-90 text-sm font-extrabold btn-bouncy"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backBtn')}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={applyAssistantAnswer}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl btn-accent font-extrabold text-sm shadow-md btn-bouncy"
              >
                <span>{t('nextSectionBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className="px-8 py-3 rounded-xl btn-accent font-black text-sm shadow-md flex items-center space-x-2 btn-bouncy"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('saveProfileBtn')}</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
