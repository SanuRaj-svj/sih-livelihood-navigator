const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const LivelihoodDigitalTwin = require('../models/LivelihoodDigitalTwin');
const { assessLivelihood } = require('./ai/livelihoodAssessmentClient');

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const normalizeVoiceEducation = (value) => ({
  primary: '5th Pass',
  middle: '8th Pass',
  secondary_10th: '10th Pass',
  higher_secondary_12th: '12th Pass',
  diploma: 'Diploma',
  iti: 'ITI',
  graduate: 'Graduate',
  post_graduate: 'Post Graduate',
}[String(value || '').toLowerCase()] || undefined);

const normalizeVoicePreference = (value) => ({
  wage_employment: 'WAGE_EMPLOYMENT',
  self_employment: 'SELF_EMPLOYMENT',
  apprenticeship: 'ANY',
  home_based: 'ANY',
  any: 'ANY',
}[String(value || '').toLowerCase()] || undefined);

const canonicalVoiceProfileToPersistenceShape = (profile = {}) => ({
  personal: {
    age: profile.age,
    gender: ['female', 'male', 'transgender', 'other'].includes(String(profile.gender || '').toLowerCase())
      ? String(profile.gender).toLowerCase()
      : undefined,
    community: profile.community,
  },
  education: { level: normalizeVoiceEducation(profile.education_level), field: profile.education_field },
  location: profile.location || {},
  livelihood: {
    currentOccupation: profile.current_occupation,
    familyOccupation: profile.family_occupation,
    currentIncomeRange: profile.current_income_range,
  },
  skills: asArray(profile.normalized_skills).map((skill) => skill.name || skill.label || skill),
  traditionalSkills: asArray(profile.traditional_skills),
  interests: asArray(profile.interests),
  aspirations: asArray(profile.aspirations),
  employmentPreference: normalizeVoicePreference(profile.employment_preference),
  mobility: {
    willingToTravel: profile.willingness_to_travel,
    maxDistanceKm: profile.max_travel_distance_km,
  },
  physicalConstraints: profile.physical_constraints ? [profile.physical_constraints] : [],
  preferredLanguage: profile.preferred_language || 'hi',
  profileCompletion: profile.profile_completion_pct || 0,
  source: 'VOICE',
});

const buildWorkflowSnapshot = ({ profile, assessment, source = 'FORM' }) => {
  const recommendations = asArray(assessment?.recommendations);
  const skills = [...asArray(profile.skills), ...asArray(profile.traditionalSkills)];
  const constraints = asArray(profile.physicalConstraints);
  const aspirations = [...asArray(profile.aspirations), ...asArray(profile.interests)];
  const skillGaps = recommendations.flatMap((item) => asArray(item.details?.skillGaps));
  const roadmapSteps = recommendations.flatMap((item) => asArray(item.details?.roadmap));

  return {
    profileSnapshot: profile.toObject ? profile.toObject() : profile,
    documentVerification: profile.verification || { scCertificateStatus: 'NOT_SUBMITTED' },
    skillEngine: { current: skills, normalized: skills },
    constraintEngine: {
      physical: constraints,
      mobility: profile.mobility || {},
      employmentPreference: profile.employmentPreference || 'ANY',
    },
    aspirationEngine: { goals: aspirations, occupations: asArray(profile.aspirations) },
    skillGapEngine: {
      nsqf: skillGaps,
      rpl: skills.length ? [{ status: 'PENDING_VALIDATION', skills }] : [],
      demand: recommendations.map((item) => item.details?.sector).filter(Boolean),
    },
    opportunityMatcher: {
      training: recommendations.filter((item) => item.type === 'COURSE'),
      jobs: recommendations.filter((item) => item.type === 'OPPORTUNITY' && item.details?.pathwayType !== 'SELF_EMPLOYMENT'),
      enterprise: recommendations.filter((item) => item.details?.pathwayType === 'SELF_EMPLOYMENT'),
    },
    roadmap: { steps: roadmapSteps, recommendations },
    outcomeTracking: { status: 'NOT_STARTED', outcomes: [] },
    communityIntelligence: {
      district: profile.location?.district || null,
      state: profile.location?.state || null,
      skillHeatmap: { status: 'AVAILABLE_VIA_DASHBOARD' },
      perspectivePlan: { status: 'AVAILABLE_VIA_DASHBOARD' },
      policySimulator: { status: 'AVAILABLE_VIA_SCHEME_DATA' },
    },
    source,
    status: 'READY',
    reviewStatus: 'PENDING',
    reviewFeedback: '',
    reviewedBy: null,
    reviewedAt: null,
  };
};

const persistWorkflowSnapshot = async ({ profile, assessment, sessionId, source = 'FORM' }) => {
  const snapshot = buildWorkflowSnapshot({ profile, assessment, source });
  const filter = profile._id ? { beneficiaryId: profile._id } : { sessionId };
  const existing = await LivelihoodDigitalTwin.findOne(filter).lean();
  const sameProfileVersion = existing?.profileSnapshot?.updatedAt
    && String(existing.profileSnapshot.updatedAt) === String(profile.updatedAt);
  const identity = {
    ...(profile._id ? { beneficiaryId: profile._id } : {}),
    ...(sessionId ? { sessionId } : {}),
  };
  return LivelihoodDigitalTwin.findOneAndUpdate(
    filter,
    {
      $set: {
        ...snapshot,
        ...identity,
        ...(sameProfileVersion ? {
          reviewStatus: existing.reviewStatus,
          reviewFeedback: existing.reviewFeedback,
          reviewedBy: existing.reviewedBy,
          reviewedAt: existing.reviewedAt,
        } : {}),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const createOrUpdateTwin = async ({ profile, sessionId, source = 'FORM' }) => {
  const assessment = await assessLivelihood(profile);
  return persistWorkflowSnapshot({ profile, assessment, sessionId, source });
};

const createVoiceTwin = async ({ sessionId, extractedProfileData, beneficiaryProfileId }) => {
  const beneficiaryId = extractedProfileData?.beneficiary_id;
  let storedProfile = beneficiaryProfileId
    ? await BeneficiaryProfile.findById(beneficiaryProfileId)
    : beneficiaryId ? await BeneficiaryProfile.findById(beneficiaryId) : null;
  const voiceProfile = canonicalVoiceProfileToPersistenceShape(extractedProfileData);
  let profile = voiceProfile;
  if (storedProfile) {
    for (const [section, values] of Object.entries(voiceProfile)) {
      if (values && typeof values === 'object' && !Array.isArray(values)) {
        for (const [key, value] of Object.entries(values)) {
          if (value !== undefined && value !== null && value !== '') storedProfile.set(`${section}.${key}`, value);
        }
      } else if (Array.isArray(values) ? values.length > 0 : values !== undefined && values !== null && values !== '') {
        storedProfile.set(section, values);
      }
    }
    storedProfile.source = storedProfile.source === 'FORM' || storedProfile.source === 'OFFICER' ? 'MIXED' : 'VOICE';
    await storedProfile.save();
    profile = storedProfile;
  }
  return createOrUpdateTwin({ profile, sessionId, source: 'VOICE' });
};

module.exports = {
  buildWorkflowSnapshot,
  canonicalVoiceProfileToPersistenceShape,
  normalizeVoiceEducation,
  normalizeVoicePreference,
  persistWorkflowSnapshot,
  createOrUpdateTwin,
  createVoiceTwin,
};