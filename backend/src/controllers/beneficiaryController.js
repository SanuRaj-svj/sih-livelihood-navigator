const BeneficiaryProfile = require('../models/BeneficiaryProfile');

const PROFILE_FIELD_LABELS = {
  'personal.age': 'Age',
  'personal.gender': 'Gender',
  'education.level': 'Education level',
  'education.field': 'Education field',
  'location.state': 'State',
  'location.district': 'District',
  'location.block': 'Block',
  'location.village': 'Village',
  'livelihood.currentOccupation': 'Current occupation',
  'livelihood.familyOccupation': 'Family occupation',
  'livelihood.currentIncomeRange': 'Income range',
  skills: 'Skills',
  traditionalSkills: 'Traditional skills',
  interests: 'Work interests',
  aspirations: 'Livelihood goals',
  employmentPreference: 'Employment preference',
};

const missingProfileFields = (profile = {}) => {
  const checks = {
    'personal.age': Boolean(profile.personal?.age),
    'personal.gender': Boolean(profile.personal?.gender),
    'education.level': Boolean(profile.education?.level),
    'location.state': Boolean(profile.location?.state),
    'location.district': Boolean(profile.location?.district),
    'livelihood.currentOccupation': Boolean(profile.livelihood?.currentOccupation),
    skills: Boolean(profile.skills?.length || profile.traditionalSkills?.length),
    interests: Boolean(profile.interests?.length),
    aspirations: Boolean(profile.aspirations?.length),
    employmentPreference: Boolean(profile.employmentPreference),
  };
  return Object.entries(checks).filter(([, present]) => !present).map(([field]) => ({ field, label: PROFILE_FIELD_LABELS[field] }));
};

const hasProfileValue = (value) => Array.isArray(value)
  ? value.some((item) => String(item || '').trim())
  : value !== undefined && value !== null && String(value).trim() !== '';

// Helper to compute dynamic profile completion percentage
const calculateProfileCompletion = (profileData) => {
  const fields = [
    profileData.personal?.age !== undefined && profileData.personal?.age !== null && profileData.personal?.age !== '',
    Boolean(profileData.personal?.gender),
    Boolean(profileData.education?.level),
    Boolean(profileData.location?.state),
    Boolean(profileData.location?.district),
    Boolean(profileData.livelihood?.currentOccupation),
    Boolean(profileData.skills?.length || profileData.traditionalSkills?.length),
    Boolean(profileData.interests?.length),
    Boolean(profileData.aspirations?.length),
    Boolean(profileData.employmentPreference),
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const getProfileDocumentGateError = (verification = {}) => {
  if (verification.scCertificateStatus === 'PENDING_REVIEW') return 'Your SC certificate is awaiting officer verification.';
  if (verification.scCertificateStatus === 'REJECTED') return 'Your SC certificate was rejected. Upload a valid certificate before completing your profile.';
  if (verification.scCertificateStatus !== 'VERIFIED') return 'Upload your SC certificate and wait for officer verification before completing your profile.';
  if (verification.scCertificateIdentityMatch !== true) return 'An officer must confirm your certificate identity matches your account before completing your profile.';
  return null;
};

// @desc    Create or update current user's profile
// @route   POST /api/beneficiaries/profile
// @access  Private (Beneficiary/Officer/Admin)
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const currentProfile = await BeneficiaryProfile.findOne({ userId }).select('verification');
    const documentGateError = req.user.role === 'BENEFICIARY'
      ? getProfileDocumentGateError(currentProfile?.verification)
      : null;
    if (documentGateError) {
      return res.status(403).json({
        success: false,
        code: 'SOURCE_DOCUMENT_REVIEW_REQUIRED',
        message: documentGateError,
      });
    }

    let profile = await BeneficiaryProfile.findOne({ userId });

    if (profile) {
      const pendingRequest = profile.correctionRequests.find((request) => request.status === 'PENDING');
      if (req.user.role === 'BENEFICIARY' && pendingRequest) {
        const updates = {};
        for (const field of pendingRequest.fields) {
          const value = field.split('.').reduce((current, key) => current?.[key], req.body);
          if (!hasProfileValue(value)) {
            return res.status(400).json({ success: false, message: `Provide the requested correction: ${PROFILE_FIELD_LABELS[field] || field}` });
          }
          updates[field] = value;
        }
        for (const [field, value] of Object.entries(updates)) profile.set(field, value);
        profile.profileCompletion = calculateProfileCompletion(profile.toObject());
        pendingRequest.status = 'COMPLETED';
        pendingRequest.completedAt = new Date();
        await profile.save();
        return res.status(200).json({ success: true, data: profile, appliedCorrectionFields: Object.keys(updates) });
      }

      const profileFields = { ...req.body, userId };
      profileFields.profileCompletion = calculateProfileCompletion(profileFields);
      profile = await BeneficiaryProfile.findOneAndUpdate(
        { userId },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        data: profile,
      });
    }

    const profileFields = { ...req.body, userId };
    profileFields.profileCompletion = calculateProfileCompletion(profileFields);
    profile = await BeneficiaryProfile.create(profileFields);

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's profile
// @route   GET /api/beneficiaries/profile/me
// @access  Private
const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).populate([
      { path: 'userId', select: 'name email phone role district state' },
      { path: 'correctionRequests.requestedBy', select: 'name role' },
    ]);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { ...profile.toObject(), missingFields: missingProfileFields(profile) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get beneficiary profile by ID
// @route   GET /api/beneficiaries/profile/:id
// @access  Private (Officer/Admin only)
const getProfileById = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findById(req.params.id).populate([
      { path: 'userId', select: 'name email phone role district state' },
      { path: 'correctionRequests.requestedBy', select: 'name role' },
    ]);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { ...profile.toObject(), missingFields: missingProfileFields(profile) },
    });
  } catch (error) {
    next(error);
  }
};

