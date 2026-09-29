import React, { useState, useEffect, useEffectEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, GraduationCap, MapPin, Briefcase, CheckCircle, ArrowRight, ArrowLeft, Upload, ShieldCheck, LoaderCircle, RefreshCw } from 'lucide-react';
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
      familyOccupation: { field: 'familyOccupation', prompt: 'What is your family\'s traditional or main occupation?', helper: 'This is optional; you can leave it blank.' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'What is your current household income range?', helper: 'Mention your approximate income range.' },
      skills: { field: 'skills', prompt: 'Which skills do you already have?', helper: 'List your skills, separated by commas.' },
      traditionalSkills: { field: 'traditionalSkills', prompt: 'Do you have traditional or community skills?', helper: 'List any traditional skills, separated by commas, or leave blank.' },
      interests: { field: 'interests', prompt: 'What kinds of work interest you?', helper: 'List your work interests, separated by commas.' },
      aspirations: { field: 'aspirations', prompt: 'What work or livelihood do you hope to do?', helper: 'Describe your future work or livelihood goal.' },
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
      familyOccupation: { field: 'familyOccupation', prompt: 'आपके परिवार का पारंपरिक या मुख्य काम क्या है?', helper: 'यह वैकल्पिक है; चाहें तो खाली छोड़ें।' },
      currentIncomeRange: { field: 'currentIncomeRange', prompt: 'आपके परिवार की वर्तमान आय का स्तर क्या है?', helper: 'अपनी अनुमानित आय श्रेणी बताएं।' },
      skills: { field: 'skills', prompt: 'आपके पास कौन-कौन से कौशल हैं?', helper: 'कौशल comma से अलग करके लिखें।' },
      traditionalSkills: { field: 'traditionalSkills', prompt: 'क्या आपके पास पारंपरिक या सामुदायिक कौशल हैं?', helper: 'पारंपरिक कौशल comma से अलग लिखें या खाली छोड़ें।' },
      interests: { field: 'interests', prompt: 'आप किस तरह के काम में रुचि रखते हैं?', helper: 'अपनी काम की रुचियाँ comma से अलग लिखें।' },
      aspirations: { field: 'aspirations', prompt: 'आप भविष्य में कौन-सा काम या आजीविका करना चाहते हैं?', helper: 'अपने भविष्य के काम या आजीविका का लक्ष्य बताएं।' },
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
  3: ['currentOccupation', 'familyOccupation', 'currentIncomeRange'],
  4: ['skills', 'traditionalSkills', 'interests', 'aspirations', 'employmentPreference'],
};

const ProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [certificateStatus, setCertificateStatus] = useState('NOT_SUBMITTED');
  const [certificateIdentityConfirmed, setCertificateIdentityConfirmed] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateBusy, setCertificateBusy] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState(null);
  const [assistantFieldIndex, setAssistantFieldIndex] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [speechLang, setSpeechLang] = useState('hi-IN');
  const activeLanguagePrompts = PROFILE_ASSISTANT_PROMPTS[language] || PROFILE_ASSISTANT_PROMPTS.en;
  const currentFieldOrder = PROFILE_ASSISTANT_FIELD_ORDER[step] || ['age'];
  const currentFieldName = currentFieldOrder[assistantFieldIndex[step] ?? 0] || currentFieldOrder[0];
  const assistantQuestion = activeLanguagePrompts.fieldPrompt[currentFieldName]
    || PROFILE_ASSISTANT_PROMPTS.en.fieldPrompt[currentFieldName]
    || activeLanguagePrompts.fieldPrompt.age;

  const [formData, setFormData] = useState({
    personal: { age: '', gender: '' },
    education: { level: '', field: '' },
    location: { state: '', district: '', block: '', village: '' },
    livelihood: { currentOccupation: '', familyOccupation: '', currentIncomeRange: '' },
    skills: '',
    traditionalSkills: '',
    interests: '',
    aspirations: '',
    employmentPreference: '',
    preferredLanguage: 'Hindi',
    source: 'FORM',
  });

  const currentDistricts = INDIAN_STATES_DISTRICTS[formData.location.state] || [];

  const parseSpokenAge = (text) => {
    const normalized = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ');
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
    if (!normalized) return '';
    const stateKey = Object.keys(INDIAN_STATES_DISTRICTS).find((state) => {
      const stateNorm = state.toLowerCase();
      return stateNorm === normalized || stateNorm.includes(normalized) || normalized.includes(stateNorm);
    });
    return stateKey || '';
  };

  const findMatchingDistrict = (state, value) => {
    const stateDistricts = INDIAN_STATES_DISTRICTS[state] || [];
    const normalized = value.toLowerCase().trim();
    if (!normalized) return '';
    const district = stateDistricts.find((district) => {
      const districtNorm = district.toLowerCase();
      return districtNorm === normalized || districtNorm.includes(normalized) || normalized.includes(districtNorm);
    });
    return district || value;
  };

  const normalizeText = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  const parseSkillList = (value) => {
    const rawList = String(value || '')
      .replace(/\b(i have|i am|i know|my skills are|skills are|i can do|i can|my skill is|my skills|skill is|skills|know|can)\b/gi, ' ')
      .replace(/\b(and|plus|with|also|like|such as|for example|comma|commas)\b/gi, ',')
      .replace(/\s*[,/;&]+\s*/g, ',')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/\b(a|an|the)\b/gi, '').trim())
      .filter((item) => item.length > 2);

    if (!rawList.length) return value;

    const seen = new Set();
    const cleaned = rawList
      .map((item) => {
        const normalized = item.replace(/\s+/g, ' ').trim();
        const words = normalized.split(' ').filter(Boolean);
        const titleCased = words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return titleCased;
      })
      .filter((item) => {
        if (!item || seen.has(item.toLowerCase())) return false;
        seen.add(item.toLowerCase());
        return true;
      });

    return cleaned.join(', ');
  };

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
        if (normalized.includes('other') || normalized.includes('non binary') || normalized.includes('non-binary') || normalized.includes('अन्य')) return 'Other';
        return value;
      }
      case 'educationLevel': {
        const normalized = normalizeText(value);
        if (normalized.includes('post graduate') || normalized.includes('masters') || normalized.includes('postgraduate') || normalized.includes('स्नातकोत्तर')) return 'Post Graduate';
        if (normalized.includes('iti')) return 'ITI';
        if (normalized.includes('diploma')) return 'Diploma';
        if (normalized.includes('below 8') || normalized.includes('below eighth') || normalized.includes('आठवीं से कम')) return 'Below 8th';
        if (normalized.includes('8th') || normalized.includes('eighth') || normalized.includes('8 वीं') || normalized.includes('आठवीं')) return '8th Pass';
        if (normalized.includes('10th') || normalized.includes('matric') || normalized.includes('10 वीं') || normalized.includes('10th pass')) return '10th Pass';
        if (normalized.includes('12th') || normalized.includes('intermediate') || normalized.includes('12 वीं') || normalized.includes('12th pass')) return '12th Pass';
        if (normalized.includes('graduate') || normalized.includes('bachelor') || normalized.includes('स्नातक')) return 'Graduate';
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
      case 'familyOccupation': return value;
      case 'currentIncomeRange': {
        const normalized = normalizeText(value);
        if (normalized.includes('under 50000') || normalized.includes('less than 50000') || normalized.includes('below 50000') || (normalized.includes('50000') && normalized.includes('less'))) return '< 50000';
        if ((normalized.includes('50000') && normalized.includes('100000')) || (normalized.includes('50k') && normalized.includes('1 lakh')) || (normalized.includes('50 thousand') && normalized.includes('1 lakh'))) return '50000-100000';
        if ((normalized.includes('100000') && normalized.includes('200000')) || (normalized.includes('1 lakh') && normalized.includes('2 lakh')) || (normalized.includes('100k') && normalized.includes('200k'))) return '100000-200000';
        if (normalized.includes('above 200000') || normalized.includes('more than 200000') || (normalized.includes('2 lakh') && normalized.includes('more'))) return '> 200000';
        return value;
      }
      case 'skills': {
        const cleaned = parseSkillList(value);
        return cleaned;
      }
      case 'employmentPreference': {
        const normalized = normalizeText(value);
        if (normalized.includes('self employment') || normalized.includes('self job') || normalized.includes('business') || normalized.includes('entrepreneur') || normalized.includes('swavalamban') || normalized.includes('स्वरोजगार') || normalized.includes('व्यवसाय') || normalized.includes('उद्यम')) return 'SELF_EMPLOYMENT';
        if (normalized.includes('wage employment') || normalized.includes('job') || normalized.includes('salary') || normalized.includes('service') || normalized.includes('नौकरी') || normalized.includes('रोजगार') || normalized.includes('वेतन')) return 'WAGE_EMPLOYMENT';
        if (normalized.includes('hybrid') || normalized.includes('both') || normalized.includes('mix') || normalized.includes('दोनों') || normalized.includes('मिश्रित') || normalized.includes('hybrid job')) return 'HYBRID';
        if (normalized.includes('any') || normalized.includes('any opportunity') || normalized.includes('any job') || normalized.includes('किसी भी') || normalized.includes('किसी')) return 'ANY';
        return value;
      }
      default:
        return value;
    }
  };

  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await client.get('/beneficiaries/profile/me');
        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setCertificateStatus(p.verification?.scCertificateStatus || 'NOT_SUBMITTED');
          setCertificateIdentityConfirmed(p.verification?.scCertificateIdentityMatch === true);
          setMissingProfileFields(p.missingFields || []);
          setCorrectionRequests(p.correctionRequests || []);
          setFormData({
            personal: { age: p.personal?.age ?? '', gender: p.personal?.gender || '' },
            education: { level: p.education?.level || '', field: p.education?.field || '' },
            location: {
              state: p.location?.state || '',
              district: p.location?.district || '',
              block: p.location?.block || '',
              village: p.location?.village || '',
            },
            livelihood: {
              currentOccupation: p.livelihood?.currentOccupation || '',
              familyOccupation: p.livelihood?.familyOccupation || '',
              currentIncomeRange: p.livelihood?.currentIncomeRange || '',
            },
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : p.skills || '',
            traditionalSkills: Array.isArray(p.traditionalSkills) ? p.traditionalSkills.join(', ') : p.traditionalSkills || '',
            interests: Array.isArray(p.interests) ? p.interests.join(', ') : p.interests || '',
            aspirations: Array.isArray(p.aspirations) ? p.aspirations.join(', ') : p.aspirations || '',
            employmentPreference: p.employmentPreference || 'ANY',
            preferredLanguage: p.preferredLanguage || 'Hindi',
            source: p.source || 'FORM',
          });
          const preferredCode = String(p.preferredLanguage || '').toLowerCase().split(/[-_]/)[0];
          const matchingSpeechLanguage = SPEECH_LANGUAGES.find((item) => item.code.toLowerCase().startsWith(preferredCode));
          if (matchingSpeechLanguage) setSpeechLang(matchingSpeechLanguage.code);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setCertificateStatus('NOT_SUBMITTED');
        } else {
          toast.error(err.response?.data?.message || 'Could not load your saved profile.');
        }
      } finally {
        setFetching(false);
      }
    };
    fetchExistingProfile();
  }, []);

  const uploadCertificateBeforeProfile = async (event) => {
    event.preventDefault();
    if (!certificateFile) {
      setCertificateError('Choose an SC certificate image first.');
      return;
    }
    const formData = new FormData();
    formData.append('document', certificateFile);
    setCertificateBusy(true);
    setCertificateError('');
    try {
      await client.post('/documents/source-certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCertificateStatus('PENDING_REVIEW');
      setCertificateIdentityConfirmed(false);
      setCertificateFile(null);
      event.currentTarget.reset();
      toast.success('Certificate uploaded. An officer must verify the certificate and identity before profile filling.');
    } catch (error) {
      setCertificateError(error.response?.data?.message || 'Certificate upload failed.');
    } finally {
      setCertificateBusy(false);
    }
  };

  const refreshCertificateStatus = async () => {
    setCertificateBusy(true);
    setCertificateError('');
    try {
      const response = await client.get('/beneficiaries/profile/me');
      const verification = response.data.data?.verification || {};
      setCertificateStatus(verification.scCertificateStatus || 'NOT_SUBMITTED');
      setCertificateIdentityConfirmed(verification.scCertificateIdentityMatch === true);
    } catch (error) {
      if (error.response?.status === 404) {
        setCertificateStatus('NOT_SUBMITTED');
        setCertificateIdentityConfirmed(false);
      } else {
        setCertificateError(error.response?.data?.message || 'Could not refresh verification status.');
      }
    } finally {
      setCertificateBusy(false);
    }
  };

  useEffect(() => {
    if (fetching || (user?.role === 'BENEFICIARY' && (certificateStatus !== 'VERIFIED' || !certificateIdentityConfirmed)) || !assistantQuestion?.prompt) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;

    const utterance = new SpeechSynthesisUtterance(assistantQuestion.prompt);
    utterance.lang = speechLang;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utterance);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [assistantQuestion, certificateIdentityConfirmed, certificateStatus, fetching, speechLang, user?.role]);

  const handleStateChange = (newState) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, state: newState, district: prev.location.state === newState ? prev.location.district : '' },
    }));
  };

  const setProfileFieldValue = (field, value) => {
    switch (field) {
      case 'age':
        setFormData((prev) => ({ ...prev, personal: { ...prev.personal, age: value } }));
        break;
      case 'gender':
        setFormData((prev) => ({ ...prev, personal: { ...prev.personal, gender: value } }));
        break;
      case 'educationLevel':
        setFormData((prev) => ({ ...prev, education: { ...prev.education, level: value } }));
        break;
      case 'state':
        handleStateChange(findMatchingState(value) || value);
        break;
      case 'district':
        setFormData((prev) => ({ ...prev, location: { ...prev.location, district: value } }));
        break;
      case 'block':
        setFormData((prev) => ({ ...prev, location: { ...prev.location, block: value } }));
        break;
      case 'currentOccupation':
        setFormData((prev) => ({ ...prev, livelihood: { ...prev.livelihood, currentOccupation: value } }));
        break;
      case 'familyOccupation':
        setFormData((prev) => ({ ...prev, livelihood: { ...prev.livelihood, familyOccupation: value } }));
        break;
      case 'currentIncomeRange':
        setFormData((prev) => ({ ...prev, livelihood: { ...prev.livelihood, currentIncomeRange: value } }));
        break;
      case 'skills':
      case 'traditionalSkills':
      case 'interests':
      case 'aspirations':
        setFormData((prev) => ({ ...prev, [field]: value }));
        break;
      case 'employmentPreference':
        setFormData((prev) => ({ ...prev, employmentPreference: value }));
        break;
      default:
        break;
    }
  };

  const handleAssistantStepSelection = (nextStep) => {
    setStep(nextStep);
    setAssistantFieldIndex((prev) => ({ ...prev, [nextStep]: 0 }));
    setAssistantAnswer(null);
  };

  const advanceAssistantField = (fieldName, nextValue) => {
    setProfileFieldValue(fieldName, nextValue);
    setAssistantAnswer(null);

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

  const handleNavigatorProfileAnswer = useEffectEvent((event) => {
    const transcript = String(event.detail?.transcript || '').trim();
    if (!transcript) return;
    const field = assistantQuestion.field;
    const parsedValue = parseNaturalAnswer(field, transcript);
    advanceAssistantField(field, parsedValue || transcript);
  });

  useEffect(() => {
    window.addEventListener('navigator:profile-answer', handleNavigatorProfileAnswer);
    return () => window.removeEventListener('navigator:profile-answer', handleNavigatorProfileAnswer);
  }, []);

  const applyAssistantAnswer = () => {
    const rawValue = String(assistantAnswer ?? '').trim();
    if (!rawValue) {
      const optionalFields = ['currentOccupation', 'familyOccupation', 'currentIncomeRange', 'traditionalSkills'];
      if (!optionalFields.includes(assistantQuestion.field)) {
        toast.error('Please answer the question first.');
        return;
      }
      advanceAssistantField(assistantQuestion.field, '');
      return;
    }

    const parsedValue = parseNaturalAnswer(assistantQuestion.field, rawValue);
    const value = parsedValue || rawValue;
    advanceAssistantField(assistantQuestion.field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ageText = String(formData.personal.age).trim();
    const age = Number(ageText);
    if (!ageText || !Number.isInteger(age) || age < 0 || age > 130) {
      toast.error('Enter a valid age between 0 and 130.');
      setStep(1);
      setAssistantFieldIndex((previous) => ({ ...previous, 1: 0 }));
      return;
    }
    if (!formData.education.level) {
      toast.error('Select your highest completed education level.');
      setStep(2);
      setAssistantFieldIndex((previous) => ({ ...previous, 2: 0 }));
      return;
    }
    if (!formData.location.state.trim() || !formData.location.district.trim()) {
      toast.error('Enter your state and district.');
      setStep(2);
      setAssistantFieldIndex((previous) => ({ ...previous, 2: !formData.location.state.trim() ? 1 : 2 }));
      return;
    }
    if (!formData.skills.trim() && !formData.traditionalSkills.trim()) {
      toast.error('Add at least one current or traditional skill.');
      setStep(4);
      setAssistantFieldIndex((previous) => ({ ...previous, 4: 0 }));
      return;
    }
    if (!formData.interests.trim()) {
      toast.error('Add at least one work interest.');
      setStep(4);
      setAssistantFieldIndex((previous) => ({ ...previous, 4: 2 }));
      return;
    }
    if (!formData.aspirations.trim()) {
      toast.error('Add at least one livelihood goal.');
      setStep(4);
      setAssistantFieldIndex((previous) => ({ ...previous, 4: 3 }));
      return;
    }
    if (!formData.employmentPreference) {
      toast.error('Choose the type of work you prefer.');
      setStep(4);
      setAssistantFieldIndex((previous) => ({ ...previous, 4: 4 }));
      return;
    }
    setLoading(true);

    const payload = {
      personal: {
        age,
        ...(formData.personal.gender ? { gender: formData.personal.gender } : {}),
      },
      education: formData.education,
      location: formData.location,
      livelihood: formData.livelihood,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      traditionalSkills: formData.traditionalSkills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map((s) => s.trim()).filter(Boolean),
      aspirations: formData.aspirations.split(',').map((s) => s.trim()).filter(Boolean),
      employmentPreference: formData.employmentPreference,
      preferredLanguage: speechLang.split('-')[0],
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
      familyOccupation: formData.livelihood.familyOccupation,
      currentIncomeRange: formData.livelihood.currentIncomeRange,
      skills: formData.skills,
      traditionalSkills: formData.traditionalSkills,
      interests: formData.interests,
      aspirations: formData.aspirations,
      employmentPreference: formData.employmentPreference,
    }[field];

    const fieldClassName = 'w-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary)]/20 rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] font-medium outline-none';

    switch (field) {
      case 'gender':
        return (
          <select
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            className={fieldClassName}
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        );
      case 'educationLevel':
        return (
          <select
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            className={fieldClassName}
          >
            <option value="">Select education level</option>
            <option value="Below 8th">Below 8th</option>
            <option value="8th Pass">8th Pass</option>
            <option value="10th Pass">10th Pass</option>
            <option value="12th Pass">12th Pass</option>
            <option value="ITI">ITI</option>
            <option value="Diploma">Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        );
      case 'state':
        return (
          <input
            list="profile-state-options"
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            placeholder="Type your state"
            className={fieldClassName}
          />
        );
      case 'district':
        return (
          <input
            list="profile-district-options"
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            placeholder="Type your district"
            className={fieldClassName}
          />
        );
      case 'currentOccupation':
      case 'block':
        return (
          <input
            type="text"
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            placeholder={assistantQuestion.helper}
            className={fieldClassName}
          />
        );
      case 'currentIncomeRange':
        return (
          <select
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            className={fieldClassName}
          >
            <option value="">Select income range</option>
            <option value="< 50000">&lt; ₹50,000</option>
            <option value="50000-100000">₹50,000 - ₹1,00,000</option>
            <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
            <option value="> 200000">&gt; ₹2,00,000</option>
          </select>
        );
      case 'employmentPreference':
        return (
          <select
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            className={fieldClassName}
          >
            <option value="">Select work preference</option>
            <option value="SELF_EMPLOYMENT">Self-employment</option>
            <option value="WAGE_EMPLOYMENT">Wage employment</option>
            <option value="HYBRID">Both</option>
            <option value="ANY">Open to any</option>
          </select>
        );
      default:
        return (
          <input
            type={field === 'age' ? 'number' : 'text'}
            min={field === 'age' ? 0 : undefined}
            max={field === 'age' ? 130 : undefined}
            value={assistantAnswer ?? currentValue ?? ''}
            onChange={(e) => { setAssistantAnswer(e.target.value); setProfileFieldValue(field, e.target.value); }}
            placeholder={assistantQuestion.helper}
            className={fieldClassName}
          />
        );
    }
  };

  const locationOptions = (
    <>
      <datalist id="profile-state-options">
        {Object.keys(INDIAN_STATES_DISTRICTS).map((state) => <option key={state} value={state} />)}
      </datalist>
      <datalist id="profile-district-options">
            {currentDistricts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
      </datalist>
    </>
  );

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-10 h-10 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'BENEFICIARY' && (certificateStatus !== 'VERIFIED' || !certificateIdentityConfirmed)) {
    const isPending = certificateStatus === 'PENDING_REVIEW';
    const isRejected = certificateStatus === 'REJECTED';
    return (
      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-4 py-10 bg-[var(--color-bg)]">
        <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-8">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">Required before profile setup</p>
              <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Verify your SC certificate</h1>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              Upload your certificate first. Profile questions and livelihood recommendations unlock after an officer confirms the document and matches its identity details to your account.
            </p>

            <div className={`rounded-xl border p-4 text-sm font-semibold ${isPending ? 'border-amber-300 bg-amber-50 text-amber-800' : isRejected ? 'border-red-300 bg-red-50 text-red-800' : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'}`}>
              {isPending
                ? 'Certificate received. Waiting for officer verification.'
                : isRejected
                  ? 'The submitted certificate was rejected. Review the officer feedback and upload a corrected image.'
                  : certificateStatus === 'VERIFIED'
                    ? 'Certificate authenticity was reviewed, but the identity match is not yet confirmed. Please contact an officer.'
                    : 'No certificate has been submitted yet.'}
            </div>

            {certificateStatus !== 'PENDING_REVIEW' && (
              <form onSubmit={uploadCertificateBeforeProfile} className="space-y-4">
                <label className="block text-sm font-bold text-[var(--color-text-secondary)]">
                  SC certificate image (JPEG, PNG, or WebP; maximum 5 MB)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setCertificateFile(event.target.files?.[0] || null)}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                <button type="submit" disabled={certificateBusy || !certificateFile} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-secondary)] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {certificateBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload certificate
                </button>
              </form>
            )}

            {isPending && (
              <button type="button" onClick={refreshCertificateStatus} disabled={certificateBusy} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-primary)] disabled:opacity-60">
                {certificateBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Check verification status
              </button>
            )}

            {certificateError && <p role="alert" className="text-sm font-semibold text-red-700">{certificateError}</p>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 bg-[var(--color-bg)]">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('profileTitle')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">{t('profileSub')}</p>
        <div className="mt-4 space-y-3">
          {missingProfileFields.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-[var(--color-text-primary)]">Profile completeness</p>
                <span className="text-xs font-bold text-[var(--color-accent-primary)]">{Math.round(((10 - missingProfileFields.length) / 10) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                <div className="h-full rounded-full bg-[var(--color-accent-primary)]" style={{ width: `${Math.round(((10 - missingProfileFields.length) / 10) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Still needed: {missingProfileFields.map((field) => field.label).join(', ')}</p>
            </div>
          )}
          {correctionRequests.filter((request) => request.status === 'PENDING').map((request) => (
            <div key={request._id} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <p className="text-sm font-extrabold">Officer requested profile corrections</p>
              <p className="mt-1 text-xs">Reason: {request.reason}</p>
              <p className="mt-1 text-xs">Please update only: {request.fields.map((field) => {
                const labels = {
                  'personal.age': 'Age', 'personal.gender': 'Gender', 'education.level': 'Education level', 'education.field': 'Education field',
                  'location.state': 'State', 'location.district': 'District', 'location.block': 'Block', 'location.village': 'Village',
                  'livelihood.currentOccupation': 'Current occupation', 'livelihood.familyOccupation': 'Family occupation',
                  'livelihood.currentIncomeRange': 'Income range', skills: 'Skills', traditionalSkills: 'Traditional skills',
                  interests: 'Work interests', aspirations: 'Livelihood goals', employmentPreference: 'Employment preference',
                };
                return labels[field] || field;
              }).join(', ')}.</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {steps.map((s, idx) => {
          const isDone = step > idx + 1;
          const isCurrent = step === idx + 1;
          return (
            <div
              key={idx}
              onClick={() => handleAssistantStepSelection(idx + 1)}
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

              </div>

              <div className="space-y-4">
                <label className="block text-xs font-extrabold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {assistantQuestion.helper}
                </label>
                {renderCurrentFieldInput()}
                {locationOptions}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => handleAssistantStepSelection(step - 1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] hover:opacity-90 text-sm font-extrabold btn-bouncy"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backBtn')}</span>
              </button>
            ) : <div />}

            {step < 4 || (assistantFieldIndex[4] ?? 0) < currentFieldOrder.length - 1 ? (
              <button
                type="button"
                onClick={applyAssistantAnswer}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl btn-accent font-extrabold text-sm shadow-md btn-bouncy"
              >
                <span>{step < 4 ? t('nextSectionBtn') : 'Next question'}</span>
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
