const mongoose = require('mongoose');

const trainingCertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, trim: true },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingEnrollment',
      required: true,
    },
    stage: { type: String, enum: ['ENROLLMENT', 'COMPLETION'], required: true },
    recordSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    recordHash: { type: String, required: true, unique: true, index: true },
    ledger: {
      network: { type: String, default: 'local-hash-ledger' },
      transactionHash: { type: String, default: null },
      status: { type: String, enum: ['PENDING', 'ANCHORED'], default: 'ANCHORED' },
    },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

trainingCertificateSchema.index({ enrollmentId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('TrainingCertificate', trainingCertificateSchema);
