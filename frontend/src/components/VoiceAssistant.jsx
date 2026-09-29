import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SPEECH_CODES = {
  en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
  gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN', or: 'or-IN', bho: 'hi-IN', mag: 'hi-IN', bns: 'hi-IN',
};

const LANGUAGE_ALIASES = {
  en: ['english', 'switch to english', 'change language to english', 'change to english', 'अंग्रेज़ी', 'अंग्रेजी'],
  hi: ['hindi', 'हिंदी', 'हिन्दी', 'switch to hindi', 'change language to hindi', 'change to hindi', 'हिंदी भाषा'],
  mr: ['marathi', 'मराठी', 'switch to marathi', 'change to marathi', 'मराठी भाषा'],
  bn: ['bengali', 'bangla', 'বাংলা', 'switch to bengali', 'change to bengali', 'বাংলা ভাষা'],
  ta: ['tamil', 'தமிழ்', 'switch to tamil', 'change to tamil', 'தமிழ் மொழி'],
  te: ['telugu', 'తెలుగు', 'switch to telugu', 'change to telugu', 'తెలుగు భాష'],
  gu: ['gujarati', 'ગુજરાતી', 'switch to gujarati', 'change to gujarati', 'ગુજરાતી ભાષા'],
  kn: ['kannada', 'ಕನ್ನಡ', 'switch to kannada', 'change to kannada', 'ಕನ್ನಡ ಭಾಷೆ'],
  pa: ['punjabi', 'ਪੰਜਾਬੀ', 'switch to punjabi', 'change to punjabi', 'ਪੰਜਾਬੀ ਬੋਲੋ'],
  or: ['odia', 'ଓଡ଼ିଆ', 'switch to odia', 'change to odia', 'ଓଡ଼ିଆ ଭାଷା'],
  bho: ['bhojpuri', 'भोजपुरी', 'switch to bhojpuri', 'change to bhojpuri', 'भोजपुरी भाषा'],
  mag: ['magahi', 'मगही', 'switch to magahi', 'change to magahi', 'मगही भाषा'],
  bns: ['bundeli', 'बुंदेली', 'बुन्देली', 'switch to bundeli', 'change to bundeli', 'बुंदेली भाषा'],
};

const LANGUAGE_SWITCH_TEXT = {
  en: 'English selected.',
  hi: 'हिंदी भाषा चुन ली गई।',
  mr: 'मराठी भाषा निवडली आहे।',
  bn: 'বাংলা ভাষা নির্বাচন করা হয়েছে।',
  ta: 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.',
  te: 'తెలుగు భాష ఎంచుకున్నారు.',
  gu: 'ગુજરાતી ભાષા પસંદ છે.',
  kn: 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.',
  pa: 'ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਚੁਣੀ ਗਈ ਹੈ।',
  or: 'ଓଡ଼ିଆ ଭାଷା ଚୟନ କରାଯାଇଛି।',
  bho: 'भोजपुरी भाषा चुन ली गई।',
  mag: 'मगही भाषा चुन ली गई।',
  bns: 'बुंदेली भाषा चुन ली गई।',
};

const LANDING_GREETING = {
  en: 'How can I help you?',
  hi: 'मैं आपकी कैसे मदद कर सकता हूँ?',
  mr: 'मी तुम्हाला कशी मदत करू शकतो?',
  bn: 'আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  ta: 'நான் உங்களுக்கு எப்படி உதவ முடியும்?',
  te: 'నేను మీకు ఎలా సహాయం చేయగలను?',
  gu: 'હું તમારી કેવી રીતે મદદ કરી શકું?',
  kn: 'ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
  pa: 'ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
  or: 'ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
  bho: 'हम रउरा कइसे मदद कर सकत बानी?',
  mag: 'हम अहाँक कोना मदद कर सकैत छी?',
  bns: 'मैं आपकी कैसे मदद कर सकत हूँ?',
};

