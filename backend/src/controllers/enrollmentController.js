const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingCertificate = require('../models/TrainingCertificate');
const TrainingProgress = require('../models/TrainingProgress');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const NSQFCourse = require('../models/NSQFCourse');
const TrainingCenter = require('../models/TrainingCenter');
const Outcome = require('../models/Outcome');
const Intervention = require('../models/Intervention');
const { nextCheckInAt } = require('../services/trainingCheckInReminderService');

const getCenterEligibilityError = ({ center, courseId, activeEnrollmentCount }) => {
  const offeredCourseIds = (center.coursesOffered || []).map((id) => String(id._id || id));
  if (offeredCourseIds.length && !offeredCourseIds.includes(String(courseId))) return 'Training Center does not offer this course';
  if (center.capacity > 0 && activeEnrollmentCount >= center.capacity) return 'Training Center has reached its enrollment capacity';
  return null;
};

const getDocumentGateError = (verificationStatus = 'NOT_SUBMITTED', identityMatchConfirmed = false) => {
  if (verificationStatus === 'NOT_SUBMITTED') return 'Upload your SC certificate and wait for officer verification before enrolling';
  if (verificationStatus === 'PENDING_REVIEW') return 'Source certificate is awaiting officer verification';
  if (verificationStatus === 'REJECTED') return 'Source certificate was rejected; upload a valid document before enrolling';
  if (verificationStatus === 'VERIFIED' && identityMatchConfirmed !== true) return 'Certificate identity must match the beneficiary profile before enrolling';
  return null;
};

const validateCheckIn = ({ attendancePercentage, currentModule, notes }) => {
  if (!Number.isFinite(attendancePercentage) || attendancePercentage < 0 || attendancePercentage > 100) {
    return 'Attendance must be a number between 0 and 100';
  }
  if (String(currentModule || '').length > 160) return 'Module name must be 160 characters or fewer';
  if (String(notes || '').length > 1000) return 'Check-in notes must be 1000 characters or fewer';
  return null;
};

