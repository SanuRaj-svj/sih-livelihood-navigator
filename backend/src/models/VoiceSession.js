const mongoose = require('mongoose');

const turnSchema = new mongoose.Schema(
  {
    speaker: {
      type: String,
      enum: ['USER', 'SYSTEM'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const voiceSessionSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      trim: true,
    },
    turns: [turnSchema],
    extractedProfileData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    currentSlot: { type: String, trim: true, default: '' },
    skippedSlots: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['ACTIVE', 'AWAITING_CONFIRMATION', 'COMPLETED', 'ABANDONED'],
      default: 'ACTIVE',
    },
    language: {
      type: String,
      default: 'Hindi',
    },
  },
  {
    timestamps: true,
  }
);

const VoiceSession = mongoose.model('VoiceSession', voiceSessionSchema);

module.exports = VoiceSession;
