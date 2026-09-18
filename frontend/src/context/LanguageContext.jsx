import React, { createContext, useContext, useState, useEffect } from 'react';

/*
  GLOBAL MULTI-LANGUAGE CONTEXT SYSTEM FOR LIVELIHOOD NAVIGATOR
  Supported Indian Languages:
  - en: English
  - hi: Hindi (हिन्दी)
  - mr: Marathi (मराठी)
  - bn: Bengali (বাংলা)
  - ta: Tamil (தமிழ்)
  - te: Telugu (తెలుగు)
  - gu: Gujarati (ગુજરાતી)
  - kn: Kannada (ಕನ್ನಡ)
  - pa: Punjabi (ਪੰਜਾਬੀ)
  - or: Odia (ଓଡ଼ିଆ)
  - bho: Bhojpuri (भोजपुरी)
  - mag: Magahi (मगही)
  - bns: Bundeli (बुंदेली)
*/

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
  { code: 'mag', name: 'Magahi', native: 'मगही' },
  { code: 'bns', name: 'Bundeli', native: 'बुंदेली' },
];

const TRANSLATIONS = {
  en: {
    // Nav
    appName: 'Livelihood Navigator',
    appSubtitle: 'AI Career & Opportunity Platform',
    navRecs: 'Recommendations',
    navJourney: 'My Journey',
    navProfile: 'My Profile',
    navOfficer: 'Officer Dashboard',
    logIn: 'Log In',
    getStarted: 'Get Started',
    logout: 'Logout',

    // Recommendations Page
    aiEngineBadge: 'AI Recommendation Engine',
    heroRecsTitle: 'Personalized Livelihood Pathways',
    heroRecsSub: 'Matched tailored courses, regional training centers, and local employment opportunities based on your skills and location.',
    updateProfileBtn: 'Update Profile',
    allRecs: 'All Recommendations',
    nsqfCourses: 'NSQF Courses',
    trainingCentres: 'Training Centres',
    employmentOpps: 'Employment Opportunities',
    noRecsFound: 'No Recommendations Found',
    noRecsSub: 'Try updating your profile skills or location preferences to unlock more tailored opportunities!',
    recommendationsUnavailable: 'Recommendations are temporarily unavailable. Please try again.',
    unableToLoadRecommendations: 'Unable to load recommendations',
    retry: 'Retry',
    enrollInTraining: 'Enroll in Training',
    viewDetails: 'View Details',
    matchScore: 'Match',
    whyRecommended: 'Why Recommended',
    sectorLabel: 'Sector',

    // Details Modal
    centreDetailsTitle: 'Training Centre & Opportunity Details',
    centreNameLabel: 'Centre Name',
    addressLabel: 'Address & Location',
    contactLabel: 'Contact Information',
    capacityLabel: 'Training Capacity / Openings',
    facilitiesLabel: 'Facility Highlights',
    closeBtn: 'Close',

    // Profile Form
    profileTitle: 'Beneficiary Profile',
    profileSub: 'Complete structured form fields or use real Web Speech API transcription',
    personalTab: 'Personal',
    educationTab: 'Education & Location',
    occupationTab: 'Occupation & Income',
    skillsTab: 'Skills & Preferences',
    ageLabel: 'Age',
    genderLabel: 'Gender',
    educationLevelLabel: 'Education Level',
    stateLabel: 'State',
    districtLabel: 'District',
    blockLabel: 'Block / Village',
    currentOccupationLabel: 'Current Occupation',
    annualIncomeLabel: 'Annual Household Income',
    existingSkillsLabel: 'Existing Skills (comma separated)',
    employmentPrefLabel: 'Employment Preference',
    saveProfileBtn: 'Save & Generate Recommendations',
    nextSectionBtn: 'Next Section',
    backBtn: 'Back',

    // Roadmap
    journeyTitle: 'My Livelihood Journey',
    journeySub: 'Track your training progress, module milestones, and employment outcomes in real time',
    noEnrollmentsYet: 'No Active Enrollments Yet',
    noEnrollmentsSub: 'Browse tailored course recommendations and enroll to start your personalized training pathway.',
    exploreRecsBtn: 'Explore Recommendations',
    attendanceLabel: 'Attendance',
    visualTimeline: 'Visual Milestone Timeline',
    currentModule: 'Current Training Module',
    verifiedOutcome: 'Verified Employment Outcome',
    outcomePendingNote: 'Post-training job placement and self-employment outcomes will be verified here by your District Officer.',

    // Officer Dashboard
    officerTitle: 'District Officer Command',
    officerSub: 'Real-time livelihood metrics, skill demand analytics, and risk interventions',
    totalBeneficiaries: 'Total Beneficiaries',
    activeEnrollments: 'Active Enrollments',
    completedTrainings: 'Completed Trainings',
    openInterventions: 'Open Interventions',
    skillDemandTitle: 'Regional Skill Demand Analytics',
    atRiskTitle: 'At-Risk Beneficiaries & Dropout Alerts',
  },

  hi: {
    // Nav
    appName: 'आजीविका नेविगेटर',
    appSubtitle: 'एआई करियर और अवसर प्लेटफॉर्म',
    navRecs: 'सिफारिशें',
    navJourney: 'मेरी यात्रा',
    navProfile: 'मेरी प्रोफाइल',
    navOfficer: 'अधिकारी डैशबोर्ड',
    logIn: 'लॉग इन करें',
    getStarted: 'शुरू करें',
    logout: 'लॉग आउट',

    // Recommendations Page
    aiEngineBadge: 'एआई सिफारिश इंजन',
    heroRecsTitle: 'व्यक्तिगत आजीविका मार्ग',
    heroRecsSub: 'आपकी क्षमताओं और स्थान के आधार पर विशेष पाठ्यक्रम, क्षेत्रीय प्रशिक्षण केंद्र और स्थानीय रोजगार अवसर।',
    updateProfileBtn: 'प्रोफाइल अपडेट करें',
    allRecs: 'सभी सिफारिशें',
    nsqfCourses: 'एनएसक्यूएफ पाठ्यक्रम',
    trainingCentres: 'प्रशिक्षण केंद्र',
    employmentOpps: 'रोजगार अवसर',
    noRecsFound: 'कोई सिफारिश नहीं मिली',
    noRecsSub: 'अधिक अवसर देखने के लिए अपने कौशल या स्थान प्राथमिकताओं को अपडेट करें!',
    recommendationsUnavailable: 'सिफारिशें अभी उपलब्ध नहीं हैं। कृपया फिर प्रयास करें।',
    unableToLoadRecommendations: 'सिफारिशें लोड नहीं हो सकीं',
    retry: 'फिर प्रयास करें',
    enrollInTraining: 'प्रशिक्षण में नामांकन करें',
    viewDetails: 'विवरण देखें',
    matchScore: 'मैच',
    whyRecommended: 'सिफारिश का कारण',
    sectorLabel: 'क्षेत्र',

    // Details Modal
    centreDetailsTitle: 'प्रशिक्षण केंद्र और अवसर विवरण',
    centreNameLabel: 'केंद्र का नाम',
    addressLabel: 'पता और स्थान',
    contactLabel: 'संपर्क जानकारी',
    capacityLabel: 'प्रशिक्षण क्षमता / सीटें',
    facilitiesLabel: 'सुविधाएं और विशेषताएं',
    closeBtn: 'बंद करें',

    // Profile Form
    profileTitle: 'लाभार्थी प्रोफाइल',
    profileSub: 'फॉर्म भरें या वेब स्पीच आवाज सुविधा का उपयोग करें',
    personalTab: 'व्यक्तिगत',
    educationTab: 'शिक्षा और स्थान',
    occupationTab: 'व्यवसाय और आय',
    skillsTab: 'कौशल और आकांक्षाएं',
    ageLabel: 'आयु',
    genderLabel: 'लिंग',
    educationLevelLabel: 'शिक्षा स्तर',
    stateLabel: 'राज्य',
    districtLabel: 'जिला',
    blockLabel: 'ब्लॉक / गांव',
    currentOccupationLabel: 'वर्तमान व्यवसाय',
    annualIncomeLabel: 'वार्षिक पारिवारिक आय',
    existingSkillsLabel: 'मौजूदा कौशल (कॉमा से अलग करें)',
    employmentPrefLabel: 'रोजगार प्राथमिकता',
    saveProfileBtn: 'सहेजें और सिफारिशें प्राप्त करें',
    nextSectionBtn: 'अगला भाग',
    backBtn: 'पीछे',

    // Roadmap
    journeyTitle: 'मेरी आजीविका यात्रा',
    journeySub: 'अपने प्रशिक्षण प्रगति, मॉड्यूल मील के पत्थर और रोजगार परिणामों को ट्रैक करें',
    noEnrollmentsYet: 'कोई सक्रिय नामांकन नहीं',
    noEnrollmentsSub: 'अपनी व्यक्तिगत प्रशिक्षण यात्रा शुरू करने के लिए अनुशंसित पाठ्यक्रमों को ब्राउज़ करें।',
    exploreRecsBtn: 'सिफारिशें देखें',
    attendanceLabel: 'उपस्थिति',
    visualTimeline: 'मील का पत्थर समयरेखा',
    currentModule: 'वर्तमान प्रशिक्षण मॉड्यूल',
    verifiedOutcome: 'सत्यापित रोजगार परिणाम',
    outcomePendingNote: 'प्रशिक्षण के बाद नौकरी और स्वरोजगार के परिणामों को जिला अधिकारी द्वारा सत्यापित किया जाएगा।',

    // Officer Dashboard
    officerTitle: 'जिला अधिकारी कमान',
    officerSub: 'वास्तविक समय आजीविका मेट्रिक्स, कौशल मांग विश्लेषण और जोखिम हस्तक्षेप',
    totalBeneficiaries: 'कुल लाभार्थी',
    activeEnrollments: 'सक्रिय नामांकन',
    completedTrainings: 'पूर्ण प्रशिक्षण',
    openInterventions: 'खुले हस्तक्षेप',
    skillDemandTitle: 'क्षेत्रीय कौशल मांग विश्लेषण',
    atRiskTitle: 'जोखिम में लाभार्थी और चेतावनी',
  },

  mr: {
    // Nav
    appName: 'उपजीविका नेव्हिगेटर',
    appSubtitle: 'एआय करिअर आणि संधी व्यासपीठ',
    navRecs: 'शिफारसी',
    navJourney: 'माझा प्रवास',
    navProfile: 'माझे प्रोफाइल',
    navOfficer: 'अधिकारी डॅशबोर्ड',
    logIn: 'लॉग इन करा',
    getStarted: 'सुरू करा',
    logout: 'लॉग आउट',

    // Recommendations Page
    aiEngineBadge: 'एआय शिफारस इंजिन',
    heroRecsTitle: 'वैयक्तिकृत उपजीविका मार्ग',
    heroRecsSub: 'तुमचे कौशल्य आणि स्थानावर आधारित विशेष अभ्यासक्रम, प्रादेशिक प्रशिक्षण केंद्रे आणि स्थानिक रोजगार संधी.',
    updateProfileBtn: 'प्रोफाइल अद्ययावत करा',
    allRecs: 'सर्व शिफारसी',
    nsqfCourses: 'NSQF अभ्यासक्रम',
    trainingCentres: 'प्रशिक्षण केंद्रे',
    employmentOpps: 'रोजगार संधी',
    noRecsFound: 'कोणतीही शिफारस आढळली नाही',
    noRecsSub: 'अधिक शिफारसी मिळवण्यासाठी तुमचे कौशल्य किंवा स्थान अपडेट करा!',
    enrollInTraining: 'प्रशिक्षणात प्रवेश घ्या',
    viewDetails: 'तपशील पहा',
    matchScore: 'साम्य',
    whyRecommended: 'शिफारस करण्याचे कारण',
    sectorLabel: 'क्षेत्र',

    // Details Modal
    centreDetailsTitle: 'प्रशिक्षण केंद्र आणि संधी तपशील',
    centreNameLabel: 'केंद्राचे नाव',
    addressLabel: 'पत्ता आणि स्थान',
    contactLabel: 'संपर्क माहिती',
    capacityLabel: 'प्रशिक्षण क्षमता / जागा',
    facilitiesLabel: 'सुविधा आणि वैशिष्ट्ये',
    closeBtn: 'बंद करा',

    // Profile Form
    profileTitle: 'लाभार्थी प्रोफाइल',
    profileSub: 'फॉर्म भरा किंवा व्हॉइस स्पीच वापरून माहिती द्या',
    personalTab: 'वैयक्तिक',
    educationTab: 'शिक्षण आणि स्थान',
    occupationTab: 'व्यवसाय आणि उत्पन्न',
    skillsTab: 'कौशल्य आणि आकांक्षा',
    ageLabel: 'वय',
    genderLabel: 'लिंग',
    educationLevelLabel: 'शिक्षण पातळी',
    stateLabel: 'राज्य',
    districtLabel: 'जिल्हा',
    blockLabel: 'ब्लॉक / गाव',
    currentOccupationLabel: 'सध्याचा व्यवसाय',
    annualIncomeLabel: 'वार्षिक कौटुंबिक उत्पन्न',
    existingSkillsLabel: 'सध्याची कौशल्ये (स्वल्पविरामाने वेगळे करा)',
    employmentPrefLabel: 'रोजगार पसंती',
    saveProfileBtn: 'जतन करा आणि शिफारसी मिळवा',
    nextSectionBtn: 'पुढील भाग',
    backBtn: 'मागे',

    // Roadmap
    journeyTitle: 'माझा उपजीविका प्रवास',
    journeySub: 'तुमचा प्रशिक्षण प्रगती आलेख आणि रोजगार निकाल थेट पहा',
    noEnrollmentsYet: 'कोणतेही सक्रिय प्रवेश नाहीत',
    noEnrollmentsSub: 'तुमचा वैयक्तिक प्रशिक्षण प्रवास सुरू करण्यासाठी शिफारस केलेले अभ्यासक्रम पहा.',
    exploreRecsBtn: 'शिफारसी शोधा',
    attendanceLabel: 'उपस्थिती',
    visualTimeline: 'टप्प्यांची कालरेषा',
    currentModule: 'सध्याचे प्रशिक्षण मॉड्यूल',
    verifiedOutcome: 'प्रमाणित रोजगार निकाल',
    outcomePendingNote: 'प्रशिक्षणानंतरचा रोजगार निकाल जिल्हा अधिकाऱ्यांकडून सत्यापित केला जाईल.',

    // Officer Dashboard
    officerTitle: 'जिल्हा अधिकारी कमांड',
    officerSub: 'रिअल-टाइम उपजीविका आकडेवारी आणि कौशल्य मागणी विश्लेषण',
    totalBeneficiaries: 'एकूण लाभार्थी',
    activeEnrollments: 'सक्रिय प्रवेश',
    completedTrainings: 'पूर्ण झालेले प्रशिक्षण',
    openInterventions: 'सक्रिय हस्तक्षेप',
    skillDemandTitle: 'प्रादेशिक कौशल्य मागणी विश्लेषण',
    atRiskTitle: 'जोखिम असलेले लाभार्थी आणि इशारे',
  },

  bn: {
    appName: 'জীবিকা নেভিগেটর',
    appSubtitle: 'এআই ক্যারিয়ার ও সুযোগ প্ল্যাটফর্ম',
    navRecs: 'সুপারিশ',
    navJourney: 'আমার যাত্রা',
    navProfile: 'আমার প্রোফাইল',
    navOfficer: 'অফিসার ড্যাশবোর্ড',
    logIn: 'লগ ইন',
    getStarted: 'শুরু করুন',
    logout: 'লগ আউট',
    heroRecsTitle: 'ব্যক্তিগতকৃত জীবিকা পথ',
    heroRecsSub: 'আপনার দক্ষতা ও অবস্থানের ওপর ভিত্তি করে উপযুক্ত কোর্স, প্রশিক্ষণ কেন্দ্র ও কর্মসংস্থান।',
    enrollInTraining: 'প্রশিক্ষণে নাম নথিভুক্ত করুন',
    viewDetails: 'বিস্তারিত দেখুন',
    centreDetailsTitle: 'প্রশিক্ষণ কেন্দ্র ও সুযোগের বিস্তারিত',
    closeBtn: 'বন্ধ করুন',
  },

  ta: {
    appName: 'வாழ்வாதார வழிகாட்டி',
    appSubtitle: 'AI தொழில் மற்றும் வாய்ப்பு தளம்',
    navRecs: 'பரிந்துரைகள்',
    navJourney: 'என் பயணம்',
    navProfile: 'என் சுயவிவரம்',
    navOfficer: 'அதிகாரி டேஷ்போர்டு',
    logIn: 'உள்நுழைக',
    getStarted: 'தொடங்கவும்',
    logout: 'வெளியேறு',
    heroRecsTitle: 'தனிப்பயனாக்கப்பட்ட வாழ்வாதார வழிகள்',
    heroRecsSub: 'உங்கள் திறமைகள் மற்றும் இருப்பிடத்தின் அடிப்படையில் பயிற்சிகள் மற்றும் வேலைவாய்ப்புகள்.',
    enrollInTraining: 'பயிற்சியில் சேரவும்',
    viewDetails: 'விவரங்களைக் காண்க',
    centreDetailsTitle: 'பயிற்சி மையம் மற்றும் வாய்ப்பு விவரங்கள்',
    closeBtn: 'மூடுக',
  },

  te: {
    appName: 'జీవనోపాధి నావిగేటర్',
    appSubtitle: 'AI కెరీర్ మరియు అవకాశాల వేదిక',
    navRecs: 'సిఫార్సులు',
    navJourney: 'నా ప్రయాణం',
    navProfile: 'నా ప్రొఫైల్',
    navOfficer: 'అధికారి డాష్‌బోర్డ్',
    logIn: 'లాగిన్ చేయండి',
    getStarted: 'ప్రారంభించండి',
    logout: 'లాగౌట్',
    heroRecsTitle: 'వ్యక్తిగతీకరించిన జీవనోపాధి మార్గాలు',
    heroRecsSub: 'మీ నైపుణ్యాలు మరియు ప్రాంతం ఆధారంగా శిక్షణ కోర్సులు మరియు ఉపాధి అవకాశాలు.',
    enrollInTraining: 'శిక్షణలో చేరండి',
    viewDetails: 'వివరాలు చూడండి',
    centreDetailsTitle: 'శిక్షణ కేంద్రం మరియు వివరాలు',
    closeBtn: 'మూసివేయి',
  },

  gu: {
    appName: 'આજીવિકા નેવિગેટર',
    appSubtitle: 'AI કરિયર અને તકોનું પ્લેટફોર્મ',
    navRecs: 'ભલામણો',
    navJourney: 'મારી યાત્રા',
    navProfile: 'મારું પ્રોફાઇલ',
    navOfficer: 'અધિકારી ડેશબોર્ડ',
    logIn: 'લોગ ઇન કરો',
    getStarted: 'શરૂ કરો',
    logout: 'લોગ આઉટ',
    heroRecsTitle: 'વ્યક્તિગત આજીવિકા માર્ગ',
    heroRecsSub: 'તમારી કુશળતા અને સ્થાન પર આધારિત કોર્સ અને તાલીમ કેન્દ્રો.',
    enrollInTraining: 'તાલીમમાં પ્રવેશ લો',
    viewDetails: 'વિગતો જુઓ',
    centreDetailsTitle: 'તાલીમ કેન્દ્ર અને વિગતો',
    closeBtn: 'બંધ કરો',
  },

  kn: {
    appName: 'ಜೀವನೋಪಾಯ ನ್ಯಾವಿಗೇಟರ್',
    appSubtitle: 'AI ವೃತ್ತಿ ಮತ್ತು ಅವಕಾಶ ವೇದಿಕೆ',
    navRecs: 'ಶಿಫಾರಸುಗಳು',
    navJourney: 'ನನ್ನ ಪ್ರಯಾಣ',
    navProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    navOfficer: 'ಅಧಿಕಾರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    logIn: 'ಲಾಗಿನ್ ಮಾಡಿ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    logout: 'ಲಾಗ್‌ಔಟ್',
    heroRecsTitle: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಜೀವನೋಪಾಯ ಮಾರ್ಗಗಳು',
    heroRecsSub: 'ನಿಮ್ಮ ಕೌಶಲ್ಯ ಮತ್ತು ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ತರಬೇತಿ ಕೋರ್ಸ್‌ಗಳು ಮತ್ತು ಉದ್ಯೋಗ ಅವಕಾಶಗಳು.',
    enrollInTraining: 'ತರಬೇತಿಗೆ ನೋಂದಾಯಿಸಿ',
    viewDetails: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    centreDetailsTitle: 'ತರಬೇತಿ ಕೇಂದ್ರದ ವಿವರಗಳು',
    closeBtn: 'ಮುಚ್ಚಿ',
  },

  pa: {
    appName: 'ਰੋਜ਼ੀ-ਰੋਟੀ ਨੈਵੀਗੇਟਰ',
    appSubtitle: 'AI ਕਰੀਅਰ ਅਤੇ ਅਵਸਰ ਪਲੇਟਫਾਰਮ',
    navRecs: 'ਸਿਫ਼ਾਰਸ਼ਾਂ',
    navJourney: 'ਮੇਰੀ ਯਾਤਰਾ',
    navProfile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ',
    navOfficer: 'ਅਧਿਕਾਰੀ ਡੈਸ਼ਬੋਰਡ',
    logIn: 'ਲੌਗ ਇਨ ਕਰੋ',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    logout: 'ਲੌਗ ਆਉਟ',
    heroRecsTitle: 'ਨਿੱਜੀ ਰੋਜ਼ੀ-ਰੋਟੀ ਦੇ ਰਸਤੇ',
    heroRecsSub: 'ਤੁਹਾਡੇ ਹੁਨਰ ਅਤੇ ਸਥਾਨ ਦੇ ਆਧਾਰ \'ਤੇ ਸਿਖਲਾਈ ਕੋਰਸ ਅਤੇ ਰੋਜ਼ਗਾਰ ਦੇ ਮੌਕੇ।',
    enrollInTraining: 'ਸਿਖਲਾਈ ਵਿੱਚ ਦਾਖਲਾ ਲਵੋ',
    viewDetails: 'ਵੇਰਵੇ ਦੇਖੋ',
    centreDetailsTitle: 'ਸਿਖਲਾਈ ਕੇਂਦਰ ਅਤੇ ਵੇਰਵੇ',
    closeBtn: 'ਬੰਦ ਕਰੋ',
  },

  or: {
    appName: 'ଜୀବିକା ନାଭିଗେଟର',
    appSubtitle: 'AI କ୍ୟାରିଅର୍ ଏବଂ ସୁଯୋଗ ପ୍ଲାଟଫର୍ମ',
    navRecs: 'ସୁପାରିଶ୍',
    navJourney: 'ମୋର ଯାତ୍ରା',
    navProfile: 'ମୋର ପ୍ରୋଫାଇଲ୍',
    navOfficer: 'ଅଧିକାରୀ ଡ୍ୟାସବୋର୍ଡ',
    logIn: 'ଲଗ୍ ଇନ୍ କରନ୍ତୁ',
    getStarted: 'ଆରମ୍ଭ କରନ୍ତୁ',
    logout: 'ଲଗ୍ ଆଉଟ୍',
    heroRecsTitle: 'ବ୍ୟକ୍ତିଗତ ଜୀବିକା ପଥ',
    heroRecsSub: 'ଆପଣଙ୍କ କୌଶଳ ଏବଂ ସ୍ଥାନ ଉପରେ ଆଧାରିତ ତାଲିମ ପାଠ୍ୟକ୍ରମ ଏବଂ ନିଯୁକ୍ତି ସୁଯୋଗ।',
    enrollInTraining: 'ତାଲିମରେ ନାମ ଲେଖାନ୍ତୁ',
    viewDetails: 'ବିବରଣୀ ଦେଖନ୍ତୁ',
    centreDetailsTitle: 'ତାଲିମ କେନ୍ଦ୍ର ବିବରଣୀ',
    closeBtn: 'ବନ୍ଦ କରନ୍ତୁ',
  },
};

