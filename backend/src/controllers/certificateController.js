const TrainingCertificate = require('../models/TrainingCertificate');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingProgress = require('../models/TrainingProgress');
const { createRecordHash, buildCertificateId } = require('../services/blockchainProofService');
const { sendCertificateIssuedEmail } = require('../services/emailNotificationService');
const PDFDocument = require('pdfkit');

const generateCertificatePdfBuffer = async (certificate) => {
  const snapshot = certificate.recordSnapshot || {};

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: 'A4', margin: 54 });
    const chunks = [];

    document.on('data', (chunk) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);

    document.fontSize(24).fillColor('#0f766e').text('Livelihood Navigator', { align: 'center' });
    document.moveDown(1.5).fontSize(20).fillColor('#111827').text(`${certificate.stage === 'ENROLLMENT' ? 'Enrollment' : 'Completion'} Certificate`, { align: 'center' });
    document.moveDown().fontSize(12).fillColor('#374151').text(`Certificate ID: ${certificate.certificateId}`);
    document.text(`Course: ${snapshot.courseName || 'Training course'}`);
    document.text(`Training Centre: ${snapshot.centerName || 'Training centre'}`);
    document.text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`);
    if (snapshot.attendancePercentage !== undefined) document.text(`Attendance: ${snapshot.attendancePercentage}%`);
    document.moveDown(2).fontSize(10).fillColor('#6b7280').text(`Record hash: ${certificate.recordHash}`);
    document.text('This certificate is verifiable through the Livelihood Navigator certificate checker.');
    document.end();
  });
};

const issueCertificateForEnrollment = async (enrollmentId, issuerUserId = null, stage = 'COMPLETION') => {
  const enrollment = await TrainingEnrollment.findById(enrollmentId)
    .populate('courseId')
    .populate('centerId')
    .populate({
      path: 'beneficiaryId',
      select: 'personal location',
      populate: { path: 'userId', select: 'name email phone' },
    });

  if (!enrollment) {
    return { success: false, message: 'Training enrollment not found' };
  }

  if (stage === 'COMPLETION' && enrollment.status !== 'COMPLETED') {
    return { success: false, message: 'Certificate requires a completed enrollment' };
  }
  if (stage === 'ENROLLMENT' && !['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status)) {
    return { success: false, message: 'Enrollment certificate requires an active enrollment' };
  }

  const progress = await TrainingProgress.findOne({ enrollmentId: enrollment._id }).lean();
  const existing = await TrainingCertificate.findOne({ enrollmentId: enrollment._id, stage });
  if (existing) {
    return { success: true, alreadyIssued: true, data: existing };
  }

  const snapshot = {
    enrollmentId: String(enrollment._id),
    beneficiaryId: String(enrollment.beneficiaryId?._id || enrollment.beneficiaryId),
    courseId: String(enrollment.courseId?._id || enrollment.courseId),
    courseName: enrollment.courseId?.courseName || null,
    centerId: String(enrollment.centerId?._id || enrollment.centerId),
    centerName: enrollment.centerId?.name || null,
    enrollmentDate: enrollment.enrollmentDate,
    completedAt: stage === 'COMPLETION' ? new Date() : null,
    attendancePercentage: progress?.attendancePercentage || 0,
    stage,
  };

  const certificate = await TrainingCertificate.create({
    certificateId: buildCertificateId(),
    enrollmentId: enrollment._id,
    stage,
    recordSnapshot: snapshot,
    recordHash: createRecordHash(snapshot),
    issuedBy: issuerUserId,
  });

  enrollment[stage === 'ENROLLMENT' ? 'enrollmentCertificateId' : 'completionCertificateId'] = certificate.certificateId;
  await enrollment.save();

  const beneficiaryEmail = enrollment.beneficiaryId?.userId?.email;
  const beneficiaryName = enrollment.beneficiaryId?.userId?.name || 'Beneficiary';
  const pdfBuffer = await generateCertificatePdfBuffer(certificate);

  if (beneficiaryEmail) {
    await sendCertificateIssuedEmail({
      recipientEmail: beneficiaryEmail,
      beneficiaryName,
      courseName: snapshot.courseName,
      centerName: snapshot.centerName,
      certificate,
      pdfBuffer,
    });
  }

  return { success: true, data: certificate };
};

const issueCertificate = async (req, res, next) => {
  try {
    const stage = req.body.stage === 'ENROLLMENT' ? 'ENROLLMENT' : 'COMPLETION';
    const result = await issueCertificateForEnrollment(req.params.enrollmentId, req.user?._id, stage);
    if (!result.success) {
      const status = result.message === 'Training enrollment not found' ? 404 : 400;
      return res.status(status).json(result);
    }
    if (result.alreadyIssued) {
      return res.status(200).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const unlockEnrollment = async (req, res, next) => {
  try {
    const certificate = await TrainingCertificate.findOne({
      certificateId: String(req.body.certificateId || '').trim(),
      stage: 'ENROLLMENT',
      revokedAt: null,
    });
    if (!certificate) return res.status(404).json({ success: false, message: 'Valid enrollment certificate not found' });

    const BeneficiaryProfile = require('../models/BeneficiaryProfile');
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id });
    const enrollment = await TrainingEnrollment.findById(certificate.enrollmentId);
    if (!profile || !enrollment || String(enrollment.beneficiaryId) !== String(profile._id)) {
      return res.status(403).json({ success: false, message: 'This certificate does not belong to your enrollment' });
    }

    enrollment.enrollmentCertificateVerifiedAt = new Date();
    await enrollment.save();
    return res.json({ success: true, enrollmentId: enrollment._id, message: 'Enrollment unlocked successfully' });
  } catch (error) {
    return next(error);
  }
};

const getPendingCertificateApprovals = async (req, res, next) => {
  try {
    const enrollments = await TrainingEnrollment.find({
      $or: [
        { status: { $in: ['ENROLLED', 'IN_PROGRESS'] }, enrollmentCertificateId: { $in: [null, ''] } },
        { status: 'COMPLETED', completionCertificateId: { $in: [null, ''] } },
      ],
    })
      .populate({
        path: 'beneficiaryId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('courseId')
      .populate('centerId')
      .sort({ updatedAt: -1 });

    const data = enrollments.map((enrollment) => ({
      enrollmentId: enrollment._id,
      beneficiaryName: enrollment.beneficiaryId?.userId?.name || 'Beneficiary',
      beneficiaryEmail: enrollment.beneficiaryId?.userId?.email || null,
      courseName: enrollment.courseId?.courseName || 'Course',
      centerName: enrollment.centerId?.name || 'Training Center',
      status: enrollment.status,
      enrollmentCertificateId: enrollment.enrollmentCertificateId || null,
      completionCertificateId: enrollment.completionCertificateId || null,
      needsEnrollmentCertificate: !enrollment.enrollmentCertificateId && ['ENROLLED', 'IN_PROGRESS'].includes(enrollment.status),
      needsCompletionCertificate: !enrollment.completionCertificateId && enrollment.status === 'COMPLETED',
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const downloadCertificatePdf = async (req, res, next) => {
  try {
    const certificate = await TrainingCertificate.findOne({ certificateId: req.params.certificateId }).lean();
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    const pdfBuffer = await generateCertificatePdfBuffer(certificate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${certificate.certificateId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await TrainingCertificate.findOne({ certificateId: req.params.certificateId }).lean();
    if (!certificate) return res.status(404).json({ success: false, verified: false, message: 'Certificate not found' });
    const recalculatedHash = createRecordHash(certificate.recordSnapshot);
    const verified = recalculatedHash === certificate.recordHash && !certificate.revokedAt;
    res.status(200).json({
      success: true,
      verified,
      certificateId: certificate.certificateId,
      recordHash: certificate.recordHash,
      ledger: certificate.ledger,
      record: verified ? certificate.recordSnapshot : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  verifyCertificate,
  unlockEnrollment,
  downloadCertificatePdf,
  issueCertificateForEnrollment,
  getPendingCertificateApprovals,
  generateCertificatePdfBuffer,
};
