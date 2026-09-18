const mongoose = require('mongoose');

const trainingCredentialSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingEnrollment',
      required: true,
      unique: true,
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    credentialHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    anchor: {
      network: { type: String, required: true },
      transactionHash: { type: String, required: true },
      anchoredAt: { type: Date, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingCredential', trainingCredentialSchema);
