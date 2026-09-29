const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const LivelihoodDigitalTwin = require('../models/LivelihoodDigitalTwin');
const { createOrUpdateTwin } = require('../services/livelihoodWorkflowService');

const assessCurrentLivelihood = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Beneficiary profile not found.' });
    const twin = await createOrUpdateTwin({ profile, source: profile.source || 'FORM' });
    return res.status(200).json({ success: true, data: twin });
  } catch (error) {
    return next(error);
  }
};

const getReviewQueue = async (req, res, next) => {
  try {
    const twins = await LivelihoodDigitalTwin.find({ reviewStatus: 'PENDING' })
      .populate({ path: 'beneficiaryId', populate: { path: 'userId', select: 'name email district state' } })
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: twins });
  } catch (error) {
    return next(error);
  }
};

const reviewTwin = async (req, res, next) => {
  try {
    const { decision, feedback = '' } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be APPROVED or REJECTED' });
    }
    if (decision === 'REJECTED' && !String(feedback).trim()) {
      return res.status(400).json({ success: false, message: 'Feedback is required when rejecting a pathway' });
    }

    const twin = await LivelihoodDigitalTwin.findOneAndUpdate(
      { _id: req.params.id, reviewStatus: 'PENDING' },
      {
        $set: {
          reviewStatus: decision,
          reviewFeedback: String(feedback).trim(),
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );
    if (!twin) return res.status(404).json({ success: false, message: 'Pending livelihood pathway not found' });
    return res.status(200).json({ success: true, data: twin });
  } catch (error) {
    return next(error);
  }
};

const getCurrentTwin = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
    if (!profile) return res.status(404).json({ success: false, message: 'Beneficiary profile not found.' });
    const twin = await LivelihoodDigitalTwin.findOne({ beneficiaryId: profile._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: twin });
  } catch (error) {
    return next(error);
  }
};

module.exports = { assessCurrentLivelihood, getCurrentTwin, getReviewQueue, reviewTwin };