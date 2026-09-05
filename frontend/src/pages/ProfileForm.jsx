import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { User, GraduationCap, MapPin, Briefcase, Mic, MicOff, CheckCircle, ArrowRight, ArrowLeft, Volume2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

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

const ProfileForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Web Speech API state
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('hi-IN'); // Default to Hindi
  const [liveTranscript, setLiveTranscript] = useState('');
  const [activeVoiceField, setActiveVoiceField] = useState('skills');
  const recognitionRef = useRef(null);

  const [formData, setFormData] = useState({
    personal: { age: '', gender: 'Male' },
    education: { level: '10th Pass', field: 'General' },
    location: { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Fanda', village: 'Karond' },
    livelihood: { currentOccupation: 'Weaver', familyOccupation: 'Agriculture', currentIncomeRange: '< 50000' },
    skills: 'Weaving, Embroidery',
    traditionalSkills: 'Handloom',
    interests: 'Textiles, Tailoring',
    aspirations: 'Small Business Owner',
    employmentPreference: 'SELF_EMPLOYMENT',
    preferredLanguage: 'Hindi',
    source: 'FORM',
  });

  // Available districts based on selected state
  const currentDistricts = INDIAN_STATES_DISTRICTS[formData.location.state] || [
    'Bhopal', 'Indore', 'Patna', 'Muzaffarpur', 'Varanasi', 'Lucknow', 'Jaipur', 'Jodhpur',
  ];

  // Initialize SpeechRecognition instance
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
        toast.success(`Microphone active (${speechLang === 'hi-IN' ? 'Hindi - hi-IN' : 'English - en-US'})! Speak now.`, { id: 'speech-toast' });
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        console.log('[WebSpeech] onresult fired. Raw transcript:', currentTranscript);
        setLiveTranscript(currentTranscript);

        if (currentTranscript.trim()) {
          mapTranscriptToFormState(currentTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
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
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
            traditionalSkills: Array.isArray(p.traditionalSkills) ? p.traditionalSkills.join(', ') : '',
            interests: Array.isArray(p.interests) ? p.interests.join(', ') : '',
            aspirations: Array.isArray(p.aspirations) ? p.aspirations.join(', ') : '',
            employmentPreference: p.employmentPreference || 'SELF_EMPLOYMENT',
            preferredLanguage: p.preferredLanguage || 'Hindi',
            source: p.source || 'FORM',
          });
        }
      } catch (err) {
        // Default form state is fine
      } finally {
        setFetching(false);
      }
    };
    fetchExistingProfile();
  }, []);

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleStateChange = (newState) => {
    const defaultDistrict = (INDIAN_STATES_DISTRICTS[newState] && INDIAN_STATES_DISTRICTS[newState][0]) || 'Central';
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, state: newState, district: defaultDistrict },
    }));
  };

  // Directly map spoken transcript to targeted React form state (with deep object cloning)
  const mapTranscriptToFormState = (text) => {
    const field = activeVoiceField || 'skills';
    console.log('[WebSpeech] About to call setFormData for field:', field, 'with text:', text);

    setFormData((prev) => {
      const copy = {
        ...prev,
        source: 'VOICE',
        personal: { ...prev.personal },
        education: { ...prev.education },
        location: { ...prev.location },
        livelihood: { ...prev.livelihood },
      };

      if (field === 'skills') copy.skills = text;
      else if (field === 'interests') copy.interests = text;
      else if (field === 'aspirations') copy.aspirations = text;
      else if (field === 'traditionalSkills') copy.traditionalSkills = text;
      else if (field === 'currentOccupation') copy.livelihood.currentOccupation = text;
      else if (field === 'familyOccupation') copy.livelihood.familyOccupation = text;
      else if (field === 'block') copy.location.block = text;
      else if (field === 'village') copy.location.village = text;
      else if (field === 'age') copy.personal.age = text.replace(/[^0-9]/g, '');
      else copy.skills = text;

      console.log('[WebSpeech] Form state updated successfully:', copy);
      return copy;
    });
  };

  const toggleSpeechRecognition = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (fieldName) {
      setActiveVoiceField(fieldName);
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      toast('Speech recognition stopped');
    } else {
      try {
        setLiveTranscript('');
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Speech start error:', err);
      }
    }
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
    { title: 'Personal', icon: User },
    { title: 'Education & Location', icon: MapPin },
    { title: 'Occupation & Income', icon: Briefcase },
    { title: 'Skills & Preferences', icon: GraduationCap },
  ];

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Beneficiary Profile</h1>
          <p className="text-sm text-slate-400">Complete structured form fields or use real Web Speech API transcription</p>
        </div>

        {/* Voice Controls & Language Switcher */}
        <div className="flex items-center space-x-2">
          {/* Language Selector (Hindi / English) */}
          <button
            type="button"
            onClick={() => {
              const nextLang = speechLang === 'hi-IN' ? 'en-US' : 'hi-IN';
              setSpeechLang(nextLang);
              toast.success(`Speech recognition language changed to ${nextLang === 'hi-IN' ? 'Hindi (hi-IN)' : 'English (en-US)'}`);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{speechLang === 'hi-IN' ? 'हिन्दी (hi-IN)' : 'English (en-US)'}</span>
          </button>

          {/* Master Mic Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSpeechRecognition('skills')}
            type="button"
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
                : 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:border-teal-500'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>Mic Active (Stop)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-teal-400" />
                <span>Web Speech Mic</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Live Voice Transcription Banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-slate-900/90 border border-teal-500/40 rounded-2xl p-4 flex items-center space-x-3 shadow-xl"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 text-teal-400 animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Listening ({speechLang === 'hi-IN' ? 'Hindi - hi-IN' : 'English - en-US'}) → Target Field: <span className="underline">{activeVoiceField}</span>
                </p>
              </div>
              <p className="text-sm font-semibold text-white truncate mt-0.5">
                {liveTranscript ? `"${liveTranscript}"` : 'Speak into microphone to populate field live...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {steps.map((s, idx) => {
          const isDone = step > idx + 1;
          const isCurrent = step === idx + 1;
          return (
            <div
              key={idx}
              onClick={() => setStep(idx + 1)}
              className={`cursor-pointer p-3 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                  : isDone
                  ? 'bg-slate-900 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex justify-center mb-1">
                {isDone ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <s.icon className="w-4 h-4" />}
              </div>
              <p className="text-[11px] font-bold tracking-wider uppercase">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* STEP 1: PERSONAL DETAILS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-teal-400" />
                  <span>Personal Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase">Age</label>
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition('age')}
                        className="text-xs text-teal-400 hover:underline flex items-center space-x-1"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Speak Age</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      value={formData.personal.age}
                      onChange={(e) => handleNestedChange('personal', 'age', e.target.value)}
                      placeholder="e.g. 26"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Gender</label>
                    <select
                      value={formData.personal.gender}
                      onChange={(e) => handleNestedChange('personal', 'gender', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: EDUCATION & LOCATION (STRUCTURED DROPDOWNS) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-teal-400" />
                  <span>Education & Location</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Education Level Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Education Level</label>
                    <select
                      value={formData.education.level}
                      onChange={(e) => handleNestedChange('education', 'level', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="Below 8th">Below 8th</option>
                      <option value="8th Pass">8th Pass</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                      <option value="ITI/Diploma">ITI / Diploma</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>

                  {/* State Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">State</label>
                    <select
                      value={formData.location.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    >
                      {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">District</label>
                    <select
                      value={formData.location.district}
                      onChange={(e) => handleNestedChange('location', 'district', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    >
                      {currentDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Block / Village Input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase">Block / Village</label>
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition('block')}
                        className="text-xs text-teal-400 hover:underline flex items-center space-x-1"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Speak Block</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.location.block}
                      onChange={(e) => handleNestedChange('location', 'block', e.target.value)}
                      placeholder="Block or Village name"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OCCUPATION & LIVELIHOOD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-teal-400" />
                  <span>Occupation & Livelihood</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase">Current Occupation</label>
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition('currentOccupation')}
                        className="text-xs text-teal-400 hover:underline flex items-center space-x-1 font-bold"
                      >
                        <Mic className="w-3.5 h-3.5 text-teal-400" />
                        <span>Speak Occupation</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.livelihood.currentOccupation}
                      onChange={(e) => handleNestedChange('livelihood', 'currentOccupation', e.target.value)}
                      placeholder="e.g. Handloom Artisan, Weaver, Farmer"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Annual Household Income</label>
                    <select
                      value={formData.livelihood.currentIncomeRange}
                      onChange={(e) => handleNestedChange('livelihood', 'currentIncomeRange', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="< 50000">&lt; ₹50,000</option>
                      <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                      <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
                      <option value="> 200000">&gt; ₹2,00,000</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SKILLS & ENUM PREFERENCES */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-teal-400" />
                  <span>Skills & Aspirations</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase">
                        Existing Skills (comma separated)
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleSpeechRecognition('skills')}
                        className="text-xs text-teal-400 hover:underline flex items-center space-x-1 font-bold"
                      >
                        <Mic className="w-3.5 h-3.5 text-teal-400" />
                        <span>Speak Skills</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="Weaving, Stitching, Computer basics"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  {/* Employment Preference Enum Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                      Employment Preference (Backend Schema Enum)
                    </label>
                    <select
                      value={formData.employmentPreference}
                      onChange={(e) => setFormData({ ...formData, employmentPreference: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer font-semibold"
                    >
                      <option value="SELF_EMPLOYMENT">SELF_EMPLOYMENT (Self Employment / Enterprise)</option>
                      <option value="WAGE_EMPLOYMENT">WAGE_EMPLOYMENT (Wage Job / Employment)</option>
                      <option value="HYBRID">HYBRID (Hybrid / Both)</option>
                      <option value="ANY">ANY (Any Opportunity)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400"
              >
                <span>Next Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-teal-500/25 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save & Generate Recommendations</span>
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
