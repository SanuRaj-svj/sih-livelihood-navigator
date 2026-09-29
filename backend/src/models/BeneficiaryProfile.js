const mongoose = require('mongoose');

const profileCorrectionRequestSchema = new mongoose.Schema({
  fields: [{
    type: String,
    enum: [
      'personal.age', 'personal.gender', 'education.level', 'education.field',
      'location.state', 'location.district', 'location.block', 'location.village',
      'livelihood.currentOccupation', 'livelihood.familyOccupation', 'livelihood.currentIncomeRange',
      'skills', 'traditionalSkills', 'interests', 'aspirations', 'employmentPreference',
    ],
    required: true,
  }],
  reason: { type: String, trim: true, required: true, maxlength: 1000 },
  status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { _id: true });

const beneficiaryProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personal: {
      age: { type: Number, min: 0 },
      gender: { type: String, trim: true },
      community: { type: String, trim: true, default: 'unknown' },
    },
    education: {
      level: { type: String, trim: true },
      field: { type: String, trim: true },
    },
    location: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      block: { type: String, trim: true },
      village: { type: String, trim: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    livelihood: {
      currentOccupation: { type: String, trim: true },
      familyOccupation: { type: String, trim: true },
      currentIncomeRange: { type: String, trim: true },
    },
    skills: [{ type: String, trim: true }],
    traditionalSkills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    aspirations: [{ type: String, trim: true }],
    employmentPreference: {
      type: String,
      enum: ['SELF_EMPLOYMENT', 'WAGE_EMPLOYMENT', 'HYBRID', 'ANY'],
      default: 'ANY',
    },
    mobility: {
      willingToTravel: { type: Boolean, default: false },
      maxDistanceKm: { type: Number, default: 0 },
    },
    physicalConstraints: [{ type: String, trim: true }],
    preferredLanguage: { type: String, default: 'Hindi' },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      enum: ['FORM', 'VOICE', 'OFFICER', 'MIXED'],
      default: 'FORM',
    },
    verification: {
      scCertificateStatus: {
        type: String,
        enum: ['NOT_SUBMITTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'],
        default: 'NOT_SUBMITTED',
      },
      scCertificateIdentityMatch: { type: Boolean, default: false },
      scCertificateVerifiedAt: Date,
      scCertificateReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    correctionRequests: { type: [profileCorrectionRequestSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial location queries
beneficiaryProfileSchema.index({ 'location.coordinates': '2dsphere' });
beneficiaryProfileSchema.index({ 'location.district': 1 });

const BeneficiaryProfile = mongoose.model(
  'BeneficiaryProfile',
  beneficiaryProfileSchema
);

module.exports = BeneficiaryProfile;
