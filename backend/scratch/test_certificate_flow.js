const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const User = require('../src/models/User');
const BeneficiaryProfile = require('../src/models/BeneficiaryProfile');
const NSQFCourse = require('../src/models/NSQFCourse');
const TrainingCenter = require('../src/models/TrainingCenter');
const TrainingEnrollment = require('../src/models/TrainingEnrollment');
const TrainingProgress = require('../src/models/TrainingProgress');

(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

    let admin = await User.findOne({ email: 'cert-admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Certificate Admin',
        phone: '9000000001',
        email: 'cert-admin@example.com',
        passwordHash: 'AdminPass123',
        role: 'ADMIN',
        district: 'Patna',
        state: 'Bihar',
        isActive: true,
      });
    }

    let beneficiaryUser = await User.findOne({ email: 'cert-beneficiary@example.com' });
    if (!beneficiaryUser) {
      beneficiaryUser = await User.create({
        name: 'Certificate Beneficiary',
        phone: '9000000002',
        email: 'cert-beneficiary@example.com',
        passwordHash: 'BeneficiaryPass123',
        role: 'BENEFICIARY',
        district: 'Patna',
        state: 'Bihar',
        isActive: true,
      });
    }

    let profile = await BeneficiaryProfile.findOne({ userId: beneficiaryUser._id });
    if (!profile) {
      profile = await BeneficiaryProfile.create({
        userId: beneficiaryUser._id,
        personal: { age: 24, gender: 'Female' },
        education: { level: '12th Pass' },
        location: { state: 'Bihar', district: 'Patna' },
        livelihood: { currentOccupation: 'Student' },
        skills: ['basic computer', 'communication'],
        interests: ['digital skills'],
        employmentPreference: 'WAGE_EMPLOYMENT',
        preferredLanguage: 'Hindi',
        profileCompletion: 90,
        source: 'FORM',
      });
    }

    let course = await NSQFCourse.findOne({ courseName: 'Certificate Test Course' });
    if (!course) {
      course = await NSQFCourse.create({
        courseName: 'Certificate Test Course',
        qualificationName: 'Certificate in Basic Digital Skills',
        nsqfLevel: 3,
        sector: 'IT-ITeS',
        jobRoles: ['Digital Assistant'],
        requiredSkills: ['computer basics'],
        acquiredSkills: ['data entry', 'digital literacy'],
        duration: '90 hours',
      });
    }

    let center = await TrainingCenter.findOne({ name: 'Certificate Test Center' });
    if (!center) {
      center = await TrainingCenter.create({
        name: 'Certificate Test Center',
        address: 'Patna, Bihar',
        location: { type: 'Point', coordinates: [85.1413, 25.5941] },
        coursesOffered: [course._id],
        capacity: 40,
        contactInfo: { phone: '9876543210', email: 'certcenter@example.com' },
      });
    }

    let enrollment = await TrainingEnrollment.findOne({ beneficiaryId: profile._id, courseId: course._id });
    if (!enrollment) {
      enrollment = await TrainingEnrollment.create({
        beneficiaryId: profile._id,
        courseId: course._id,
        centerId: center._id,
        status: 'COMPLETED',
        enrollmentDate: new Date(),
      });
    } else {
      enrollment.status = 'COMPLETED';
      await enrollment.save();
    }

    await TrainingProgress.findOneAndUpdate(
      { enrollmentId: enrollment._id },
      {
        enrollmentId: enrollment._id,
        attendancePercentage: 92,
        milestonesCompleted: ['Orientation', 'Practical Module'],
        currentModule: 'Completion',
        notes: 'Certificate issuance test',
      },
      { upsert: true, new: true, runValidators: true }
    );

    const token = jwt.sign({ id: admin._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const issueResponse = await fetch(`http://localhost:5000/api/certificates/${enrollment._id}/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const issueBody = await issueResponse.text();
    console.log('ISSUE_STATUS=' + issueResponse.status);
    console.log(issueBody);

    const result = JSON.parse(issueBody);
    if (result && result.success && result.data && result.data.certificateId) {
      const verifyResponse = await fetch(`http://localhost:5000/api/certificates/verify/${result.data.certificateId}`);
      const verifyBody = await verifyResponse.text();
      console.log('VERIFY_STATUS=' + verifyResponse.status);
      console.log(verifyBody);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('SCRIPT_ERROR=' + error.message);
    process.exit(1);
  }
})();
