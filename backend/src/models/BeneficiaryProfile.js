const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial location queries
beneficiaryProfileSchema.index({ 'location.coordinates': '2dsphere' });

const BeneficiaryProfile = mongoose.model(
  'BeneficiaryProfile',
  beneficiaryProfileSchema
);

module.exports = BeneficiaryProfile;
