const mongoose = require('mongoose');

const trainingCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Training center name is required'],
      trim: true,
    },
    address: {
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
    coursesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NSQFCourse',
      },
    ],
    capacity: {
      type: Number,
      default: 0,
    },
    contactInfo: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

trainingCenterSchema.index({ location: '2dsphere' });

const TrainingCenter = mongoose.model('TrainingCenter', trainingCenterSchema);

module.exports = TrainingCenter;
