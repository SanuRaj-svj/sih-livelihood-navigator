const mongoose = require('mongoose');

const trainingProgressSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingEnrollment',
      required: [true, 'Enrollment ID is required'],
      unique: true,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: [0, 'Attendance cannot be negative'],
      max: [100, 'Attendance cannot exceed 100%'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    milestonesCompleted: [
      {
        type: String,
        trim: true,
      },
    ],
    currentModule: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const TrainingProgress = mongoose.model('TrainingProgress', trainingProgressSchema);

module.exports = TrainingProgress;