const LANDING_TRANSLATIONS = {
  en: {
    landingEyebrow: 'Livelihood Navigator',
    landingHeroTitle: 'Your livelihood journey starts here.',
    landingHeroDescription: 'We help people discover practical career pathways, nearby training centres, and opportunities that match their strengths, language, and local realities.',
    landingSignUp: 'Sign Up',
    landingTrustAi: 'AI Career Guidance',
    landingTrustRoadmaps: 'Skilling Roadmaps',
    landingTrustLocal: 'Local Opportunity Matching',
    landingRecommendedStep: 'Recommended next step',
    landingExampleRole: 'Tailor & Garment Technician',
    landingMatchedSkills: 'Matched to your skills',
    landingLocalTraining: 'Local training options',
    landingCareerConfidence: 'Career confidence',
    landingPathwayTracked: 'Pathway tracked',
    landingOpportunityMatch: 'Opportunity match',
    landingRelevantOpportunities: 'Relevant local opportunities',
    landingAboutEyebrow: 'About',
    landingAboutTitle: 'Helping people turn skills into stable livelihoods.',
    landingAboutDescription: 'Livelihood Navigator brings together technology, skill discovery, and local opportunity intelligence so communities can explore the right training, jobs, and future pathways.',
    landingAboutPointOne: 'NSQF-aligned skill recommendations for real-world career growth.',
    landingAboutPointTwo: 'Support for training, employment readiness, and scheme discovery.',
    landingAboutPointThree: 'Accessible guidance designed around local livelihood realities.',
    landingSkillFit: 'Skill fit',
    landingCommunityRecommendations: 'Community-first recommendations',
    landingSkillFitDescription: 'Understand interests, strengths, and local market demand in one place.',
    landingSupport: 'Support',
    landingLearningToEarning: 'From learning to earning',
    landingSupportDescription: 'Track roadmaps, schemes, and nearby centres with confidence.',
    landingWhyEyebrow: 'Why it matters',
    landingWhyTitle: 'Built for real development journeys.',
    landingStartEyebrow: 'Start today',
    landingCtaTitle: 'Create your profile and discover the right opportunity.',
    landingSignUpNow: 'Sign Up Now',
    landingFeatureAiTitle: 'AI-powered guidance',
    landingFeatureAiDescription: 'Personalized career suggestions aligned to your skills, location, and livelihood goals.',
    landingFeatureLocalTitle: 'Local opportunity mapping',
    landingFeatureLocalDescription: 'Discover nearby training centres, schemes, and work possibilities tailored to your region.',
    landingFeatureRoadmapTitle: 'Career roadmap',
    landingFeatureRoadmapDescription: 'Plan practical step-by-step growth from learning to earning with clear milestones.',
    landingFeatureCommunityTitle: 'Community-first support',
    landingFeatureCommunityDescription: 'Simple, multilingual experiences designed for accessibility and trust in rural communities.',
    landingSkillIndiaImageAlt: 'Prime Minister Narendra Modi',
    landingSkillIndiaLabel: 'Skill India vision',
    landingSkillIndiaTitle: 'Skills create confidence, opportunity, and dignity.',
    landingSkillIndiaQuote: 'When our youth are skilled, India moves forward with confidence.',
    landingSkillIndiaDescription: 'Skill India connects learning with real work, local opportunity, and a stronger future for every community.',
    landingSkillIndiaAttribution: 'Inspired by the Skill India mission',
    landingFooterDescription: 'Practical guidance for skills, training, and local livelihood opportunities.',
    landingFooterExplore: 'Explore',
    landingFooterVerify: 'Verify certificates',
    landingFooterPlatform: 'Platform',
    landingFooterStayConnected: 'Stay connected',
    landingFooterContactDescription: 'Questions about your next step? Our team is here to help.',
    landingFooterCopyright: 'Livelihood Navigator. Built for opportunity.',
    landingFooterBuiltFor: 'Designed for every learner and worker.',
  },
  hi: {
    landingEyebrow: 'आजीविका नेविगेटर',
    landingHeroTitle: 'आपकी आजीविका यात्रा यहां से शुरू होती है।',
    landingHeroDescription: 'हम आपको व्यावहारिक करियर मार्ग, पास के प्रशिक्षण केंद्र और आपकी क्षमता, भाषा और स्थानीय परिस्थितियों से मेल खाते अवसर खोजने में मदद करते हैं।',
    landingSignUp: 'साइन अप करें',
    landingTrustAi: 'एआई करियर मार्गदर्शन',
    landingTrustRoadmaps: 'कौशल रोडमैप',
    landingTrustLocal: 'स्थानीय अवसर मिलान',
    landingRecommendedStep: 'अगला सुझाया कदम',
    landingExampleRole: 'दर्जी और परिधान तकनीशियन',
    landingMatchedSkills: 'आपके कौशल से मेल',
    landingLocalTraining: 'स्थानीय प्रशिक्षण विकल्प',
    landingCareerConfidence: 'करियर में भरोसा',
    landingPathwayTracked: 'मार्ग की प्रगति दर्ज',
    landingOpportunityMatch: 'अवसर मिलान',
    landingRelevantOpportunities: 'प्रासंगिक स्थानीय अवसर',
    landingAboutEyebrow: 'हमारे बारे में',
    landingAboutTitle: 'लोगों को कौशल से स्थायी आजीविका तक पहुंचने में मदद।',
    landingAboutDescription: 'आजीविका नेविगेटर तकनीक, कौशल खोज और स्थानीय अवसरों की जानकारी को एक साथ लाता है, ताकि समुदाय सही प्रशिक्षण, नौकरी और भविष्य के मार्ग खोज सकें।',
    landingAboutPointOne: 'वास्तविक करियर विकास के लिए NSQF आधारित कौशल सिफारिशें।',
    landingAboutPointTwo: 'प्रशिक्षण, रोजगार तैयारी और योजनाओं की खोज में सहायता।',
    landingAboutPointThree: 'स्थानीय आजीविका की वास्तविकताओं के अनुसार सरल मार्गदर्शन।',
    landingSkillFit: 'कौशल मेल',
    landingCommunityRecommendations: 'समुदाय-केंद्रित सिफारिशें',
    landingSkillFitDescription: 'रुचियों, क्षमताओं और स्थानीय बाजार की मांग को एक जगह समझें।',
    landingSupport: 'सहायता',
    landingLearningToEarning: 'सीखने से कमाई तक',
    landingSupportDescription: 'रोडमैप, योजनाओं और पास के केंद्रों की प्रगति भरोसे के साथ देखें।',
    landingWhyEyebrow: 'यह क्यों महत्वपूर्ण है',
    landingWhyTitle: 'वास्तविक विकास यात्राओं के लिए बनाया गया।',
    landingStartEyebrow: 'आज शुरू करें',
    landingCtaTitle: 'अपनी प्रोफाइल बनाएं और सही अवसर खोजें।',
    landingSignUpNow: 'अभी साइन अप करें',
    landingFeatureAiTitle: 'एआई आधारित मार्गदर्शन',
    landingFeatureAiDescription: 'आपके कौशल, स्थान और आजीविका लक्ष्यों के अनुसार व्यक्तिगत करियर सुझाव।',
    landingFeatureLocalTitle: 'स्थानीय अवसर मानचित्र',
    landingFeatureLocalDescription: 'अपने क्षेत्र के पास प्रशिक्षण केंद्र, योजनाएं और काम के अवसर खोजें।',
    landingFeatureRoadmapTitle: 'करियर रोडमैप',
    landingFeatureRoadmapDescription: 'स्पष्ट चरणों के साथ सीखने से कमाई तक व्यावहारिक विकास की योजना बनाएं।',
    landingFeatureCommunityTitle: 'समुदाय-केंद्रित सहायता',
    landingFeatureCommunityDescription: 'ग्रामीण समुदायों के लिए सरल, बहुभाषी और भरोसेमंद अनुभव।',
    landingSkillIndiaImageAlt: 'प्रधानमंत्री नरेंद्र मोदी',
    landingSkillIndiaLabel: 'स्किल इंडिया का दृष्टिकोण',
    landingSkillIndiaTitle: 'कौशल आत्मविश्वास, अवसर और सम्मान का आधार हैं।',
    landingSkillIndiaQuote: 'जब हमारे युवा कुशल होते हैं, तो भारत आत्मविश्वास के साथ आगे बढ़ता है।',
    landingSkillIndiaDescription: 'स्किल इंडिया सीखने को वास्तविक काम, स्थानीय अवसरों और हर समुदाय के मजबूत भविष्य से जोड़ता है।',
    landingSkillIndiaAttribution: 'स्किल इंडिया मिशन से प्रेरित',
    landingFooterDescription: 'कौशल, प्रशिक्षण और स्थानीय आजीविका के अवसरों के लिए व्यावहारिक मार्गदर्शन।',
    landingFooterExplore: 'देखें',
    landingFooterVerify: 'प्रमाणपत्र सत्यापित करें',
    landingFooterPlatform: 'प्लेटफॉर्म',
    landingFooterStayConnected: 'संपर्क में रहें',
    landingFooterContactDescription: 'अगले कदम के बारे में सवाल हैं? हमारी टीम आपकी मदद के लिए तैयार है।',
    landingFooterCopyright: 'आजीविका नेविगेटर। अवसरों के लिए बनाया गया।',
    landingFooterBuiltFor: 'हर सीखने वाले और कामगार के लिए।',
  },
  mr: {
    landingEyebrow: 'उपजीविका नेव्हिगेटर', landingHeroTitle: 'तुमच्या उपजीविकेसाठी योग्य कौशल्य, प्रशिक्षण आणि भविष्य शोधा.', landingHeroDescription: 'तुमच्या क्षमता, भाषा आणि स्थानिक परिस्थितीनुसार करिअर मार्ग, प्रशिक्षण केंद्रे आणि संधी शोधण्यात आम्ही मदत करतो.', landingSignUp: 'साइन अप करा', landingTrustAi: 'एआय करिअर मार्गदर्शन', landingTrustRoadmaps: 'कौशल्य रोडमॅप', landingTrustLocal: 'स्थानिक संधी जुळवणी', landingRecommendedStep: 'पुढील सुचवलेले पाऊल', landingExampleRole: 'शिंपी आणि वस्त्र तंत्रज्ञ', landingMatchedSkills: 'तुमच्या कौशल्यांशी जुळते', landingLocalTraining: 'स्थानिक प्रशिक्षण पर्याय', landingCareerConfidence: 'करिअरचा आत्मविश्वास', landingPathwayTracked: 'प्रगती नोंदवली आहे', landingOpportunityMatch: 'संधी जुळवणी', landingRelevantOpportunities: 'संबंधित स्थानिक संधी', landingAboutEyebrow: 'आमच्याबद्दल', landingAboutTitle: 'कौशल्यांना स्थिर उपजीविकेत बदलण्यास मदत.', landingAboutDescription: 'उपजीविका नेव्हिगेटर तंत्रज्ञान, कौशल्य शोध आणि स्थानिक संधींची माहिती एकत्र आणतो.', landingAboutPointOne: 'प्रत्यक्ष करिअर विकासासाठी NSQF आधारित कौशल्य शिफारसी.', landingAboutPointTwo: 'प्रशिक्षण, रोजगार तयारी आणि योजनांच्या शोधासाठी मदत.', landingAboutPointThree: 'स्थानिक उपजीविकेच्या गरजांनुसार सुलभ मार्गदर्शन.', landingSkillFit: 'कौशल्य जुळवणी', landingCommunityRecommendations: 'समुदाय-केंद्रित शिफारसी', landingSkillFitDescription: 'आवडी, क्षमता आणि स्थानिक बाजारपेठेची मागणी एका ठिकाणी समजून घ्या.', landingSupport: 'मदत', landingLearningToEarning: 'शिकण्यापासून कमाईपर्यंत', landingSupportDescription: 'रोडमॅप, योजना आणि जवळची केंद्रे आत्मविश्वासाने पाहा.', landingWhyEyebrow: 'हे महत्त्वाचे का आहे', landingWhyTitle: 'वास्तविक विकास प्रवासासाठी तयार.', landingStartEyebrow: 'आजच सुरू करा', landingCtaTitle: 'तुमचे प्रोफाइल तयार करा आणि योग्य संधी शोधा.', landingSignUpNow: 'आत्ताच साइन अप करा', landingFeatureAiTitle: 'एआय आधारित मार्गदर्शन', landingFeatureAiDescription: 'तुमच्या कौशल्य, स्थान आणि उपजीविका ध्येयांनुसार वैयक्तिक करिअर सूचना.', landingFeatureLocalTitle: 'स्थानिक संधी नकाशा', landingFeatureLocalDescription: 'तुमच्या परिसरातील प्रशिक्षण केंद्रे, योजना आणि कामाच्या संधी शोधा.', landingFeatureRoadmapTitle: 'करिअर रोडमॅप', landingFeatureRoadmapDescription: 'शिकण्यापासून कमाईपर्यंत स्पष्ट टप्प्यांसह योजना करा.', landingFeatureCommunityTitle: 'समुदाय-केंद्रित मदत', landingFeatureCommunityDescription: 'ग्रामीण समुदायांसाठी सोपा, बहुभाषिक आणि विश्वासार्ह अनुभव.', landingSkillIndiaImageAlt: 'पंतप्रधान नरेंद्र मोदी', landingSkillIndiaLabel: 'स्किल इंडिया दृष्टिकोन', landingSkillIndiaTitle: 'कौशल्य आत्मविश्वास, संधी आणि सन्मान निर्माण करते.', landingSkillIndiaQuote: 'कुशल युवा भारताला आत्मविश्वासाने पुढे नेतात.', landingSkillIndiaDescription: 'स्किल इंडिया शिक्षणाला प्रत्यक्ष काम आणि स्थानिक संधींशी जोडतो.', landingSkillIndiaAttribution: 'स्किल इंडिया मिशनपासून प्रेरित',
  },
  bn: {
    landingEyebrow: 'জীবিকা নেভিগেটর', landingHeroTitle: 'আপনার জীবিকার জন্য সঠিক দক্ষতা, প্রশিক্ষণ ও ভবিষ্যৎ খুঁজুন।', landingHeroDescription: 'আপনার শক্তি, ভাষা ও স্থানীয় বাস্তবতার সঙ্গে মিলিয়ে কর্মজীবনের পথ, প্রশিক্ষণ কেন্দ্র ও সুযোগ খুঁজে পেতে আমরা সাহায্য করি।', landingSignUp: 'সাইন আপ করুন', landingTrustAi: 'এআই ক্যারিয়ার নির্দেশনা', landingTrustRoadmaps: 'দক্ষতার রোডম্যাপ', landingTrustLocal: 'স্থানীয় সুযোগ মিল', landingRecommendedStep: 'পরবর্তী প্রস্তাবিত পদক্ষেপ', landingExampleRole: 'দর্জি ও পোশাক প্রযুক্তিবিদ', landingMatchedSkills: 'আপনার দক্ষতার সঙ্গে মিল', landingLocalTraining: 'স্থানীয় প্রশিক্ষণের সুযোগ', landingCareerConfidence: 'ক্যারিয়ারে আত্মবিশ্বাস', landingPathwayTracked: 'পথের অগ্রগতি নথিভুক্ত', landingOpportunityMatch: 'সুযোগের মিল', landingRelevantOpportunities: 'প্রাসঙ্গিক স্থানীয় সুযোগ', landingAboutEyebrow: 'আমাদের সম্পর্কে', landingAboutTitle: 'দক্ষতাকে স্থায়ী জীবিকায় রূপ দিতে সাহায্য।', landingAboutDescription: 'জীবিকা নেভিগেটর প্রযুক্তি, দক্ষতা খোঁজ এবং স্থানীয় সুযোগের তথ্য একত্র করে।', landingAboutPointOne: 'বাস্তব কর্মজীবন উন্নতির জন্য NSQF-ভিত্তিক দক্ষতা সুপারিশ।', landingAboutPointTwo: 'প্রশিক্ষণ, কর্মসংস্থান প্রস্তুতি ও প্রকল্প খোঁজার সহায়তা।', landingAboutPointThree: 'স্থানীয় জীবিকার বাস্তবতার জন্য সহজ নির্দেশনা।', landingSkillFit: 'দক্ষতার মিল', landingCommunityRecommendations: 'সম্প্রদায়-কেন্দ্রিক সুপারিশ', landingSkillFitDescription: 'আগ্রহ, শক্তি ও স্থানীয় বাজারের চাহিদা এক জায়গায় বুঝুন।', landingSupport: 'সহায়তা', landingLearningToEarning: 'শেখা থেকে আয় পর্যন্ত', landingSupportDescription: 'রোডম্যাপ, প্রকল্প ও কাছের কেন্দ্র আত্মবিশ্বাসের সঙ্গে দেখুন।', landingWhyEyebrow: 'কেন গুরুত্বপূর্ণ', landingWhyTitle: 'বাস্তব উন্নয়ন যাত্রার জন্য তৈরি।', landingStartEyebrow: 'আজই শুরু করুন', landingCtaTitle: 'প্রোফাইল তৈরি করুন এবং সঠিক সুযোগ খুঁজুন।', landingSignUpNow: 'এখনই সাইন আপ করুন', landingFeatureAiTitle: 'এআই-চালিত নির্দেশনা', landingFeatureAiDescription: 'আপনার দক্ষতা, অবস্থান ও জীবিকার লক্ষ্য অনুযায়ী ব্যক্তিগত পরামর্শ।', landingFeatureLocalTitle: 'স্থানীয় সুযোগের মানচিত্র', landingFeatureLocalDescription: 'আপনার এলাকার প্রশিক্ষণ কেন্দ্র, প্রকল্প ও কাজের সুযোগ খুঁজুন।', landingFeatureRoadmapTitle: 'ক্যারিয়ার রোডম্যাপ', landingFeatureRoadmapDescription: 'শেখা থেকে আয় পর্যন্ত পরিষ্কার ধাপে পরিকল্পনা করুন।', landingFeatureCommunityTitle: 'সম্প্রদায়-কেন্দ্রিক সহায়তা', landingFeatureCommunityDescription: 'গ্রামীণ সম্প্রদায়ের জন্য সহজ, বহুভাষিক ও নির্ভরযোগ্য অভিজ্ঞতা।', landingSkillIndiaImageAlt: 'প্রধানমন্ত্রী নরেন্দ্র মোদী', landingSkillIndiaLabel: 'স্কিল ইন্ডিয়ার দৃষ্টিভঙ্গি', landingSkillIndiaTitle: 'দক্ষতা আত্মবিশ্বাস, সুযোগ ও মর্যাদা তৈরি করে।', landingSkillIndiaQuote: 'দক্ষ যুবসমাজ আত্মবিশ্বাসের সঙ্গে ভারতকে এগিয়ে নিয়ে যায়।', landingSkillIndiaDescription: 'স্কিল ইন্ডিয়া শিক্ষাকে বাস্তব কাজ ও স্থানীয় সুযোগের সঙ্গে যুক্ত করে।', landingSkillIndiaAttribution: 'স্কিল ইন্ডিয়া মিশন থেকে অনুপ্রাণিত',
  },
  ta: {
    landingEyebrow: 'வாழ்வாதார வழிகாட்டி', landingHeroTitle: 'உங்கள் வாழ்வாதாரத்திற்கு சரியான திறன், பயிற்சி மற்றும் எதிர்காலத்தைத் தேடுங்கள்.', landingHeroDescription: 'உங்கள் திறன்கள், மொழி மற்றும் உள்ளூர் சூழலுக்கு ஏற்ற தொழில் பாதைகள், பயிற்சி மையங்கள் மற்றும் வாய்ப்புகளை கண்டறிய உதவுகிறோம்.', landingSignUp: 'பதிவு செய்யவும்', landingTrustAi: 'AI தொழில் வழிகாட்டுதல்', landingTrustRoadmaps: 'திறன் வழித்தடங்கள்', landingTrustLocal: 'உள்ளூர் வாய்ப்பு பொருத்தம்', landingRecommendedStep: 'அடுத்த பரிந்துரைக்கப்பட்ட படி', landingExampleRole: 'தையல் மற்றும் ஆடை தொழில்நுட்ப நிபுணர்', landingMatchedSkills: 'உங்கள் திறன்களுடன் பொருந்தும்', landingLocalTraining: 'உள்ளூர் பயிற்சி வாய்ப்புகள்', landingCareerConfidence: 'தொழில் நம்பிக்கை', landingPathwayTracked: 'பாதை கண்காணிக்கப்பட்டது', landingOpportunityMatch: 'வாய்ப்பு பொருத்தம்', landingRelevantOpportunities: 'தொடர்புடைய உள்ளூர் வாய்ப்புகள்', landingAboutEyebrow: 'எங்களைப் பற்றி', landingAboutTitle: 'திறன்களை நிலையான வாழ்வாதாரமாக மாற்ற உதவுகிறோம்.', landingAboutDescription: 'வாழ்வாதார வழிகாட்டி தொழில்நுட்பம், திறன் தேடல் மற்றும் உள்ளூர் வாய்ப்புத் தகவலை இணைக்கிறது.', landingAboutPointOne: 'உண்மையான தொழில் வளர்ச்சிக்கான NSQF திறன் பரிந்துரைகள்.', landingAboutPointTwo: 'பயிற்சி, வேலைத் தயாரிப்பு மற்றும் திட்டங்களைத் தேட உதவி.', landingAboutPointThree: 'உள்ளூர் வாழ்வாதாரத்திற்கேற்ற எளிய வழிகாட்டுதல்.', landingSkillFit: 'திறன் பொருத்தம்', landingCommunityRecommendations: 'சமூகத்தை முதன்மைப்படுத்திய பரிந்துரைகள்', landingSkillFitDescription: 'ஆர்வம், திறன் மற்றும் உள்ளூர் சந்தைத் தேவையை ஒரே இடத்தில் புரிந்துகொள்ளுங்கள்.', landingSupport: 'ஆதரவு', landingLearningToEarning: 'கற்றலில் இருந்து வருமானம் வரை', landingSupportDescription: 'வழித்தடங்கள், திட்டங்கள் மற்றும் அருகிலுள்ள மையங்களை நம்பிக்கையுடன் கண்காணிக்கவும்.', landingWhyEyebrow: 'இது ஏன் முக்கியம்', landingWhyTitle: 'உண்மையான வளர்ச்சி பயணங்களுக்காக உருவாக்கப்பட்டது.', landingStartEyebrow: 'இன்றே தொடங்குங்கள்', landingCtaTitle: 'உங்கள் சுயவிவரத்தை உருவாக்கி சரியான வாய்ப்பைக் கண்டறியுங்கள்.', landingSignUpNow: 'இப்போது பதிவு செய்யவும்', landingFeatureAiTitle: 'AI வழிகாட்டுதல்', landingFeatureAiDescription: 'உங்கள் திறன், இருப்பிடம் மற்றும் வாழ்வாதார இலக்குகளுக்கேற்ற தனிப்பட்ட தொழில் ஆலோசனைகள்.', landingFeatureLocalTitle: 'உள்ளூர் வாய்ப்பு வரைபடம்', landingFeatureLocalDescription: 'உங்கள் பகுதியிலுள்ள பயிற்சி மையங்கள், திட்டங்கள் மற்றும் வேலை வாய்ப்புகளைக் கண்டறியுங்கள்.', landingFeatureRoadmapTitle: 'தொழில் வழித்தடம்', landingFeatureRoadmapDescription: 'கற்றலில் இருந்து வருமானம் வரை தெளிவான படிகளுடன் திட்டமிடுங்கள்.', landingFeatureCommunityTitle: 'சமூக மைய ஆதரவு', landingFeatureCommunityDescription: 'கிராமப்புற சமூகங்களுக்கான எளிய, பல்மொழி மற்றும் நம்பகமான அனுபவம்.', landingSkillIndiaImageAlt: 'பிரதமர் நரேந்திர மோடி', landingSkillIndiaLabel: 'ஸ்கில் இந்தியா பார்வை', landingSkillIndiaTitle: 'திறன்கள் நம்பிக்கை, வாய்ப்பு மற்றும் மரியாதையை உருவாக்குகின்றன.', landingSkillIndiaQuote: 'திறன் பெற்ற இளைஞர்கள் இந்தியாவை நம்பிக்கையுடன் முன்னேற்றுகிறார்கள்.', landingSkillIndiaDescription: 'ஸ்கில் இந்தியா கற்றலை உண்மையான வேலை மற்றும் உள்ளூர் வாய்ப்புகளுடன் இணைக்கிறது.', landingSkillIndiaAttribution: 'ஸ்கில் இந்தியா இயக்கத்தால் ஈர்க்கப்பட்டது',
  },
  te: {
    landingEyebrow: 'జీవనోపాధి నావిగేటర్', landingHeroTitle: 'మీ జీవనోపాధికి సరైన నైపుణ్యం, శిక్షణ మరియు భవిష్యత్తును కనుగొనండి.', landingHeroDescription: 'మీ బలాలు, భాష మరియు స్థానిక పరిస్థితులకు సరిపోయే కెరీర్ మార్గాలు, శిక్షణ కేంద్రాలు మరియు అవకాశాలను కనుగొనడంలో మేము సహాయపడతాము.', landingSignUp: 'సైన్ అప్ చేయండి', landingTrustAi: 'AI కెరీర్ మార్గదర్శకత్వం', landingTrustRoadmaps: 'నైపుణ్య మార్గపటం', landingTrustLocal: 'స్థానిక అవకాశాల సరిపోలిక', landingRecommendedStep: 'తదుపరి సిఫార్సు చేసిన అడుగు', landingExampleRole: 'దర్జీ మరియు వస్త్ర సాంకేతిక నిపుణుడు', landingMatchedSkills: 'మీ నైపుణ్యాలకు సరిపోతుంది', landingLocalTraining: 'స్థానిక శిక్షణ అవకాశాలు', landingCareerConfidence: 'కెరీర్ విశ్వాసం', landingPathwayTracked: 'మార్గం నమోదు చేయబడింది', landingOpportunityMatch: 'అవకాశం సరిపోలిక', landingRelevantOpportunities: 'సంబంధిత స్థానిక అవకాశాలు', landingAboutEyebrow: 'మా గురించి', landingAboutTitle: 'నైపుణ్యాలను స్థిరమైన జీవనోపాధిగా మార్చడంలో సహాయం.', landingAboutDescription: 'జీవనోపాధి నావిగేటర్ సాంకేతికత, నైపుణ్య శోధన మరియు స్థానిక అవకాశాల సమాచారాన్ని కలుపుతుంది.', landingAboutPointOne: 'వాస్తవ కెరీర్ అభివృద్ధి కోసం NSQF నైపుణ్య సిఫార్సులు.', landingAboutPointTwo: 'శిక్షణ, ఉద్యోగ సిద్ధత మరియు పథకాల అన్వేషణకు సహాయం.', landingAboutPointThree: 'స్థానిక జీవనోపాధి వాస్తవాలకు సరిపోయే సులభమైన మార్గదర్శకత్వం.', landingSkillFit: 'నైపుణ్య సరిపోలిక', landingCommunityRecommendations: 'సమాజం-ముందు సిఫార్సులు', landingSkillFitDescription: 'ఆసక్తులు, బలాలు మరియు స్థానిక మార్కెట్ అవసరాన్ని ఒకే చోట అర్థం చేసుకోండి.', landingSupport: 'మద్దతు', landingLearningToEarning: 'నేర్చుకోవడం నుంచి సంపాదన వరకు', landingSupportDescription: 'మార్గపటాలు, పథకాలు మరియు సమీప కేంద్రాలను విశ్వాసంతో ట్రాక్ చేయండి.', landingWhyEyebrow: 'ఇది ఎందుకు ముఖ్యం', landingWhyTitle: 'నిజమైన అభివృద్ధి ప్రయాణాల కోసం నిర్మించబడింది.', landingStartEyebrow: 'ఈరోజే ప్రారంభించండి', landingCtaTitle: 'మీ ప్రొఫైల్ సృష్టించి సరైన అవకాశాన్ని కనుగొనండి.', landingSignUpNow: 'ఇప్పుడే సైన్ అప్ చేయండి', landingFeatureAiTitle: 'AI ఆధారిత మార్గదర్శకత్వం', landingFeatureAiDescription: 'మీ నైపుణ్యాలు, స్థానం మరియు జీవనోపాధి లక్ష్యాలకు సరిపోయే వ్యక్తిగత కెరీర్ సూచనలు.', landingFeatureLocalTitle: 'స్థానిక అవకాశాల మ్యాప్', landingFeatureLocalDescription: 'మీ ప్రాంతంలోని శిక్షణ కేంద్రాలు, పథకాలు మరియు పని అవకాశాలను కనుగొనండి.', landingFeatureRoadmapTitle: 'కెరీర్ మార్గపటం', landingFeatureRoadmapDescription: 'నేర్చుకోవడం నుంచి సంపాదన వరకు స్పష్టమైన దశలతో ప్రణాళిక చేయండి.', landingFeatureCommunityTitle: 'సమాజం-ముందు మద్దతు', landingFeatureCommunityDescription: 'గ్రామీణ సమాజాల కోసం సరళమైన, బహుభాషా మరియు విశ్వసనీయ అనుభవం.', landingSkillIndiaImageAlt: 'ప్రధానమంత్రి నరేంద్ర మోదీ', landingSkillIndiaLabel: 'స్కిల్ ఇండియా దృష్టి', landingSkillIndiaTitle: 'నైపుణ్యాలు విశ్వాసం, అవకాశాలు మరియు గౌరవాన్ని సృష్టిస్తాయి.', landingSkillIndiaQuote: 'నైపుణ్యం కలిగిన యువత భారతదేశాన్ని విశ్వాసంతో ముందుకు నడిపిస్తారు.', landingSkillIndiaDescription: 'స్కిల్ ఇండియా అభ్యాసాన్ని నిజమైన పని మరియు స్థానిక అవకాశాలతో కలుపుతుంది.', landingSkillIndiaAttribution: 'స్కిల్ ఇండియా మిషన్‌ నుండి ప్రేరణ',
  },
  gu: {
    landingEyebrow: 'આજીવિકા નેવિગેટર', landingHeroTitle: 'તમારી આજીવિકા માટે યોગ્ય કૌશલ્ય, તાલીમ અને ભવિષ્ય શોધો.', landingHeroDescription: 'તમારી ક્ષમતા, ભાષા અને સ્થાનિક પરિસ્થિતિને અનુરૂપ કારકિર્દી માર્ગો, તાલીમ કેન્દ્રો અને તકો શોધવામાં અમે મદદ કરીએ છીએ.', landingSignUp: 'સાઇન અપ કરો', landingTrustAi: 'AI કારકિર્દી માર્ગદર્શન', landingTrustRoadmaps: 'કૌશલ્ય રોડમેપ', landingTrustLocal: 'સ્થાનિક તક મેળ', landingRecommendedStep: 'આગળનું સૂચવેલું પગલું', landingExampleRole: 'દરજી અને વસ્ત્ર ટેકનિશિયન', landingMatchedSkills: 'તમારા કૌશલ્ય સાથે મેળ', landingLocalTraining: 'સ્થાનિક તાલીમ વિકલ્પો', landingCareerConfidence: 'કારકિર્દી આત્મવિશ્વાસ', landingPathwayTracked: 'માર્ગની પ્રગતિ નોંધાઈ', landingOpportunityMatch: 'તકનો મેળ', landingRelevantOpportunities: 'સંબંધિત સ્થાનિક તકો', landingAboutEyebrow: 'અમારા વિશે', landingAboutTitle: 'કૌશલ્યને સ્થિર આજીવિકામાં બદલવામાં મદદ.', landingAboutDescription: 'આજીવિકા નેવિગેટર ટેકનોલોજી, કૌશલ્ય શોધ અને સ્થાનિક તકોની માહિતી જોડે છે.', landingAboutPointOne: 'વાસ્તવિક કારકિર્દી વિકાસ માટે NSQF આધારિત કૌશલ્ય ભલામણો.', landingAboutPointTwo: 'તાલીમ, રોજગાર તૈયારી અને યોજનાઓ શોધવા માટે સહાય.', landingAboutPointThree: 'સ્થાનિક આજીવિકા જરૂરિયાતો અનુસાર સરળ માર્ગદર્શન.', landingSkillFit: 'કૌશલ્ય મેળ', landingCommunityRecommendations: 'સમુદાય આધારિત ભલામણો', landingSkillFitDescription: 'રસ, ક્ષમતા અને સ્થાનિક બજારની માંગ એક જગ્યાએ સમજો.', landingSupport: 'સહાય', landingLearningToEarning: 'શીખવાથી કમાણી સુધી', landingSupportDescription: 'રોડમેપ, યોજનાઓ અને નજીકના કેન્દ્રો વિશ્વાસથી જુઓ.', landingWhyEyebrow: 'આ શા માટે મહત્વનું છે', landingWhyTitle: 'વાસ્તવિક વિકાસ યાત્રા માટે બનાવ્યું.', landingStartEyebrow: 'આજે શરૂ કરો', landingCtaTitle: 'પ્રોફાઇલ બનાવો અને યોગ્ય તક શોધો.', landingSignUpNow: 'હમણાં સાઇન અપ કરો', landingFeatureAiTitle: 'AI આધારિત માર્ગદર્શન', landingFeatureAiDescription: 'તમારા કૌશલ્ય, સ્થાન અને આજીવિકા લક્ષ્યો અનુસાર વ્યક્તિગત સૂચનો.', landingFeatureLocalTitle: 'સ્થાનિક તક નકશો', landingFeatureLocalDescription: 'તમારા વિસ્તારના તાલીમ કેન્દ્રો, યોજનાઓ અને કામની તકો શોધો.', landingFeatureRoadmapTitle: 'કારકિર્દી રોડમેપ', landingFeatureRoadmapDescription: 'શીખવાથી કમાણી સુધી સ્પષ્ટ પગલાં સાથે આયોજન કરો.', landingFeatureCommunityTitle: 'સમુદાય આધારિત સહાય', landingFeatureCommunityDescription: 'ગ્રામ્ય સમુદાયો માટે સરળ, બહుభાષી અને વિશ્વાસપાત્ર અનુભવ.', landingSkillIndiaImageAlt: 'પ્રધાનમંત્રી નરેન્દ્ર મોદી', landingSkillIndiaLabel: 'સ્કિલ ઇન્ડિયા દૃષ્ટિકોણ', landingSkillIndiaTitle: 'કૌશલ્ય આત્મવિશ્વાસ, તક અને સન્માન બનાવે છે.', landingSkillIndiaQuote: 'કુશળ યુવાનો ભારતને આત્મવિશ્વાસથી આગળ વધારે છે.', landingSkillIndiaDescription: 'સ્કિલ ઇન્ડિયા શિક્ષણને વાસ્તવિક કામ અને સ્થાનિક તકો સાથે જોડે છે.', landingSkillIndiaAttribution: 'સ્કિલ ઇન્ડિયા મિશનથી પ્રેરિત',
  },
  kn: {
    landingEyebrow: 'ಜೀವನೋಪಾಯ ನ್ಯಾವಿಗೇಟರ್', landingHeroTitle: 'ನಿಮ್ಮ ಜೀವನೋಪಾಯಕ್ಕೆ ಸರಿಯಾದ ಕೌಶಲ್ಯ, ತರಬೇತಿ ಮತ್ತು ಭವಿಷ್ಯವನ್ನು ಕಂಡುಕೊಳ್ಳಿ.', landingHeroDescription: 'ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯ, ಭಾಷೆ ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗೆ ಹೊಂದುವ ವೃತ್ತಿ ಮಾರ್ಗಗಳು, ತರಬೇತಿ ಕೇಂದ್ರಗಳು ಮತ್ತು ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.', landingSignUp: 'ಸೈನ್ ಅಪ್ ಮಾಡಿ', landingTrustAi: 'AI ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ', landingTrustRoadmaps: 'ಕೌಶಲ್ಯ ಮಾರ್ಗನಕ್ಷೆ', landingTrustLocal: 'ಸ್ಥಳೀಯ ಅವಕಾಶ ಹೊಂದಾಣಿಕೆ', landingRecommendedStep: 'ಮುಂದಿನ ಶಿಫಾರಸು ಹೆಜ್ಜೆ', landingExampleRole: 'ದರ್ಜಿ ಮತ್ತು ಉಡುಪು ತಂತ್ರಜ್ಞ', landingMatchedSkills: 'ನಿಮ್ಮ ಕೌಶಲ್ಯಕ್ಕೆ ಹೊಂದಿಕೆ', landingLocalTraining: 'ಸ್ಥಳೀಯ ತರಬೇತಿ ಆಯ್ಕೆಗಳು', landingCareerConfidence: 'ವೃತ್ತಿ ಆತ್ಮವಿಶ್ವಾಸ', landingPathwayTracked: 'ಮಾರ್ಗದ ಪ್ರಗತಿ ದಾಖಲಾಗಿದೆ', landingOpportunityMatch: 'ಅವಕಾಶ ಹೊಂದಾಣಿಕೆ', landingRelevantOpportunities: 'ಸಂಬಂಧಿತ ಸ್ಥಳೀಯ ಅವಕಾಶಗಳು', landingAboutEyebrow: 'ನಮ್ಮ ಬಗ್ಗೆ', landingAboutTitle: 'ಕೌಶಲ್ಯಗಳನ್ನು ಸ್ಥಿರ ಜೀವನೋಪಾಯವಾಗಿ ರೂಪಿಸಲು ಸಹಾಯ.', landingAboutDescription: 'ಜೀವನೋಪಾಯ ನ್ಯಾವಿಗೇಟರ್ ತಂತ್ರಜ್ಞಾನ, ಕೌಶಲ್ಯ ಹುಡುಕಾಟ ಮತ್ತು ಸ್ಥಳೀಯ ಅವಕಾಶಗಳ ಮಾಹಿತಿಯನ್ನು ಒಟ್ಟುಗೂಡಿಸುತ್ತದೆ.', landingAboutPointOne: 'ನೈಜ ವೃತ್ತಿ ಬೆಳವಣಿಗೆಗಾಗಿ NSQF ಕೌಶಲ್ಯ ಶಿಫಾರಸುಗಳು.', landingAboutPointTwo: 'ತರಬೇತಿ, ಉದ್ಯೋಗ ಸಿದ್ಧತೆ ಮತ್ತು ಯೋಜನೆಗಳ ಹುಡುಕಾಟಕ್ಕೆ ಬೆಂಬಲ.', landingAboutPointThree: 'ಸ್ಥಳೀಯ ಜೀವನೋಪಾಯದ ಅಗತ್ಯಗಳಿಗೆ ಸರಳ ಮಾರ್ಗದರ್ಶನ.', landingSkillFit: 'ಕೌಶಲ್ಯ ಹೊಂದಾಣಿಕೆ', landingCommunityRecommendations: 'ಸಮುದಾಯ-ಮೊದಲ ಶಿಫಾರಸುಗಳು', landingSkillFitDescription: 'ಆಸಕ್ತಿ, ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.', landingSupport: 'ಬೆಂಬಲ', landingLearningToEarning: 'ಕಲಿಕೆಯಿಂದ ಗಳಿಕೆಯವರೆಗೆ', landingSupportDescription: 'ಮಾರ್ಗನಕ್ಷೆ, ಯೋಜನೆ ಮತ್ತು ಹತ್ತಿರದ ಕೇಂದ್ರಗಳನ್ನು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಗಮನಿಸಿ.', landingWhyEyebrow: 'ಇದು ಏಕೆ ಮುಖ್ಯ', landingWhyTitle: 'ನೈಜ ಅಭಿವೃದ್ಧಿ ಪ್ರಯಾಣಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.', landingStartEyebrow: 'ಇಂದೇ ಪ್ರಾರಂಭಿಸಿ', landingCtaTitle: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ ಮತ್ತು ಸರಿಯಾದ ಅವಕಾಶವನ್ನು ಕಂಡುಕೊಳ್ಳಿ.', landingSignUpNow: 'ಈಗ ಸೈನ್ ಅಪ್ ಮಾಡಿ', landingFeatureAiTitle: 'AI ಆಧಾರಿತ ಮಾರ್ಗದರ್ಶನ', landingFeatureAiDescription: 'ನಿಮ್ಮ ಕೌಶಲ್ಯ, ಸ್ಥಳ ಮತ್ತು ಜೀವನೋಪಾಯ ಗುರಿಗಳಿಗೆ ಹೊಂದುವ ವೈಯಕ್ತಿಕ ಸಲಹೆಗಳು.', landingFeatureLocalTitle: 'ಸ್ಥಳೀಯ ಅವಕಾಶ ನಕ್ಷೆ', landingFeatureLocalDescription: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ತರಬೇತಿ ಕೇಂದ್ರಗಳು, ಯೋಜನೆಗಳು ಮತ್ತು ಕೆಲಸದ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.', landingFeatureRoadmapTitle: 'ವೃತ್ತಿ ಮಾರ್ಗನಕ್ಷೆ', landingFeatureRoadmapDescription: 'ಕಲಿಕೆಯಿಂದ ಗಳಿಕೆಯವರೆಗೆ ಸ್ಪಷ್ಟ ಹಂತಗಳೊಂದಿಗೆ ಯೋಜಿಸಿ.', landingFeatureCommunityTitle: 'ಸಮುದಾಯ-ಮೊದಲ ಬೆಂಬಲ', landingFeatureCommunityDescription: 'ಗ್ರಾಮೀಣ ಸಮುದಾಯಗಳಿಗಾಗಿ ಸರಳ, ಬಹುಭಾಷಾ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಅನುಭವ.', landingSkillIndiaImageAlt: 'ಪ್ರಧಾನಮಂತ್ರಿ ನರೇಂದ್ರ ಮೋದಿ', landingSkillIndiaLabel: 'ಸ್ಕಿಲ್ ಇಂಡಿಯಾ ದೃಷ್ಟಿಕೋನ', landingSkillIndiaTitle: 'ಕೌಶಲ್ಯವು ಆತ್ಮವಿಶ್ವಾಸ, ಅವಕಾಶ ಮತ್ತು ಗೌರವವನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.', landingSkillIndiaQuote: 'ಕೌಶಲ್ಯ ಹೊಂದಿದ ಯುವಕರು ಭಾರತವನ್ನು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮುನ್ನಡೆಸುತ್ತಾರೆ.', landingSkillIndiaDescription: 'ಸ್ಕಿಲ್ ಇಂಡಿಯಾ ಕಲಿಕೆಯನ್ನು ನೈಜ ಕೆಲಸ ಮತ್ತು ಸ್ಥಳೀಯ ಅವಕಾಶಗಳೊಂದಿಗೆ ಜೋಡಿಸುತ್ತದೆ.', landingSkillIndiaAttribution: 'ಸ್ಕಿಲ್ ಇಂಡಿಯಾ ಮಿಷನ್‌ನಿಂದ ಪ್ರೇರಿತ',
  },
};

const LANDING_LANGUAGE_ALIASES = {
  pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', bho: 'भोजपुरी', mag: 'मगही', bns: 'बुंदेली',
};

Object.entries(LANDING_LANGUAGE_ALIASES).forEach(([languageCode, languageName]) => {
  LANDING_TRANSLATIONS[languageCode] = Object.fromEntries(
    Object.entries(LANDING_TRANSLATIONS.en).map(([key, value]) => [key, `${languageName}: ${value}`]),
  );
});

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('app_language', langCode);
  };

  const t = (key) => {
    const langDict = { ...TRANSLATIONS.en, ...TRANSLATIONS[language], ...LANDING_TRANSLATIONS.en, ...LANDING_TRANSLATIONS[language] };
    return langDict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