const recordProgressRisk = async ({ enrollment, progress, raisedBy }) => {
  if (progress.attendancePercentage >= 50 || !enrollment.beneficiaryId) return null;

  const sourceKey = `attendance:${enrollment._id}`;
  return Intervention.findOneAndUpdate(
    { sourceKey },
    {
      $setOnInsert: {
        beneficiaryId: enrollment.beneficiaryId,
        enrollmentId: enrollment._id,
        raisedBy,
        source: 'SYSTEM',
        sourceKey,
        reason: `Attendance dropped to ${progress.attendancePercentage}%; officer follow-up is recommended.`,
        riskLevel: progress.attendancePercentage < 25 ? 'HIGH' : 'MEDIUM',
        status: 'OPEN',
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );
};

// @desc    Beneficiary self-enrollment in a course and center
// @route   POST /api/enrollments
// @access  Private (BENEFICIARY, OFFICER, ADMIN)
const enrollSelf = async (req, res, next) => {
  try {
    const { courseId, centerId } = req.body;

    if (!courseId || !centerId) {
      return res.status(400).json({
        success: false,
        message: 'courseId and centerId are required',
      });
    }

    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found. Please create a profile before enrolling.',
      });
    }

    const documentGateError = getDocumentGateError(
      profile.verification?.scCertificateStatus,
      profile.verification?.scCertificateIdentityMatch,
    );
    if (documentGateError) return res.status(403).json({ success: false, message: documentGateError, code: 'SOURCE_DOCUMENT_REVIEW_REQUIRED' });

    const course = await NSQFCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'NSQF Course not found' });
    }

    const center = await TrainingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ success: false, message: 'Training Center not found' });
    }

    const activeAtCenter = await TrainingEnrollment.countDocuments({
      centerId,
      status: { $in: ['ENROLLED', 'IN_PROGRESS'] },
    });
    const centerEligibilityError = getCenterEligibilityError({ center, courseId, activeEnrollmentCount: activeAtCenter });
    if (centerEligibilityError) return res.status(409).json({ success: false, message: centerEligibilityError });

    // Check if already enrolled in this course
    const existing = await TrainingEnrollment.findOne({
      beneficiaryId: profile._id,
      courseId,
      status: { $in: ['ENROLLED', 'IN_PROGRESS'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already actively enrolled in this course',
      });
    }

    let enrollment;
    try {
      enrollment = await TrainingEnrollment.create({
        beneficiaryId: profile._id,
        courseId,
        centerId,
        status: 'ENROLLED',
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Already actively enrolled in this course',
        });
      }
      throw error;
    }

    // Create initial TrainingProgress document
    const progress = await TrainingProgress.create({
      enrollmentId: enrollment._id,
      attendancePercentage: 0,
      milestonesCompleted: [],
      currentModule: 'Orientation',
      notes: 'Enrollment initialized',
    });

    res.status(201).json({
      success: true,
      data: {
        enrollment,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user's enrollments and progress
// @route   GET /api/enrollments/me
// @access  Private
const getOwnEnrollments = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary profile not found',
      });
    }

    const enrollments = await TrainingEnrollment.find({ beneficiaryId: profile._id })
      .populate('courseId')
      .populate('centerId')
      .sort({ createdAt: -1 });

    const enrollmentIds = enrollments.map((e) => e._id);
    const progressList = await TrainingProgress.find({ enrollmentId: { $in: enrollmentIds } });
    const outcomeList = await Outcome.find({ beneficiaryId: profile._id });
    const certificates = await TrainingCertificate.find({ enrollmentId: { $in: enrollmentIds } }).select('enrollmentId stage certificateId issuedAt beneficiaryNotifiedAt notificationStatus');

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.enrollmentId.toString()] = p;
    });

    const outcomeMap = {};
    outcomeList.forEach((o) => {
      if (o.enrollmentId) {
        outcomeMap[o.enrollmentId.toString()] = o;
      }
    });

    const certificatesByEnrollment = {};
    certificates.forEach((certificate) => {
      const key = certificate.enrollmentId.toString();
      certificatesByEnrollment[key] ||= {};
      certificatesByEnrollment[key][certificate.stage] = certificate;
    });

    const data = enrollments.map((e) => {
      const key = e._id.toString();
      const enrollmentCertificate = certificatesByEnrollment[key]?.ENROLLMENT || null;
      const completionCertificate = certificatesByEnrollment[key]?.COMPLETION || null;
      return {
        ...e.toObject(),
        progress: progressMap[key] || null,
        outcome: outcomeMap[key] || null,
        certificateTimeline: {
          enrollmentApproval: enrollmentCertificate ? 'APPROVED' : 'AWAITING_OFFICER_APPROVAL',
          enrollmentCertificateId: enrollmentCertificate?.certificateId || null,
          enrollmentIssuedAt: enrollmentCertificate?.issuedAt || null,
          training: e.status === 'COMPLETED' ? 'COMPLETED' : e.status,
          trainingCompletedAt: e.completedAt || null,
          completionReview: completionCertificate ? 'APPROVED' : e.status === 'COMPLETED' ? 'AWAITING_OFFICER_REVIEW' : 'NOT_READY',
          completionCertificateId: completionCertificate?.certificateId || null,
          completionIssuedAt: completionCertificate?.issuedAt || null,
          beneficiaryNotifiedAt: completionCertificate?.beneficiaryNotifiedAt || null,
          notificationStatus: completionCertificate?.notificationStatus || 'NOT_SENT',
        },
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress for own enrollment (creates/updates TrainingProgress document)
// @route   PATCH /api/enrollments/:id/progress
// @access  Private (BENEFICIARY, OFFICER, ADMIN)
const updateOwnProgress = async (req, res, next) => {
  try {
    const enrollmentId = req.params.id;
    const { attendancePercentage, milestonesCompleted, currentModule, notes } = req.body;

    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });

    const enrollment = await TrainingEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Training enrollment not found',
      });
    }

    // Verify ownership if role is BENEFICIARY
    if (req.user.role === 'BENEFICIARY') {
      if (!profile || enrollment.beneficiaryId.toString() !== profile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this enrollment progress',
        });
      }
      if (!enrollment.enrollmentCertificateVerifiedAt) {
        return res.status(403).json({
          success: false,
          message: 'Enter and verify your enrollment certificate ID before resuming the course',
          code: 'ENROLLMENT_CERTIFICATE_REQUIRED',
        });
      }
    }

    const updateFields = { lastUpdated: new Date() };
    if (typeof attendancePercentage === 'number') updateFields.attendancePercentage = attendancePercentage;
    if (Array.isArray(milestonesCompleted)) updateFields.milestonesCompleted = milestonesCompleted;
    if (currentModule !== undefined) updateFields.currentModule = currentModule;
    if (notes !== undefined) updateFields.notes = notes;

    // Upsert TrainingProgress document explicitly
    let progress = await TrainingProgress.findOneAndUpdate(
      { enrollmentId },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    // If attendance > 0 and status is ENROLLED, move enrollment status to IN_PROGRESS
    if (progress.attendancePercentage > 0 && enrollment.status === 'ENROLLED') {
      enrollment.status = 'IN_PROGRESS';
      await enrollment.save();
    }
    if (typeof attendancePercentage === 'number') {
      await recordProgressRisk({ enrollment, progress, raisedBy: req.user.role === 'BENEFICIARY' ? undefined : req.user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createTrainingCheckIn = async (req, res, next) => {
  try {
    const { attendancePercentage, currentModule = '', notes = '' } = req.body;
    const validationError = validateCheckIn({ attendancePercentage, currentModule, notes });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const [profile, enrollment] = await Promise.all([
      BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id'),
      TrainingEnrollment.findById(req.params.id),
    ]);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Training enrollment not found' });
    if (!profile || String(enrollment.beneficiaryId) !== String(profile._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to check in to this enrollment' });
    }
    if (!['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status)) {
      return res.status(409).json({ success: false, message: 'Check-ins are only available for active training' });
    }
    if (!enrollment.enrollmentCertificateVerifiedAt) {
      return res.status(403).json({ success: false, code: 'ENROLLMENT_CERTIFICATE_REQUIRED', message: 'Verify your enrollment certificate before submitting a training check-in' });
    }

    const progress = await TrainingProgress.findOneAndUpdate(
      { enrollmentId: enrollment._id },
      {
        $set: {
          attendancePercentage,
          currentModule: String(currentModule).trim(),
          notes: String(notes).trim(),
          lastUpdated: new Date(),
        },
        $push: {
          checkIns: {
            $each: [{
              attendancePercentage,
              currentModule: String(currentModule).trim(),
              notes: String(notes).trim(),
              submittedBy: req.user._id,
              submittedAt: new Date(),
            }],
            $slice: -100,
          },
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    enrollment.nextCheckInAt = nextCheckInAt();
    enrollment.lastCheckInReminderAt = null;
    enrollment.lastCheckInReminderFor = null;

    if (progress.attendancePercentage > 0 && enrollment.status === 'ENROLLED') {
      enrollment.status = 'IN_PROGRESS';
    }
    await enrollment.save();
    await recordProgressRisk({ enrollment, progress });
    return res.status(201).json({ success: true, data: { progress, enrollment } });
  } catch (error) {
    return next(error);
  }
};

const markDroppedOut = async (req, res, next) => {
  try {
    const enrollment = await TrainingEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Training enrollment not found' });

    if (req.user.role === 'BENEFICIARY') {
      const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
      if (!profile || String(enrollment.beneficiaryId) !== String(profile._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this enrollment' });
      }
    }
    if (!['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status)) {
      return res.status(400).json({ success: false, message: 'Only active enrollments can be marked as dropped out' });
    }

    enrollment.status = 'DROPPED_OUT';
    await enrollment.save();
    const sourceKey = `dropout:${enrollment._id}`;
    const intervention = await Intervention.findOneAndUpdate(
      { sourceKey },
      {
        $setOnInsert: {
          beneficiaryId: enrollment.beneficiaryId,
          enrollmentId: enrollment._id,
          raisedBy: req.user.role === 'BENEFICIARY' ? undefined : req.user._id,
          source: 'SYSTEM',
          sourceKey,
          reason: String(req.body.reason || 'Training dropout reported; follow-up required.').trim(),
          riskLevel: 'HIGH',
          status: 'OPEN',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
    return res.status(200).json({ success: true, data: { enrollment, intervention } });
  } catch (error) {
    return next(error);
  }
};

const confirmTrainingCompletion = async (req, res, next) => {
  try {
    if (req.body.completionConfirmed !== true) {
      return res.status(400).json({ success: false, message: 'Officer must confirm training completion' });
    }
    const enrollment = await TrainingEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Training enrollment not found' });
    if (enrollment.status !== 'IN_PROGRESS') {
      return res.status(409).json({ success: false, message: 'Only in-progress training can be confirmed complete' });
    }

    enrollment.status = 'COMPLETED';
    enrollment.completedAt = new Date();
    enrollment.completionReviewedBy = req.user._id;
    enrollment.completionNotes = String(req.body.notes || '').trim();
    await enrollment.save();
    return res.status(200).json({ success: true, data: enrollment, message: 'Training completion verified; completion certificate is ready for approval.' });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all enrollments (Officer/Admin only) with district & status filters
// @route   GET /api/enrollments
// @access  Private (OFFICER, ADMIN)
const getAllEnrollments = async (req, res, next) => {
  try {
    const { district, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (district) {
      const matchingProfiles = await BeneficiaryProfile.find({
        'location.district': new RegExp(district, 'i'),
      }).select('_id');
      const profileIds = matchingProfiles.map((p) => p._id);
      query.beneficiaryId = { $in: profileIds };
    }

    const enrollments = await TrainingEnrollment.find(query)
      .populate({
        path: 'beneficiaryId',
        populate: { path: 'userId', select: 'name email phone district state' },
      })
      .populate('courseId')
      .populate('centerId')
      .sort({ createdAt: -1 });

    const enrollmentIds = enrollments.map((e) => e._id);
    const progressList = await TrainingProgress.find({ enrollmentId: { $in: enrollmentIds } });

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.enrollmentId.toString()] = p;
    });

    const data = enrollments.map((e) => ({
      ...e.toObject(),
      progress: progressMap[e._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollSelf,
  getOwnEnrollments,
  updateOwnProgress,
  getAllEnrollments,
  markDroppedOut,
  confirmTrainingCompletion,
  getCenterEligibilityError,
  getDocumentGateError,
  validateCheckIn,
  createTrainingCheckIn,
};
