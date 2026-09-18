const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    ministry: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    beneficiaryGroups: [{ type: String, trim: true }],
    eligibility: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    sectors: [{ type: String, trim: true }],
    applicationUrl: { type: String, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
    sourceUpdatedAt: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CLOSED'], default: 'ACTIVE' },
  },
  { timestamps: true },
);

governmentSchemeSchema.index({ name: 1 });
governmentSchemeSchema.index({ beneficiaryGroups: 1 });
governmentSchemeSchema.index({ sectors: 1 });
governmentSchemeSchema.index({ status: 1 });

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