const getIncompleteProfiles = async (req, res, next) => {
  try {
    const profiles = await BeneficiaryProfile.find({
      profileCompletion: { $lt: 100 },
      'verification.scCertificateStatus': 'VERIFIED',
      'verification.scCertificateIdentityMatch': true,
    })
      .populate('userId', 'name email phone')
      .sort({ profileCompletion: 1, updatedAt: -1 })
      .limit(100);
    return res.status(200).json({
      success: true,
      data: profiles.map((profile) => ({ ...profile.toObject(), missingFields: missingProfileFields(profile) })),
    });
  } catch (error) {
    return next(error);
  }
};

const requestProfileCorrection = async (req, res, next) => {
  try {
    const { fields, reason } = req.body;
    if (!Array.isArray(fields) || !fields.length) return res.status(400).json({ success: false, message: 'Select at least one profile field to correct' });
    if (!String(reason || '').trim()) return res.status(400).json({ success: false, message: 'A correction reason is required' });
    const validFields = fields.filter((field) => Object.hasOwn(PROFILE_FIELD_LABELS, field));
    if (validFields.length !== new Set(fields).size) return res.status(400).json({ success: false, message: 'One or more requested fields are invalid' });
    const profile = await BeneficiaryProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Beneficiary profile not found' });
    const pending = profile.correctionRequests.find((request) => request.status === 'PENDING');
    if (pending) return res.status(409).json({ success: false, message: 'This beneficiary already has a pending correction request' });
    profile.correctionRequests.push({ fields: [...new Set(fields)], reason: String(reason).trim(), requestedBy: req.user._id });
    await profile.save();
    return res.status(201).json({ success: true, data: profile.correctionRequests.at(-1) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrUpdateProfile,
  getOwnProfile,
  getProfileById,
  getIncompleteProfiles,
  requestProfileCorrection,
  calculateProfileCompletion,
  getProfileDocumentGateError,
  missingProfileFields,
};
