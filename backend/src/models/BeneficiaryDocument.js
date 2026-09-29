const mongoose = require('mongoose');

const reviewEventSchema = new mongoose.Schema({
  decision: { type: String, enum: ['VERIFIED', 'REJECTED'], required: true },
  feedback: { type: String, trim: true, default: '' },
  identityMatchConfirmed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedAt: { type: Date, default: Date.now },
}, { _id: false });

const beneficiaryDocumentSchema = new mongoose.Schema(
  {
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BeneficiaryProfile', required: true, index: true },
    documentType: { type: String, enum: ['SC_CERTIFICATE'], default: 'SC_CERTIFICATE' },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    fileData: { type: Buffer, required: true, select: false },
    fileSize: { type: Number, required: true },
    ocrText: { type: String, default: '' },
    ocrStatus: { type: String, enum: ['COMPLETED', 'UNAVAILABLE'], default: 'UNAVAILABLE' },
    qrPayload: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['PENDING_REVIEW', 'VERIFIED', 'REJECTED'], default: 'PENDING_REVIEW' },
    identityMatchConfirmed: { type: Boolean, default: false },
    reviewFeedback: { type: String, trim: true, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewHistory: { type: [reviewEventSchema], default: [] },
  },
  { timestamps: true },
);

beneficiaryDocumentSchema.index({ verificationStatus: 1, createdAt: 1 });

module.exports = mongoose.model('BeneficiaryDocument', beneficiaryDocumentSchema);