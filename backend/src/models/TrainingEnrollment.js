const mongoose = require('mongoose');

const trainingEnrollmentSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeneficiaryProfile',
      required: [true, 'Beneficiary profile ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NSQFCourse',
      required: [true, 'Course ID is required'],
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingCenter',
      required: [true, 'Training center ID is required'],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED_OUT'],
      default: 'ENROLLED',
    },
  },
  {
    timestamps: true,
  }
);

const TrainingEnrollment = mongoose.model('TrainingEnrollment', trainingEnrollmentSchema);

module.exports = TrainingEnrollment;
