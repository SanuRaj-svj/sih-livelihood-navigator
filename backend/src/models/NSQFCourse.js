const mongoose = require('mongoose');

const nsqfCourseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    qualificationName: {
      type: String,
      trim: true,
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    sector: {
      type: String,
      trim: true,
    },
    jobRoles: [{ type: String, trim: true }],
    requiredEducation: {
      type: String,
      trim: true,
    },
    requiredSkills: [{ type: String, trim: true }],
    acquiredSkills: [{ type: String, trim: true }],
    duration: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const NSQFCourse = mongoose.model('NSQFCourse', nsqfCourseSchema);

module.exports = NSQFCourse;
