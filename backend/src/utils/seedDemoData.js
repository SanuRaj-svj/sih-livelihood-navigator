const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const BeneficiaryProfile = require('../models/BeneficiaryProfile');
const NSQFCourse = require('../models/NSQFCourse');
const TrainingCenter = require('../models/TrainingCenter');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const TrainingProgress = require('../models/TrainingProgress');
const Outcome = require('../models/Outcome');
const Intervention = require('../models/Intervention');

const seedDemoData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas.');

    // Fetch existing reference courses and centers
    const courses = await NSQFCourse.find({});
    const centers = await TrainingCenter.find({});

    if (courses.length === 0 || centers.length === 0) {
      console.error('❌ Base courses or centers not found. Please run `npm run seed` first.');
      process.exit(1);
    }

    // Helper map to find course/center by sector/name
    const findCourseBySector = (sectorKeyword) =>
      courses.find((c) => (c.sector || '').toLowerCase().includes(sectorKeyword.toLowerCase())) || courses[0];

    const findCenterByDistrict = (districtKeyword) =>
      centers.find((c) => (c.address || c.name || '').toLowerCase().includes(districtKeyword.toLowerCase())) || centers[0];

    // Ensure Officer exists
    let officer = await User.findOne({ role: 'OFFICER' });
    if (!officer) {
      officer = await User.create({
        name: 'Officer Rajesh Kumar',
        phone: '9876543211',
        email: 'officer@pmajay.gov.in',
        passwordHash: 'Password123',
        role: 'OFFICER',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
      });
    }

    // Clear previous demo enrollments, profiles, progress, outcomes, interventions for clean re-run
    console.log('Cleaning prior demo enrollments, progress, outcomes, interventions...');
    await TrainingProgress.deleteMany({});
    await Outcome.deleteMany({});
    await Intervention.deleteMany({});
    await TrainingEnrollment.deleteMany({});
    await BeneficiaryProfile.deleteMany({});
    await User.deleteMany({ role: 'BENEFICIARY' });

    console.log('Inserting 10 rich demo beneficiaries across sectors & districts...');

    const demoBeneficiaries = [
      {
        name: 'Sunita Devi',
        email: 'sunita@example.com',
        phone: '9811122201',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
        personal: { age: 27, gender: 'Female' },
        education: { level: '10th Pass', field: 'General' },
        location: { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Fanda', village: 'Karond' },
        livelihood: { currentOccupation: 'Handloom Weaver', familyOccupation: 'Agriculture', currentIncomeRange: '< 50000' },
        skills: ['Weaving', 'Stitching', 'Embroidery'],
        interests: ['Apparel', 'Textiles'],
        sectorKeyword: 'Apparel',
        districtKeyword: 'Patna',
        status: 'COMPLETED',
        attendancePercentage: 92,
        currentModule: 'Course Complete',
        outcome: { outcomeType: 'WAGE_EMPLOYED', employerOrBusinessName: 'Patliputra Garments Ltd', monthlyIncome: 14500 },
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '9811122202',
        district: 'Jaipur',
        state: 'Rajasthan',
        personal: { age: 24, gender: 'Male' },
        education: { level: '12th Pass', field: 'Science' },
        location: { state: 'Rajasthan', district: 'Jaipur', block: 'Sanganer', village: 'Mahapura' },
        livelihood: { currentOccupation: 'Electrician Helper', familyOccupation: 'Trades', currentIncomeRange: '50000-100000' },
        skills: ['Basic Wiring', 'Circuit Testing'],
        interests: ['Electrical', 'Power'],
        sectorKeyword: 'Electrical',
        districtKeyword: 'Jaipur',
        status: 'IN_PROGRESS',
        attendancePercentage: 86,
        currentModule: 'Industrial Panel Wiring & Safety Standards',
      },
      {
        name: 'Pooja Verma',
        email: 'pooja@example.com',
        phone: '9811122203',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        personal: { age: 29, gender: 'Female' },
        education: { level: 'ITI/Diploma', field: 'Beauty Care' },
        location: { state: 'Uttar Pradesh', district: 'Varanasi', block: 'Chandpur', village: 'Shivpur' },
        livelihood: { currentOccupation: 'Parlor Assistant', familyOccupation: 'Service', currentIncomeRange: '< 50000' },
        skills: ['Skin Care', 'Hair Styling', 'Threading'],
        interests: ['Beauty', 'Wellness'],
        sectorKeyword: 'Beauty',
        districtKeyword: 'Varanasi',
        status: 'COMPLETED',
        attendancePercentage: 95,
        currentModule: 'Course Complete',
        outcome: { outcomeType: 'SELF_EMPLOYED', employerOrBusinessName: 'Pooja Beauty Studio', monthlyIncome: 18000 },
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '9811122204',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        personal: { age: 23, gender: 'Male' },
        education: { level: '10th Pass', field: 'General' },
        location: { state: 'Uttar Pradesh', district: 'Lucknow', block: 'Vikas Nagar', village: 'Aliganj' },
        livelihood: { currentOccupation: 'Plumbing Apprentice', familyOccupation: 'Labour', currentIncomeRange: '< 50000' },
        skills: ['Pipe Fitting', 'Sanitary Work'],
        interests: ['Construction', 'Plumbing'],
        sectorKeyword: 'Plumbing',
        districtKeyword: 'Lucknow',
        status: 'IN_PROGRESS',
        attendancePercentage: 74,
        currentModule: 'GI & PVC Pipe Threading & Leak Testing',
      },
      {
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
        phone: '9811122205',
        district: 'Patna',
        state: 'Bihar',
        personal: { age: 22, gender: 'Male' },
        education: { level: 'Graduate', field: 'Commerce' },
        location: { state: 'Bihar', district: 'Patna', block: 'Patliputra', village: 'Danapur' },
        livelihood: { currentOccupation: 'Unemployed', familyOccupation: 'Retail', currentIncomeRange: '< 50000' },
        skills: ['Computer Basics', 'MS Office', 'Typing'],
        interests: ['IT-ITeS', 'Data Entry'],
        sectorKeyword: 'IT-ITeS',
        districtKeyword: 'Patna',
        status: 'ENROLLED',
        attendancePercentage: 15,
        currentModule: 'Orientation & Typing Speed Fundamentals',
      },
      {
        name: 'Meena Kumari',
        email: 'meena@example.com',
        phone: '9811122206',
        district: 'Muzaffarpur',
        state: 'Bihar',
        personal: { age: 31, gender: 'Female' },
        education: { level: '8th Pass', field: 'General' },
        location: { state: 'Bihar', district: 'Muzaffarpur', block: 'Kazi Mohammadpur', village: 'Marwan' },
        livelihood: { currentOccupation: 'Dairy Worker', familyOccupation: 'Livestock', currentIncomeRange: '< 50000' },
        skills: ['Cattle Care', 'Milking'],
        interests: ['Agriculture', 'Dairy'],
        sectorKeyword: 'Livestock',
        districtKeyword: 'Muzaffarpur',
        status: 'COMPLETED',
        attendancePercentage: 90,
        currentModule: 'Course Complete',
        outcome: { outcomeType: 'SELF_EMPLOYED', employerOrBusinessName: 'Meena Dairy Enterprise', monthlyIncome: 16500 },
      },
      {
        name: 'Karan Yadav',
        email: 'karan@example.com',
        phone: '9811122207',
        district: 'Jodhpur',
        state: 'Rajasthan',
        personal: { age: 25, gender: 'Male' },
        education: { level: '10th Pass', field: 'General' },
        location: { state: 'Rajasthan', district: 'Jodhpur', block: 'Industrial Area', village: 'Mandore' },
        livelihood: { currentOccupation: 'Helper', familyOccupation: 'Fabrication', currentIncomeRange: '< 50000' },
        skills: ['Hand Welding', 'Metal Cutting'],
        interests: ['Capital Goods', 'Welding'],
        sectorKeyword: 'Capital',
        districtKeyword: 'Jodhpur',
        status: 'DROPPED_OUT',
        attendancePercentage: 32,
        currentModule: 'Arc Welding Safety & Joint Prep',
        isAtRisk: true,
        riskLevel: 'HIGH',
        interventionReason: 'Attendance dropped below 35% due to long-distance commute issues',
      },
      {
        name: 'Priya Sahu',
        email: 'priya@example.com',
        phone: '9811122208',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
        personal: { age: 28, gender: 'Female' },
        education: { level: '8th Pass', field: 'General' },
        location: { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Fanda', village: 'Bairagarh' },
        livelihood: { currentOccupation: 'Artisan', familyOccupation: 'Weaving', currentIncomeRange: '< 50000' },
        skills: ['Zari Work', 'Needlework'],
        interests: ['Apparel', 'Handlooms'],
        sectorKeyword: 'Apparel',
        districtKeyword: 'Patna',
        status: 'IN_PROGRESS',
        attendancePercentage: 45,
        currentModule: 'Pattern Layout & Fabric Cutting',
        isAtRisk: true,
        riskLevel: 'MEDIUM',
        interventionReason: 'Low attendance flagged by automated system',
      },
      {
        name: 'Deepak Joshi',
        email: 'deepak@example.com',
        phone: '9811122209',
        district: 'Jaipur',
        state: 'Rajasthan',
        personal: { age: 26, gender: 'Male' },
        education: { level: '12th Pass', field: 'Agriculture' },
        location: { state: 'Rajasthan', district: 'Jaipur', block: 'Sanganer', village: 'Chokhi Dhani' },
        livelihood: { currentOccupation: 'Farmer', familyOccupation: 'Farming', currentIncomeRange: '50000-100000' },
        skills: ['Drip Fitting', 'Soil Testing'],
        interests: ['Agriculture', 'Irrigation'],
        sectorKeyword: 'Agriculture',
        districtKeyword: 'Jaipur',
        status: 'ENROLLED',
        attendancePercentage: 0,
        currentModule: 'Orientation',
      },
      {
        name: 'Aarti Gupta',
        email: 'aarti@example.com',
        phone: '9811122210',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        personal: { age: 22, gender: 'Female' },
        education: { level: 'Graduate', field: 'Arts' },
        location: { state: 'Uttar Pradesh', district: 'Varanasi', block: 'Vikas Nagar', village: 'Sigra' },
        livelihood: { currentOccupation: 'Trainee', familyOccupation: 'Trade', currentIncomeRange: '< 50000' },
        skills: ['Customer Relations', 'Facial Care'],
        interests: ['Beauty', 'Wellness'],
        sectorKeyword: 'Beauty',
        districtKeyword: 'Varanasi',
        status: 'IN_PROGRESS',
        attendancePercentage: 88,
        currentModule: 'Advanced Bridal & Skin Care Techniques',
      },
    ];

    for (const bData of demoBeneficiaries) {
      const user = await User.create({
        name: bData.name,
        email: bData.email,
        phone: bData.phone,
        passwordHash: 'Password123',
        role: 'BENEFICIARY',
        district: bData.district,
        state: bData.state,
      });

      const profile = await BeneficiaryProfile.create({
        userId: user._id,
        personal: bData.personal,
        education: bData.education,
        location: bData.location,
        livelihood: bData.livelihood,
        skills: bData.skills,
        interests: bData.interests,
        employmentPreference: 'SELF_EMPLOYMENT',
        preferredLanguage: 'Hindi',
        source: 'FORM',
        profileCompletion: 80,
      });

      const matchedCourse = findCourseBySector(bData.sectorKeyword);
      const matchedCenter = findCenterByDistrict(bData.districtKeyword);

      const enrollment = await TrainingEnrollment.create({
        beneficiaryId: profile._id,
        courseId: matchedCourse._id,
        centerId: matchedCenter._id,
        status: bData.status,
      });

      await TrainingProgress.create({
        enrollmentId: enrollment._id,
        attendancePercentage: bData.attendancePercentage,
        currentModule: bData.currentModule,
        notes: `Progress logged for ${bData.name}`,
      });

      if (bData.outcome) {
        await Outcome.create({
          beneficiaryId: profile._id,
          enrollmentId: enrollment._id,
          outcomeType: bData.outcome.outcomeType,
          employerOrBusinessName: bData.outcome.employerOrBusinessName,
          monthlyIncome: bData.outcome.monthlyIncome,
          dateAchieved: new Date(),
          verifiedBy: officer._id,
        });
      }

      if (bData.isAtRisk) {
        await Intervention.create({
          beneficiaryId: profile._id,
          raisedBy: officer._id,
          reason: bData.interventionReason,
          riskLevel: bData.riskLevel,
          status: 'OPEN',
        });
      }
    }

    console.log('\n================ DEMO SEED COMPLETE ================');
    console.log('✅ Created 10 Beneficiaries with profiles & enrollments');
    console.log('✅ Created Outcomes for completed enrollments');
    console.log('✅ Created 2 At-Risk Interventions for Officer Dashboard');
    console.log('=====================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Demo seed error:', err);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

seedDemoData();
