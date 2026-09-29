const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  attendancePercentage: { type: Number, min: 0, max: 100, required: true },
  currentModule: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
}, { _id: true });

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
    checkIns: { type: [checkInSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

trainingProgressSchema.index({ attendancePercentage: 1 });

const TrainingProgress = mongoose.model('TrainingProgress', trainingProgressSchema);

module.exports = TrainingProgress;
