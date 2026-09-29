const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingProgress = require('../models/TrainingProgress');
const Outcome = require('../models/Outcome');
const Intervention = require('../models/Intervention');
const TrainingCenter = require('../models/TrainingCenter');
const NSQFCourse = require('../models/NSQFCourse');

// @desc    Summary counts for officer dashboard, scoped optionally by district
// @route   GET /api/admin/dashboard/summary
// @access  Private (OFFICER, ADMIN)
const getDashboardSummary = async (req, res, next) => {
  try {
    const { district } = req.query;

    let beneficiaryQuery = {};
    let scopedProfileIds = null;

    if (district) {
      beneficiaryQuery = { 'location.district': new RegExp(district, 'i') };
      const matchingProfiles = await BeneficiaryProfile.find(beneficiaryQuery).select('_id');
      scopedProfileIds = matchingProfiles.map((p) => p._id);
    }

    // Total Beneficiaries
    const totalBeneficiaries = await BeneficiaryProfile.countDocuments(beneficiaryQuery);

    // Filter enrollments, outcomes, interventions by scopedProfileIds if district given
    const enrollmentQuery = scopedProfileIds ? { beneficiaryId: { $in: scopedProfileIds } } : {};
    const outcomeQuery = scopedProfileIds ? { beneficiaryId: { $in: scopedProfileIds } } : {};
    const interventionQuery = scopedProfileIds ? { beneficiaryId: { $in: scopedProfileIds } } : {};

    // Active enrollments (ENROLLED or IN_PROGRESS)
    const activeEnrollments = await TrainingEnrollment.countDocuments({
      ...enrollmentQuery,
      status: { $in: ['ENROLLED', 'IN_PROGRESS'] },
    });

    // Completed trainings
    const completedTrainings = await TrainingEnrollment.countDocuments({
      ...enrollmentQuery,
      status: 'COMPLETED',
    });

    // Outcomes grouped by type
    const outcomeAgg = await Outcome.aggregate([
      { $match: outcomeQuery },
      { $group: { _id: '$outcomeType', count: { $sum: 1 } } },
    ]);

    const outcomesByType = {
      WAGE_EMPLOYED: 0,
      SELF_EMPLOYED: 0,
      UNEMPLOYED: 0,
      FURTHER_TRAINING: 0,
    };
    outcomeAgg.forEach((item) => {
      outcomesByType[item._id] = item.count;
    });

    // Open / In Progress Interventions
    const openInterventions = await Intervention.countDocuments({
      ...interventionQuery,
      status: { $in: ['OPEN', 'IN_PROGRESS'] },
    });

    res.status(200).json({
      success: true,
      data: {
        totalBeneficiaries,
        activeEnrollments,
        completedTrainings,
        outcomesByType,
        openInterventions,
        districtFilter: district || 'ALL',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enrollment count grouped by course sector for bar-chart
// @route   GET /api/admin/dashboard/skill-demand
// @access  Private (OFFICER, ADMIN)
const getSkillDemand = async (req, res, next) => {
  try {
    const demandAggregation = await TrainingEnrollment.aggregate([
      {
        $lookup: {
          from: 'nsqfcourses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.sector',
          enrollmentCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          sector: '$_id',
          enrollmentCount: 1,
        },
      },
      { $sort: { enrollmentCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: demandAggregation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List beneficiaries with open HIGH risk interventions or attendance < 50%
// @route   GET /api/admin/dashboard/at-risk
// @access  Private (OFFICER, ADMIN)
const getAtRisk = async (req, res, next) => {
  try {
    // 1. Open HIGH risk interventions
    const highRiskInterventions = await Intervention.find({
      status: { $in: ['OPEN', 'IN_PROGRESS'] },
      riskLevel: 'HIGH',
    })
      .populate({
        path: 'beneficiaryId',
        populate: { path: 'userId', select: 'name email phone district state' },
      })
      .populate('raisedBy', 'name email role');

    // 2. Training progress with attendance < 50%
    const lowAttendanceProgress = await TrainingProgress.find({
      attendancePercentage: { $lt: 50 },
    })
      .populate({
        path: 'enrollmentId',
        populate: [
          {
            path: 'beneficiaryId',
            populate: { path: 'userId', select: 'name email phone district state' },
          },
          { path: 'courseId' },
          { path: 'centerId' },
        ],
      })
      .sort({ attendancePercentage: 1 });

    res.status(200).json({
      success: true,
      data: {
        highRiskInterventions,
        lowAttendanceEnrollments: lowAttendanceProgress,
        totalAtRiskCount: highRiskInterventions.length + lowAttendanceProgress.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCommunityIntelligence = async (req, res, next) => {
  try {
    const [sectorActivity, centerCapacity, districtDistribution, outcomeCount] = await Promise.all([
      TrainingEnrollment.aggregate([
        { $lookup: { from: 'nsqfcourses', localField: 'courseId', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        {
          $group: {
            _id: '$course.sector',
            enrollments: { $sum: 1 },
            active: { $sum: { $cond: [{ $in: ['$status', ['ENROLLED', 'IN_PROGRESS']] }, 1, 0] } },
            completions: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
            dropouts: { $sum: { $cond: [{ $eq: ['$status', 'DROPPED_OUT'] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, sector: { $ifNull: ['$_id', 'Unspecified'] }, enrollments: 1, active: 1, completions: 1, dropouts: 1 } },
        { $sort: { enrollments: -1 } },
      ]),
      TrainingCenter.aggregate([
        { $unwind: '$coursesOffered' },
        { $lookup: { from: 'nsqfcourses', localField: 'coursesOffered', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        {
          $group: {
            _id: '$course.sector',
            centers: { $addToSet: '$_id' },
            seatCapacity: { $sum: '$capacity' },
          },
        },
        { $project: { _id: 0, sector: { $ifNull: ['$_id', 'Unspecified'] }, centerCount: { $size: '$centers' }, seatCapacity: 1 } },
      ]),
      BeneficiaryProfile.aggregate([
        { $group: { _id: { $ifNull: ['$location.district', 'Unspecified'] }, beneficiaries: { $sum: 1 } } },
        { $project: { _id: 0, district: '$_id', beneficiaries: 1 } },
        { $sort: { beneficiaries: -1 } },
      ]),
      Outcome.countDocuments(),
    ]);

    const capacityBySector = new Map(centerCapacity.map((item) => [item.sector, item]));
    const perspectivePlan = sectorActivity.map((activity) => {
      const capacity = capacityBySector.get(activity.sector) || { centerCount: 0, seatCapacity: 0 };
      return {
        ...activity,
        centerCount: capacity.centerCount,
        seatCapacity: capacity.seatCapacity,
        capacityGap: Math.max(activity.enrollments - capacity.seatCapacity, 0),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        dataSources: ['training enrollments', 'NSQF course catalog', 'training centers', 'verified officer outcomes', 'beneficiary locations'],
        skillHeatmap: { bySector: perspectivePlan, byDistrict: districtDistribution },
        perspectivePlan,
        outcomeRecords: outcomeCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const simulatePolicy = async (req, res, next) => {
  try {
    const supportSeats = Number(req.body.supportSeats);
    if (!Number.isFinite(supportSeats) || supportSeats < 0 || supportSeats > 100000) {
      return res.status(400).json({ success: false, message: 'supportSeats must be between 0 and 100000' });
    }
    const activity = await TrainingEnrollment.aggregate([
      { $group: {
        _id: null,
        total: { $sum: 1 },
        completions: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        dropouts: { $sum: { $cond: [{ $eq: ['$status', 'DROPPED_OUT'] }, 1, 0] } },
      } },
    ]);
    const observed = activity[0] || { total: 0, completions: 0, dropouts: 0 };
    const observedCompletionRate = observed.total ? observed.completions / observed.total : 0;
    const observedDropoutRate = observed.total ? observed.dropouts / observed.total : 0;
    const projectedCompletions = Math.round(supportSeats * observedCompletionRate);
    const projectedDropouts = Math.round(supportSeats * observedDropoutRate);
    return res.status(200).json({
      success: true,
      data: {
        scenario: { supportSeats },
        baseline: { enrollments: observed.total, completionRate: observedCompletionRate, dropoutRate: observedDropoutRate },
        projection: { additionalEnrollments: supportSeats, estimatedCompletions: projectedCompletions, estimatedDropouts: projectedDropouts },
        note: observed.total ? 'Projection uses historical enrollment outcomes; it is an estimate, not a guarantee.' : 'No historical enrollment data is available; projections are zero until outcomes are recorded.',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getSkillDemand,
  getAtRisk,
  getCommunityIntelligence,
  simulatePolicy,
};
