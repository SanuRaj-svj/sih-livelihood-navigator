const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const env = require('./env');

const seedInMemoryDatabase = async () => {
  try {
    const NSQFCourse = require('../models/NSQFCourse');
    const TrainingCenter = require('../models/TrainingCenter');
    const Opportunity = require('../models/Opportunity');
    const User = require('../models/User');
    const BeneficiaryProfile = require('../models/BeneficiaryProfile');
    const TrainingEnrollment = require('../models/TrainingEnrollment');
    const TrainingProgress = require('../models/TrainingProgress');
    const Outcome = require('../models/Outcome');
    const bcrypt = require('bcrypt');

    const courseCount = await NSQFCourse.countDocuments();
    if (courseCount === 0) {
      console.log('Seeding in-memory database with sample courses, centers, and officers...');

      const courses = await NSQFCourse.insertMany([
        {
          courseName: 'Self Employed Tailor',
          qualificationName: 'Self Employed Tailor - AMH/Q1947',
          nsqfLevel: 4,
          sector: 'Apparel & Handlooms',
          requiredEducation: '8th Pass',
          duration: '300 hours',
        },
        {
          courseName: 'Assistant Electrician',
          qualificationName: 'Assistant Electrician - ELE/Q0106',
          nsqfLevel: 3,
          sector: 'Electrical & Power',
          requiredEducation: '10th Pass',
          duration: '400 hours',
        },
        {
          courseName: 'Plumber General',
          qualificationName: 'Plumber General - PSC/Q0104',
          nsqfLevel: 4,
          sector: 'Plumbing & Construction',
          requiredEducation: '8th Pass',
          duration: '350 hours',
        },
        {
          courseName: 'Domestic Data Entry Operator',
          qualificationName: 'Domestic Data Entry Operator - SSC/Q2212',
          nsqfLevel: 4,
          sector: 'IT-ITeS',
          requiredEducation: '10th Pass',
          duration: '400 hours',
        },
      ]);

      const center = await TrainingCenter.create({
        name: 'Bhopal PM-AJAY Skill Hub',
        address: 'MP Nagar Zone 1, Bhopal, Madhya Pradesh - 462011',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
        coursesOffered: courses.map((c) => c._id),
        capacity: 150,
      });

      await Opportunity.create({
        title: 'Apparel Factory Stitching Operator',
        type: 'WAGE_EMPLOYMENT',
        sector: 'Apparel & Handlooms',
        description: 'Wage employment opportunity at Garment Unit in Bhopal.',
      });

      // Officer account (Password: Password123)
      const officerUser = await User.create({
        name: 'Officer Rajesh Kumar',
        email: 'officer@pmajay.gov.in',
        phone: '9876543210',
        passwordHash: 'Password123',
        role: 'OFFICER',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
      });

      // Demo Beneficiary account
      const benUser = await User.create({
        name: 'Anita Sharma',
        email: 'anita@example.com',
        phone: '9123456789',
        passwordHash: 'Password123',
        role: 'BENEFICIARY',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
      });

      const benProfile = await BeneficiaryProfile.create({
        userId: benUser._id,
        personal: { age: 26, gender: 'Female' },
        education: { level: '10th Pass', field: 'General' },
        location: { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Fanda', village: 'Karond' },
        livelihood: { currentOccupation: 'Handloom Weaver', familyOccupation: 'Agriculture', currentIncomeRange: '< 50000' },
        skills: ['Weaving', 'Embroidery', 'Stitching'],
        traditionalSkills: ['Handloom'],
        interests: ['Textiles', 'Tailoring'],
        aspirations: ['Boutique Entrepreneur'],
        employmentPreference: 'SELF_EMPLOYMENT',
        preferredLanguage: 'Hindi',
        source: 'VOICE',
        profileCompletion: 85,
      });

      // Enrollment & Outcome
      const enrollment = await TrainingEnrollment.create({
        beneficiaryId: benProfile._id,
        courseId: courses[0]._id,
        centerId: center._id,
        status: 'IN_PROGRESS',
      });

      await TrainingProgress.create({
        enrollmentId: enrollment._id,
        attendancePercentage: 78,
        currentModule: 'Pattern Cutting & Sewing Machine Maintenance',
        notes: 'Demonstrating excellent practical stitching accuracy',
      });

      console.log('Sample in-memory dataset seeded successfully!');
      console.log('Officer Credentials: officer@pmajay.gov.in / Password123');
      console.log('Beneficiary Credentials: anita@example.com / Password123');
    }
  } catch (err) {
    console.error('Error seeding in-memory database:', err.message);
  }
};

const connectWithRetry = async () => {
  try {
    // 3-second timeout attempt for Atlas, fallback to Memory Server if offline/unreachable
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.warn('MongoDB Atlas connection failed:', err.message);
    console.log('Starting local MongoMemoryServer fallback for development...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('MongoMemoryServer started and connected successfully!');
      await seedInMemoryDatabase();
    } catch (memErr) {
      console.error('MongoMemoryServer error:', memErr.message);
    }
  }
};

module.exports = connectWithRetry;