const COMMANDS = [
  { terms: ['get started', 'start now', 'start', 'sign up', 'register', 'signup', 'पंजीकरण', 'रजिस्टर', 'रजिस्टर करीं', 'रजिस्टर करूं', 'पंजीकरण करी', 'पंजीकरण करूं', 'नाम लिखाओ', 'नाम लिखाव', 'शुरू करें', 'शुरू करू', 'शुरू करूं', 'नया शुरू', 'नवा शुरू', 'शुरू करीं', 'नया खाता', 'नया अकाउंट', 'साइन अप', 'साइन अप करो', 'साइन अप करीं', 'साइन अप करूं'], path: '/register', responseKey: 'signup' },
  { terms: ['fill up all info in my profile form', 'fill all info in my profile form', 'fill my profile', 'complete my profile', 'start filling profile', 'fill profile', 'complete profile', 'प्रोफाइल भरें', 'मेरी प्रोफाइल भरें', 'प्रोफाइल पूरा करें'], path: '/profile', responseKey: 'profileStart' },
  { terms: ['log in', 'login', 'sign in', 'लॉग इन', 'लॉगिन', 'लॉगिन करीं', 'लॉगिन करूं', 'अंदर जाओ', 'अंदर जाव', 'प्रवेश करें', 'प्रवेश करीं', 'अंदर चलो', 'साइन इन'], path: '/login', responseKey: 'login' },
  { terms: ['profile', 'प्रोफाइल', 'प्रोफाइल खोलीं', 'प्रोफाइल खोलूं', 'मेरी जानकारी', 'अपनी जानकारी', 'जानकारी देखीं', 'प्रोफाइल देखीं', 'प्रोफाइल देखौ', 'अपना प्रोफाइल'], path: '/profile', responseKey: 'profile' },
  { terms: ['recommendation', 'recommendations', 'सिफारिश', 'सुझाव', 'सिफारिश देखीं', 'सुझाव देखी', 'सुझाव देखौ', 'सलाह देखौ', 'रिस्कोमेंडेशन', 'सिफारिशें'], path: '/recommendations', responseKey: 'recommendations' },
  { terms: ['roadmap', 'journey', 'यात्रा', 'रोजगार यात्रा', 'यात्रा खोलीं', 'रोडमैप देखी', 'अपनी यात्रा', 'रस्ता देखौ', 'मार्ग देखीं', 'पथ देखौ'], path: '/roadmap', responseKey: 'journey' },
  { terms: ['ivr', 'voice demo', 'फोन डेमो', 'आवाज डेमो', 'फोन वाला डेमो', 'बोलने वाला डेमो', 'वॉइस डेमो', 'आवाज परख', 'फोन परख'], path: '/ivr-demo', responseKey: 'voiceDemo' },
  { terms: ['certificate', 'verify', 'प्रमाणपत्र', 'सर्टिफिकेट', 'प्रमाणपत्र जांचीं', 'प्रमाणपत्र जांचौ', 'सर्टिफिकेट देखीं', 'सर्टिफिकेट चेक', 'प्रमाणपत्र देखौं'], path: '/certificate-verifier', responseKey: 'certificate' },
  { terms: ['home', 'landing', 'मुख्य पृष्ठ', 'घर', 'मुख्य पन्ना', 'घरे चलीं', 'घर चलौ', 'मुख्य जगह', 'होम पेज', 'मुख्य पेज', 'घर जाओ', 'घरे जाव'], path: '/', responseKey: 'home' },
];

