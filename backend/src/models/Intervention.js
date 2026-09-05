const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
      required: [true, 'Beneficiary ID is required'],
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer user ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Intervention reason is required'],
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    actionTaken: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
  }
);

const Intervention = mongoose.model('Intervention', interventionSchema);

module.exports = Intervention;
