const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const Opportunity = require('../models/Opportunity');
const OpportunityApplication = require('../models/OpportunityApplication');
const Outcome = require('../models/Outcome');

const opportunityOutcomeType = (type) => (type === 'SELF_EMPLOYMENT' ? 'SELF_EMPLOYED' : 'WAGE_EMPLOYED');

const applyToOpportunity = async (req, res, next) => {
  try {
    const [profile, opportunity] = await Promise.all([
      BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id'),
      Opportunity.findById(req.params.opportunityId),
    ]);
    if (!profile) return res.status(404).json({ success: false, message: 'Complete your beneficiary profile before applying' });
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    const note = String(req.body.note || '').trim();
    if (note.length > 1000) return res.status(400).json({ success: false, message: 'Application note must be 1000 characters or fewer' });
    const existing = await OpportunityApplication.findOne({ beneficiaryId: profile._id, opportunityId: opportunity._id }).populate('opportunityId');
    if (existing) return res.status(200).json({ success: true, data: existing, alreadyApplied: true });
    const application = await OpportunityApplication.findOneAndUpdate(
      { beneficiaryId: profile._id, opportunityId: opportunity._id },
      {
        $setOnInsert: {
          beneficiaryId: profile._id,
          opportunityId: opportunity._id,
          status: 'INTERESTED',
          note,
          history: [{ status: 'INTERESTED', note, updatedBy: req.user._id, updatedAt: new Date() }],
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).populate('opportunityId');
    return res.status(201).json({ success: true, data: application, alreadyApplied: false });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'You already applied to this opportunity' });
    return next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
    if (!profile) return res.status(404).json({ success: false, message: 'Beneficiary profile not found' });
    const applications = await OpportunityApplication.find({ beneficiaryId: profile._id })
      .populate('opportunityId')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    return next(error);
  }
};

const getApplicationQueue = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const applications = await OpportunityApplication.find(filter)
      .populate({ path: 'beneficiaryId', populate: { path: 'userId', select: 'name email phone' } })
      .populate('opportunityId')
      .populate('history.updatedBy', 'name role')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    return next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    const allowedStatuses = ['APPLIED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN', 'HIRED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowedStatuses.join(', ')}` });
    }
    const cleanNote = String(note).trim();
    if (cleanNote.length > 1000) return res.status(400).json({ success: false, message: 'Status note must be 1000 characters or fewer' });

    const application = await OpportunityApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (req.user.role === 'BENEFICIARY') {
      const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
      if (!profile || String(profile._id) !== String(application.beneficiaryId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
      }
      if (status !== 'WITHDRAWN') return res.status(403).json({ success: false, message: 'Beneficiaries may only withdraw an application' });
      if (['REJECTED', 'WITHDRAWN', 'HIRED'].includes(application.status)) {
        return res.status(409).json({ success: false, message: 'This application is already closed' });
      }
    }

    application.status = status;
    application.history.push({ status, note: cleanNote, updatedBy: req.user._id, updatedAt: new Date() });
    await application.save();
    if (status === 'HIRED') {
      const opportunity = await Opportunity.findById(application.opportunityId).select('title type');
      await Outcome.findOneAndUpdate(
        { opportunityApplicationId: application._id },
        { $setOnInsert: {
          beneficiaryId: application.beneficiaryId,
          opportunityApplicationId: application._id,
          outcomeType: opportunityOutcomeType(opportunity?.type),
          employerOrBusinessName: opportunity?.title || 'Opportunity placement',
          monthlyIncome: Number.isFinite(Number(req.body.monthlyIncome)) ? Number(req.body.monthlyIncome) : 0,
          dateAchieved: new Date(),
          verifiedBy: req.user._id,
        } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }
    await application.populate(['opportunityId', { path: 'beneficiaryId', populate: { path: 'userId', select: 'name email phone' } }]);
    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    return next(error);
  }
};

module.exports = { applyToOpportunity, getMyApplications, getApplicationQueue, updateApplicationStatus, opportunityOutcomeType };