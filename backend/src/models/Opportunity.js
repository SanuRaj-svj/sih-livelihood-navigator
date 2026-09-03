const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['WAGE_EMPLOYMENT', 'SELF_EMPLOYMENT'],
      default: 'WAGE_EMPLOYMENT',
    },
    sector: {
      type: String,
      trim: true,
    },
    location: {
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
    requiredSkills: [{ type: String, trim: true }],
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ location: '2dsphere' });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;
