const Intervention = require('../models/Intervention');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');

// @desc    Flag an intervention for a beneficiary
// @route   POST /api/interventions
// @access  Private (OFFICER, ADMIN)
const createIntervention = async (req, res, next) => {
  try {
    const { beneficiaryId, reason, riskLevel, actionTaken } = req.body;

    if (!beneficiaryId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'beneficiaryId and reason are required',
      });
    }

    const beneficiary = await BeneficiaryProfile.findById(beneficiaryId);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found',
      });
    }

    const intervention = await Intervention.create({
      beneficiaryId,
      raisedBy: req.user._id,
      reason,
      riskLevel: riskLevel || 'LOW',
      actionTaken: actionTaken || '',
      status: 'OPEN',
    });

    res.status(201).json({
      success: true,
      data: intervention,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interventions filterable by status, riskLevel, district
// @route   GET /api/interventions
// @access  Private (OFFICER, ADMIN)
const getInterventions = async (req, res, next) => {
  try {
    const { status, riskLevel, district } = req.query;
    const query = {};

    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    if (district) {
      const matchingProfiles = await BeneficiaryProfile.find({
        'location.district': new RegExp(district, 'i'),
      }).select('_id');
      const profileIds = matchingProfiles.map((p) => p._id);
      query.beneficiaryId = { $in: profileIds };
    }

    const interventions = await Intervention.find(query)
      .populate({
        path: 'beneficiaryId',
        populate: { path: 'userId', select: 'name email phone district state' },
      })
      .populate('raisedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: interventions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update intervention status or actionTaken
// @route   PATCH /api/interventions/:id
// @access  Private (OFFICER, ADMIN)
const updateIntervention = async (req, res, next) => {
  try {
    const { status, actionTaken, riskLevel } = req.body;
    const interventionId = req.params.id;

    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({
        success: false,
        message: 'Intervention not found',
      });
    }

    if (status) intervention.status = status;
    if (actionTaken !== undefined) intervention.actionTaken = actionTaken;
    if (riskLevel) intervention.riskLevel = riskLevel;

    await intervention.save();

    res.status(200).json({
      success: true,
      data: intervention,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIntervention,
  getInterventions,
  updateIntervention,
};
