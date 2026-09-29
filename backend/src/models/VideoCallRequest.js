const mongoose = require('mongoose');

const videoCallRequestSchema = new mongoose.Schema({
  beneficiaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BeneficiaryProfile',
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: { type: String, trim: true, maxlength: 500, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED'],
    default: 'PENDING',
  },
  roomName: { type: String, trim: true, default: '' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acceptedAt: { type: Date, default: null },
  declinedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  declinedAt: { type: Date, default: null },
  declineReason: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

videoCallRequestSchema.index({ status: 1, createdAt: 1 });
videoCallRequestSchema.index({ requesterId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('VideoCallRequest', videoCallRequestSchema);