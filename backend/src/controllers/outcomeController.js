const Outcome = require('../models/Outcome');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const TrainingEnrollment = require('../models/TrainingEnrollment');

// @desc    Record an outcome for a beneficiary
// @route   POST /api/outcomes
// @access  Private (OFFICER, ADMIN)
const createOutcome = async (req, res, next) => {
  try {
    const {
      beneficiaryId,
      enrollmentId,
      outcomeType,
      employerOrBusinessName,
      monthlyIncome,
      dateAchieved,
    } = req.body;

    if (!beneficiaryId || !outcomeType) {
      return res.status(400).json({
        success: false,
        message: 'beneficiaryId and outcomeType are required',
      });
    }

    const beneficiary = await BeneficiaryProfile.findById(beneficiaryId);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found',
      });
    }

    if (enrollmentId) {
      const enrollment = await TrainingEnrollment.findById(enrollmentId);
      if (enrollment) {
        // If outcome achieved, mark enrollment COMPLETED
        enrollment.status = 'COMPLETED';
        await enrollment.save();
      }
    }

    const outcome = await Outcome.create({
      beneficiaryId,
      enrollmentId: enrollmentId || null,
      outcomeType,
      employerOrBusinessName: employerOrBusinessName || '',
      monthlyIncome: monthlyIncome || 0,
      dateAchieved: dateAchieved || new Date(),
      verifiedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: outcome,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outcomes with optional filters (outcomeType, beneficiaryId, district)
// @route   GET /api/outcomes
// @access  Private (OFFICER, ADMIN)
const getOutcomes = async (req, res, next) => {
  try {
    const { outcomeType, beneficiaryId, district } = req.query;
    const query = {};

    if (outcomeType) query.outcomeType = outcomeType;
    if (beneficiaryId) query.beneficiaryId = beneficiaryId;

    if (district) {
      const matchingProfiles = await BeneficiaryProfile.find({
        'location.district': new RegExp(district, 'i'),
      }).select('_id');
      const profileIds = matchingProfiles.map((p) => p._id);
      query.beneficiaryId = { $in: profileIds };
    }

    const outcomes = await Outcome.find(query)
      .populate({
        path: 'beneficiaryId',
        populate: { path: 'userId', select: 'name email phone district state' },
      })
      .populate('enrollmentId')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: outcomes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOutcome,
  getOutcomes,
};
