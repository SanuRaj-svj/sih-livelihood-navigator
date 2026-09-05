const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
      required: [true, 'Beneficiary ID is required'],
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingEnrollment',
    },
    outcomeType: {
      type: String,
      enum: ['WAGE_EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'FURTHER_TRAINING'],
      required: [true, 'Outcome type is required'],
    },
    employerOrBusinessName: {
      type: String,
      trim: true,
      default: '',
    },
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    dateAchieved: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Verifying officer user ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Outcome = mongoose.model('Outcome', outcomeSchema);

module.exports = Outcome;
