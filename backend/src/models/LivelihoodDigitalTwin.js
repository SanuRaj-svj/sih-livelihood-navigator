const mongoose = require('mongoose');

const livelihoodDigitalTwinSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
    },
    sessionId: {
      type: String,
      trim: true,
      sparse: true,
    },
    profileSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    documentVerification: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skillEngine: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    constraintEngine: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    aspirationEngine: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skillGapEngine: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    opportunityMatcher: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    roadmap: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outcomeTracking: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    communityIntelligence: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: String,
      enum: ['FORM', 'VOICE', 'MIXED'],
      default: 'FORM',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'READY'],
      default: 'DRAFT',
    },
    reviewStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewFeedback: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  { timestamps: true },
);

livelihoodDigitalTwinSchema.index({ beneficiaryId: 1, updatedAt: -1 });
livelihoodDigitalTwinSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('LivelihoodDigitalTwin', livelihoodDigitalTwinSchema);