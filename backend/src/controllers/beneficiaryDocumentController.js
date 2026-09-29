const sharp = require('sharp');
const jsQR = require('jsqr');
const { createWorker } = require('tesseract.js');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const BeneficiaryDocument = require('../models/BeneficiaryDocument');
const LivelihoodDigitalTwin = require('../models/LivelihoodDigitalTwin');

const extractEvidence = async (buffer) => {
  const image = await sharp(buffer).rotate().resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const qr = jsQR(new Uint8ClampedArray(image.data), image.info.width, image.info.height, { inversionAttempts: 'attemptBoth' });
  let ocrText = '';
  let ocrStatus = 'UNAVAILABLE';
  let worker;
  try {
    worker = await createWorker('eng');
    const result = await worker.recognize(buffer);
    ocrText = String(result.data.text || '').trim();
    ocrStatus = 'COMPLETED';
  } catch (error) {
    console.warn(`Certificate OCR unavailable: ${error.message}`);
  } finally {
    if (worker) await worker.terminate();
  }
  return { ocrText, ocrStatus, qrPayload: qr?.data || '' };
};

const uploadSourceCertificate = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Upload a PNG, JPEG, or WebP certificate image' });
    let imageMetadata;
    try {
      imageMetadata = await sharp(req.file.buffer, { limitInputPixels: 40000000 }).metadata();
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a readable certificate image' });
    }
    if (!['jpeg', 'png', 'webp'].includes(imageMetadata.format)) {
      return res.status(400).json({ success: false, message: 'Uploaded file is not a supported certificate image' });
    }
    let profile = await BeneficiaryProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $setOnInsert: { userId: req.user._id, source: 'FORM' } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    ).select('_id');

    let evidence = { ocrText: '', ocrStatus: 'UNAVAILABLE', qrPayload: '' };
    try {
      evidence = await extractEvidence(req.file.buffer);
    } catch (error) {
      console.warn(`Certificate image processing unavailable: ${error.message}`);
    }
    const document = await BeneficiaryDocument.create({
      beneficiaryId: profile._id,
      documentType: 'SC_CERTIFICATE',
      originalName: req.file.originalname.slice(0, 180),
      mimeType: req.file.mimetype,
      fileData: req.file.buffer,
      fileSize: req.file.size,
      ...evidence,
      verificationStatus: 'PENDING_REVIEW',
    });
    await BeneficiaryProfile.findByIdAndUpdate(profile._id, {
      $set: {
        'verification.scCertificateStatus': 'PENDING_REVIEW',
        'verification.scCertificateIdentityMatch': false,
        'verification.scCertificateVerifiedAt': null,
        'verification.scCertificateReviewedBy': null,
      },
    });
    await LivelihoodDigitalTwin.findOneAndUpdate(
      { beneficiaryId: profile._id },
      { $set: { documentVerification: { scCertificateStatus: 'PENDING_REVIEW', identityMatchConfirmed: false } } },
      { sort: { updatedAt: -1 } },
    );
    return res.status(201).json({ success: true, data: document, message: 'Document captured; officer review is required to validate authenticity.' });
  } catch (error) {
    return next(error);
  }
};

const getMyDocuments = async (req, res, next) => {
  try {
    const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
    if (!profile) return res.status(404).json({ success: false, message: 'Beneficiary profile not found' });
    const documents = await BeneficiaryDocument.find({ beneficiaryId: profile._id })
      .populate('reviewHistory.reviewedBy', 'name role')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return next(error);
  }
};

const getPendingDocuments = async (req, res, next) => {
  try {
    const documents = await BeneficiaryDocument.find({
      $or: [
        { verificationStatus: 'PENDING_REVIEW' },
        { verificationStatus: 'VERIFIED', identityMatchConfirmed: { $ne: true } },
      ],
    })
      .populate({ path: 'beneficiaryId', populate: { path: 'userId', select: 'name email phone' } })
      .sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    return next(error);
  }
};

const reviewSourceCertificate = async (req, res, next) => {
  try {
    const { decision, feedback = '', identityMatchConfirmed = false } = req.body;
    if (!['VERIFIED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be VERIFIED or REJECTED' });
    }
    if (decision === 'REJECTED' && !String(feedback).trim()) {
      return res.status(400).json({ success: false, message: 'Feedback is required when rejecting a document' });
    }
    if (decision === 'VERIFIED' && identityMatchConfirmed !== true) {
      return res.status(400).json({ success: false, message: 'Confirm the certificate identity matches the beneficiary profile before verification' });
    }
    const reviewEvent = {
      decision,
      feedback: String(feedback).trim(),
      identityMatchConfirmed: decision === 'VERIFIED' && identityMatchConfirmed === true,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };
    const document = await BeneficiaryDocument.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { verificationStatus: 'PENDING_REVIEW' },
          { verificationStatus: 'VERIFIED', identityMatchConfirmed: { $ne: true } },
        ],
      },
      { $set: {
        verificationStatus: decision,
        identityMatchConfirmed: decision === 'VERIFIED' && identityMatchConfirmed === true,
        reviewFeedback: String(feedback).trim(),
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }, $push: { reviewHistory: reviewEvent } },
      { new: true, runValidators: true },
    );
    if (!document) return res.status(404).json({ success: false, message: 'Pending certificate document not found' });
    await BeneficiaryProfile.findByIdAndUpdate(document.beneficiaryId, {
      $set: {
        'verification.scCertificateStatus': decision,
        'verification.scCertificateIdentityMatch': decision === 'VERIFIED' && identityMatchConfirmed === true,
        'verification.scCertificateVerifiedAt': decision === 'VERIFIED' ? new Date() : null,
        'verification.scCertificateReviewedBy': req.user._id,
        ...(decision === 'VERIFIED' ? { 'personal.community': 'SC' } : {}),
      },
    });
    await LivelihoodDigitalTwin.findOneAndUpdate(
      { beneficiaryId: document.beneficiaryId },
      { $set: { documentVerification: {
        scCertificateStatus: decision,
        identityMatchConfirmed: document.identityMatchConfirmed,
        feedback: String(feedback).trim(),
        reviewedAt: document.reviewedAt,
        reviewedBy: req.user._id,
      } } },
      { sort: { updatedAt: -1 } },
    );
    return res.status(200).json({ success: true, data: document });
  } catch (error) {
    return next(error);
  }
};

const downloadSourceCertificate = async (req, res, next) => {
  try {
    const document = await BeneficiaryDocument.findById(req.params.id).select('+fileData');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (req.user.role === 'BENEFICIARY') {
      const profile = await BeneficiaryProfile.findOne({ userId: req.user._id }).select('_id');
      if (!profile || String(profile._id) !== String(document.beneficiaryId)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this document' });
      }
    }
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName.replace(/["\\]/g, '_')}"`);
    return res.send(document.fileData);
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadSourceCertificate, getMyDocuments, getPendingDocuments, reviewSourceCertificate, downloadSourceCertificate };