const RESPONSES = {
  en: { signup: 'Opening signup.', login: 'Opening login.', profile: 'Opening your profile.', profileStart: 'Let us complete your profile. Answer each question using the Navigator microphone.', recommendations: 'Opening recommendations.', journey: 'Opening your livelihood journey.', voiceDemo: 'Opening the voice demo.', certificate: 'Opening certificate verification.', home: 'Opening the home page.', unknown: 'I heard you, but I do not recognize that command yet.' },
  hi: { signup: 'साइन अप खोल रहा हूं।', login: 'लॉगिन खोल रहा हूं।', profile: 'आपकी प्रोफाइल खोल रहा हूं।', profileStart: 'आइए आपकी प्रोफाइल पूरी करें। हर सवाल का जवाब नेविगेटर माइक्रोफ़ोन से दें।', recommendations: 'सिफारिशें खोल रहा हूं।', journey: 'आपकी आजीविका यात्रा खोल रहा हूं।', voiceDemo: 'वॉयस डेमो खोल रहा हूं।', certificate: 'प्रमाणपत्र सत्यापन खोल रहा हूं।', home: 'मुख्य पृष्ठ खोल रहा हूं।', unknown: 'मैंने आपकी बात सुनी, लेकिन यह आदेश समझ नहीं आया।' },
  bho: { signup: 'साइन अप खोलत बानी।', login: 'लॉगिन खोलत बानी।', profile: 'रउरा प्रोफाइल खोलत बानी।', recommendations: 'सुझाव खोलत बानी।', journey: 'रउरा आजीविका यात्रा खोलत बानी।', voiceDemo: 'आवाज डेमो खोलत बानी।', certificate: 'प्रमाणपत्र जांच खोले के बा।', home: 'मुख्य पन्ना खोलत बानी।', unknown: 'हम रउरा बात सुननी, बाकिर ई आदेश समझ में ना आइल।' },
  mag: { signup: 'साइन अप खोल रहल हिअइ।', login: 'लॉगिन खोल रहल हिअइ।', profile: 'अहाँक प्रोफाइल खोल रहल हिअइ।', recommendations: 'सुझाव खोल रहल हिअइ।', journey: 'अहाँक आजीविका यात्रा खोल रहल हिअइ।', voiceDemo: 'आवाज डेमो खोल रहल हिअइ।', certificate: 'प्रमाणपत्र जांच खोल रहल हिअइ।', home: 'मुख्य पन्ना खोल रहल हिअइ।', unknown: 'हम अहाँक बात सुनली, मुदा ई आदेश समझ में नै अइल।' },
  bns: { signup: 'नाम लिखाने का पन्ना खोल रए हैं।', login: 'लॉगिन खोल रए हैं।', profile: 'आपकी जानकारी खोल रए हैं।', recommendations: 'सुझाव खोल रए हैं।', journey: 'आपकी आजीविका यात्रा खोल रए हैं।', voiceDemo: 'बोलने वाला डेमो खोल रए हैं।', certificate: 'प्रमाणपत्र जांच खोल रए हैं।', home: 'घर वाला पन्ना खोल रए हैं।', unknown: 'आपकी बात सुन ली, पर ई बात समझ में नइ आई।' },
  mr: { signup: 'साइनअप उघडत आहे.', login: 'लॉगिन उघडत आहे.', profile: 'तुमचे प्रोफाइल उघडत आहे.', recommendations: 'शिफारसी उघडत आहेत.', journey: 'तुमचा आजीविका प्रवास उघडत आहे.', voiceDemo: 'व्हॉइस डेमो उघडत आहे.', certificate: 'प्रमाणपत्र पडताळणी उघडत आहे.', home: 'मुख्य पृष्ठ उघडत आहे.', unknown: 'मी तुमचे कथन ऐकले, पण हे आदेश मला समजले नाही.' },
  bn: { signup: 'সাইন আপ খুলছে।', login: 'লগইন খুলছে।', profile: 'আপনার প্রোফাইল খুলছে।', recommendations: 'সুপারিশ খুলছে।', journey: 'আপনার জীবনযাত্রা খুলছে।', voiceDemo: 'ভয়েস ডেমো খুলছে।', certificate: 'সার্টিফিকেট যাচাই খুলছে।', home: 'হোম পেজ খুলছে।', unknown: 'আমি আপনার কথা শুনেছি, কিন্তু এই কমান্ডটি বুঝতে পারিনি।' },
  ta: { signup: 'சைன் அப் திறக்கப்படுகிறது.', login: 'லாகின் திறக்கப்படுகிறது.', profile: 'உங்கள் சுயவிவரம் திறக்கப்படுகிறது.', recommendations: 'பரிந்துரைகள் திறக்கப்படுகின்றன.', journey: 'உங்கள் வாழ்க்கைப் பயணம் திறக்கப்படுகிறது.', voiceDemo: 'குரல் டெமோ திறக்கப்படுகிறது.', certificate: 'சான்றிதழ் சரிபார்ப்பு திறக்கப்படுகிறது.', home: 'முகப்பு பக்கம் திறக்கப்படுகிறது.', unknown: 'நான் உங்களின் குரலை கேட்டேன், ஆனால் இந்த கட்டளை புரியவில்லை.' },
  te: { signup: 'సైన్ అప్ తెరవబడుతోంది.', login: 'లాగిన్ తెరవబడుతోంది.', profile: 'మీ ప్రొఫైల్ తెరవబడుతోంది.', recommendations: 'సిఫార్సులు తెరవబడుతున్నాయి.', journey: 'మీ జీవిత ప్రయాణం తెరవబడుతోంది.', voiceDemo: 'వాయిస్ డెమో తెరవబడుతోంది.', certificate: 'సర్టిఫికేట్ ధృవీకరణ తెరవబడుతోంది.', home: 'హోమ్ పేజీ తెరవబడుతోంది.', unknown: 'నేను మీ మాట విన్నాను, కానీ ఈ ఆదేశం అర్థం కాలేదు.' },
  gu: { signup: 'સાઇન અપ ખોલી રહ્યું છે.', login: 'લૉગિન ખોલી રહ્યું છે.', profile: 'તમારી પ્રોફાઇલ ખોલી રહ્યું છે.', recommendations: 'સુચનો ખોલી રહ્યા છે.', journey: 'તમારો livelihood ચાલખંડ ખોલી રહ્યું છે.', voiceDemo: 'વ voix ડેમો ખોલી રહ્યું છે.', certificate: 'સર્ટિફિકેટ ચકાસણી ખોલી રહ્યું છે.', home: 'હોમ પેજ ખોલી રહ્યું છે.', unknown: 'હમણે તમારી વાત સાંભળી, પણ આ કમાન્ડ સમજમાં નથી આવી.' },
  kn: { signup: 'ಸೈನ್ ಅಪ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', login: 'ಲಾಗಿನ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', profile: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', recommendations: 'ಸಿಫಾರ್ಸುಗಳು ತೆರೆಯಲಾಗುತ್ತಿವೆ.', journey: 'ನಿಮ್ಮ ಜೀವನ ಪ್ರಯಾಣ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', voiceDemo: 'ವಾಯ್ಸ್ ಡೆಮೋ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', certificate: 'ಸಾನ್ಫೀಟಿಕೆಟ್ ಪರಿಶೀಲನೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', home: 'ಮುಖ್ಯ ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ.', unknown: 'ನಾನು ನಿಮ್ಮ сказನ್ನು ಕೇಳಿದೆ, ಆದರೆ ಈ ಆಜ್ಞೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' },
  pa: { signup: 'ਸਾਈਨ ਅਪ ਖੁੱਲ ਰਿਹਾ ਹੈ।', login: 'ਲੌਗਇਨ ਖੁੱਲ ਰਿਹਾ ਹੈ।', profile: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ।', recommendations: 'ਸਿਫ਼ਾਰਸ਼ਾਂ ਖੁੱਲ੍ਹ ਰਿਹੀਆਂ ਹਨ।', journey: 'ਤੁਹਾਡੀ livlihood ਯਾਤਰਾ ਖੁੱਲ੍ਹ ਰਹੀ ਹੈ।', voiceDemo: 'ਵੌਇਸ ਡੈਮੋ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ।', certificate: 'ਸਰਟਿਫਿਕੇਟ ਜਾਂਚ ਖੁੱਲ੍ਹ ਰਹੀ ਹੈ।', home: 'ਹੋਮ ਪੇਜ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ।', unknown: 'ਮੈਂ ਤੁਹਾਡੀ ਬਕਵਾਸ ਸੁਣੀ, ਪਰ ਇਹ ਹੁਕਮ ਸਮਝ ਨਹੀਂ ਆਇਆ।' },
  or: { signup: 'ସାଇନ ଅପ ଖୋଲୁଛି।', login: 'ଲଗଇନ ଖୋଲୁଛି।', profile: 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଖୋଲୁଛି।', recommendations: 'ପ୍ରସ୍ତାବ ଖୋଲୁଛି।', journey: 'ଆପଣଙ୍କ ଜୀବନ ପଥ ଖୋଲୁଛି।', voiceDemo: 'ଭୋଇସ୍ ଡେମୋ ଖୋଲୁଛି।', certificate: 'ସର୍ଟିଫିକେଟ୍ ଯାଞ୍ଚ ଖୋଲୁଛି।', home: 'ହୋମ ପେଜ୍ ଖୋଲୁଛି।', unknown: 'ମୁଁ ଆପଣଙ୍କ କଥା ଶୁଣିଛି, କିନ୍ତୁ ଏହି ଆଦେଶଟି ବୁଝିପାରିନି।' },
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

const normalizeSpeech = (text) => text
  .toLocaleLowerCase()
  .replace(/[.,!?;:()[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const includesPhrase = (text, phrases) => phrases.some((phrase) => {
  const normalizedPhrase = normalizeSpeech(phrase);
  if (!normalizedPhrase) return false;
  if (/^[a-z0-9 ]+$/.test(normalizedPhrase)) {
    return new RegExp(`(^|\\s)${normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'i').test(text);
  }
  return text.includes(normalizedPhrase);
});

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

const applyFormFieldValue = (spokenText) => {
  if (!['/login', '/register'].includes(window.location.pathname)) {
    return false;
  }

  const text = spokenText.trim();
  const fieldPatterns = [
    {
      target: 'name',
      regex: /^\s*(?:my\s+)?(full\s*name|name|नाम|पूरा\s*नाम|नाव)\b(?:\s*(?:is|hai|है|be|equals|=|:|को|पर|में))?\s*(.*?)(?=\s+(?:submit|save|login|log\s*in|register|sign\s*up|अगला|जमा|सहेजें|लॉग\s*इन|रजिस्टर)\b|$)/i,
    },
    {
      target: 'email',
      regex: /^\s*(?:my\s+)?(email|mail|ईमेल|मेल)\b(?:\s*(?:is|hai|है|be|equals|=|:|को|पर|में))?\s*(.*?)(?=\s+(?:submit|save|login|log\s*in|register|sign\s*up|अगला|जमा|सहेजें|लॉग\s*इन|रजिस्टर)\b|$)/i,
    },
    {
      target: 'phone',
      regex: /^\s*(?:my\s+)?(?:phone\s*number|phone|mobile|number|फोन\s*नंबर|फोन|मोबाइल|नंबर|नम्बर)\b(?:\s*(?:is|hai|है|be|equals|=|:|को|पर|में))?\s*(.*?)(?=\s+(?:submit|save|login|log\s*in|register|sign\s*up|अगला|जमा|सहेजें|लॉग\s*इन|रजिस्टर)\b|$)/i,
    },
    {
      target: 'password',
      regex: /^\s*(?:my\s+)?(password|पासवर्ड|कूटशब्द)\b/i,
    },
  ];

  for (const fieldPattern of fieldPatterns) {
    const match = text.match(fieldPattern.regex);
    if (!match) continue;
    if (fieldPattern.target === 'password') return 'password';

    const rawValue = String(match[match.length - 1] || '').trim();
    const value = rawValue
      .replace(/^(?:is|be|hai|है|equals|=|:|को|पर|में)\s*/i, '')
      .replace(/\s+(?:submit|save|login|log\s*in|register|signup|sign\s*up|अगला|जमा|सहेजें|लॉग\s*इन|रजिस्टर)\s*$/i, '')
      .trim();

    if (!value) continue;

    const candidates = [...document.querySelectorAll('input:not([type="submit"]):not([type="hidden"]), textarea')]
      .filter((element) => !element.disabled && !element.readOnly);
    const targetField = candidates.find((element) => {
      const label = `${element.name || ''} ${element.id || ''} ${element.placeholder || ''} ${element.getAttribute('aria-label') || ''} ${element.closest('label')?.textContent || ''}`.toLowerCase();
      if (fieldPattern.target === 'name') return label.includes('full name') || label.includes('name') || label.includes('नाम') || label.includes('नाव');
      if (fieldPattern.target === 'email') return label.includes('email') || label.includes('mail') || label.includes('ईमेल') || label.includes('मेल');
      if (fieldPattern.target === 'phone') return label.includes('email or phone') || label.includes('phone') || label.includes('mobile') || label.includes('number') || label.includes('फोन') || label.includes('मोबाइल') || label.includes('नंबर') || label.includes('नम्बर');
      return false;
    });

    if (!targetField) return false;

    const inputPrototype = targetField instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(inputPrototype, 'value')?.set;
    if (!valueSetter) return false;

    targetField.focus();
    valueSetter.call(targetField, value);
    targetField.dispatchEvent(new Event('input', { bubbles: true }));
    return 'filled';
  }

  return false;
};

const getRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceAssistant() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const commandHandlerRef = useRef(null);
  const listeningRequestedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [message, setMessage] = useState('Ask me to open a page or start your livelihood journey.');

  const speak = (text, overrideLanguage = language) => {
    setMessage(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_CODES[overrideLanguage] || 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (location.pathname !== '/') return;
    const greeting = LANDING_GREETING[language] || LANDING_GREETING.en;
    setIsOpen(true);
    speak(greeting);
  }, [location.pathname, language]);

  const handleCommand = (spokenText) => {
    const normalized = normalizeSpeech(spokenText);

    const languageSwitch = Object.entries(LANGUAGE_ALIASES).find(([, aliases]) =>
      includesPhrase(normalized, aliases),
    );

    if (languageSwitch) {
      const [targetLanguage] = languageSwitch;
      setLanguage(targetLanguage);
      speak(LANGUAGE_SWITCH_TEXT[targetLanguage] || 'Language changed.', targetLanguage);
      return;
    }

    const formFieldResult = applyFormFieldValue(spokenText);
    if (formFieldResult === 'filled') {
      speak('Filled the field.');
      return;
    }
    if (formFieldResult === 'password') {
      speak('For your security, please type your password instead of speaking it.');
      return;
    }

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
    const command = [...COMMANDS]
      .sort((first, second) => Math.max(...second.terms.map((term) => term.length)) - Math.max(...first.terms.map((term) => term.length)))
      .find((item) => includesPhrase(normalized, item.terms));
    if (command) {
      const responseSet = RESPONSES[language] || RESPONSES.hi;
      speak(responseSet[command.responseKey] || RESPONSES.en[command.responseKey]);
      window.setTimeout(() => navigate(command.path), 450);
      return;
    }
    if (location.pathname === '/profile') {
      window.dispatchEvent(new CustomEvent('navigator:profile-answer', { detail: { transcript: spokenText } }));
      speak('Answer received.');
      return;
    }
    const responseSet = RESPONSES[language] || RESPONSES.hi;
    speak(responseSet.unknown);
  };

  useEffect(() => {
    commandHandlerRef.current = handleCommand;
  });

  const startListening = () => {
    const Recognition = getRecognition();
    if (!Recognition) {
      speak('Voice control is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    listeningRequestedRef.current = true;
    if (recognitionRef.current) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = SPEECH_CODES[language] || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (!event.results[index].isFinal) continue;
        const spokenText = event.results[index][0].transcript.trim();
        setTranscript(spokenText);
        commandHandlerRef.current?.(spokenText);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        listeningRequestedRef.current = false;
        setIsListening(false);
        speak('Microphone access was blocked. Allow microphone access and try again.');
        return;
      }
      if (event.error !== 'no-speech') {
        speak('I could not hear that clearly. Please try again.');
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (listeningRequestedRef.current) {
        window.setTimeout(startListening, 250);
      } else {
        setIsListening(false);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    listeningRequestedRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
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
          <button type="button" className={`voice-listen-button ${isListening ? 'is-listening' : ''}`} onClick={isListening ? stopListening : startListening}>
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Listening...' : 'Speak a command'}
          </button>
          <div className="voice-assistant-hint">
            <Volume2 size={14} />
            {location.pathname === '/profile'
              ? 'Try: “fill my profile”, then answer each question.'
              : location.pathname === '/login'
              ? 'Try: “email is name@example.com”. Type your password.'
              : location.pathname === '/register'
                ? 'Try: “name is Ramesh Kumar”, then “email is name@example.com”. Type your password.'
                  : 'Try: “open recommendations”'}
          </div>
        </div>
      )}
      <button type="button" className={`voice-assistant-trigger ${isListening ? 'is-listening' : ''}`} onClick={() => setIsOpen((value) => !value)} title="Talk to Navigator" aria-label="Talk to Navigator">
        {isOpen ? <X size={21} /> : <Mic size={21} />}
      </button>
    </div>
  );
}
