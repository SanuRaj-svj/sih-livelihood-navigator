const mongoose = require('mongoose');

const applicationEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['INTERESTED', 'APPLIED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN', 'HIRED'],
    required: true,
  },
  note: { type: String, trim: true, maxlength: 1000, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const opportunityApplicationSchema = new mongoose.Schema({
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BeneficiaryProfile', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: {
    type: String,
    enum: ['INTERESTED', 'APPLIED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN', 'HIRED'],
    default: 'INTERESTED',
  },
  note: { type: String, trim: true, maxlength: 1000, default: '' },
  history: { type: [applicationEventSchema], default: [] },
}, { timestamps: true });

opportunityApplicationSchema.index({ beneficiaryId: 1, opportunityId: 1 }, { unique: true });
opportunityApplicationSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('OpportunityApplication', opportunityApplicationSchema);