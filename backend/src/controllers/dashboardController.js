const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingProgress = require('../models/TrainingProgress');
const Outcome = require('../models/Outcome');
const Intervention = require('../models/Intervention');

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

module.exports = {
  getDashboardSummary,
  getSkillDemand,
  getAtRisk,
};
