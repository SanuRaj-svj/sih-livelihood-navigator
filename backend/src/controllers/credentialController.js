const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const NSQFCourse = require('../models/NSQFCourse');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingCredential = require('../models/TrainingCredential');
const {
  digestCredential,
  anchorCredential,
  verifyCredentialAnchor,
} = require('../services/blockchain/credentialAnchor');

const issueTrainingCredential = async (req, res, next) => {
  try {
    const { enrollmentId } = req.body;
    if (!enrollmentId) {
      return res.status(400).json({ success: false, message: 'enrollmentId is required' });
    }

    const enrollment = await TrainingEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Training enrollment not found' });
    }
    if (enrollment.status !== 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'Training enrollment must be COMPLETED before issuing a credential',
      });
    }

    const existing = await TrainingCredential.findOne({ enrollmentId });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const [profile, course] = await Promise.all([
      BeneficiaryProfile.findById(enrollment.beneficiaryId),
      NSQFCourse.findById(enrollment.courseId),
    ]);
    if (!profile || !course) {
      return res.status(404).json({ success: false, message: 'Credential source data not found' });
    }

    const payload = {
      credentialType: 'TRAINING_COMPLETION',
      enrollmentId: enrollment._id.toString(),
      beneficiaryId: profile._id.toString(),
      courseId: course._id.toString(),
      courseName: course.courseName,
      issuedAt: new Date().toISOString(),
    };
    const credentialHash = digestCredential(payload);
    const anchor = await anchorCredential(credentialHash);

    const credential = await TrainingCredential.create({
      enrollmentId: enrollment._id,
      beneficiaryId: profile._id,
      courseName: course.courseName,
      issuedBy: req.user._id,
      issuedAt: payload.issuedAt,
      credentialHash,
      anchor,
    });

    return res.status(201).json({ success: true, data: credential });
  } catch (error) {
    return next(error);
  }
};

const verifyTrainingCredential = async (req, res, next) => {
  try {
    const credential = await TrainingCredential.findById(req.params.id)
      .select('courseName issuedAt credentialHash anchor');
    if (!credential) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    const anchored = await verifyCredentialAnchor(credential.credentialHash, credential.anchor);
    return res.status(200).json({
      success: true,
      data: {
        credentialId: credential._id,
        courseName: credential.courseName,
        issuedAt: credential.issuedAt,
        network: credential.anchor.network,
        transactionHash: credential.anchor.transactionHash,
        credentialHash: credential.credentialHash,
        valid: anchored,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { issueTrainingCredential, verifyTrainingCredential };
