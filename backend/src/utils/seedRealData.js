const mongoose = require('mongoose');
const env = require('../config/env');
const NSQFCourse = require('../models/NSQFCourse');
const TrainingCenter = require('../models/TrainingCenter');
const Opportunity = require('../models/Opportunity');

const realCoursesData = [
  {
    courseName: 'Self Employed Tailor',
    qualificationName: 'Self Employed Tailor - AMH/Q1947',
    nsqfLevel: 4,
    sector: 'Apparel & Handlooms',
    jobRoles: ['Tailor', 'Garment Assembler', 'Boutique Assistant'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Basic Stitching', 'Measuring', 'Pattern Reading'],
    acquiredSkills: ['Pattern Making', 'Machine Operation', 'Garment Finishing', 'Measurement & Fitting'],
    duration: '300 hours',
  },
  {
    courseName: 'Assistant Electrician',
    qualificationName: 'Assistant Electrician - ELE/Q0106',
    nsqfLevel: 3,
    sector: 'Electrical & Power',
    jobRoles: ['Assistant Electrician', 'Wiring Technician', 'Maintenance Helper'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Basic Literacy', 'Manual Dexterity'],
    acquiredSkills: ['House Wiring', 'Circuit Testing', 'Safety Compliance', 'Fault Diagnosis'],
    duration: '400 hours',
  },
  {
    courseName: 'Plumber General',
    qualificationName: 'Plumber General - PSC/Q0104',
    nsqfLevel: 4,
    sector: 'Plumbing & Construction',
    jobRoles: ['Plumber', 'Pipe Fitter', 'Maintenance Plumber'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Physical Fitness', 'Basic Math'],
    acquiredSkills: ['Pipe Layout', 'Fixture Mounting', 'Leakage Repair', 'PVC/GI Fitting'],
    duration: '350 hours',
  },
  {
    courseName: 'Manual Arc Welder',
    qualificationName: 'Manual Arc Welder - CSC/Q0202',
    nsqfLevel: 4,
    sector: 'Capital Goods & Fabrication',
    jobRoles: ['Welder', 'Fabrication Assistant', 'Fabrication Technician'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Hand-Eye Coordination', 'Physical Fitness'],
    acquiredSkills: ['SMAW Welding', 'Joint Preparation', 'Weld Defect Inspection', 'Safety Equipment Handling'],
    duration: '450 hours',
  },
  {
    courseName: 'Assistant Beauty Therapist',
    qualificationName: 'Assistant Beauty Therapist - BWS/Q0101',
    nsqfLevel: 3,
    sector: 'Beauty & Wellness',
    jobRoles: ['Beauty Therapist Assistant', 'Salon Assistant', 'Spa Assistant'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Hygiene Orientation', 'Communication'],
    acquiredSkills: ['Skin Care Basics', 'Hair Care', 'Threading & Waxing', 'Client Service Etiquette'],
    duration: '300 hours',
  },
  {
    courseName: 'Micro Irrigation Technician',
    qualificationName: 'Micro Irrigation Technician - AGR/Q1002',
    nsqfLevel: 4,
    sector: 'Agriculture',
    jobRoles: ['Drip Irrigation Installer', 'Farm Irrigation Supervisor', 'Irrigation Technician'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Farming Knowledge', 'Basic Tools Handling'],
    acquiredSkills: ['Drip & Sprinkler Setup', 'Pump Maintenance', 'Fertigation Basics', 'Soil Moisture Assessment'],
    duration: '300 hours',
  },
  {
    courseName: 'Dairy Farmer & Entrepreneur',
    qualificationName: 'Dairy Worker - AGR/Q4101',
    nsqfLevel: 4,
    sector: 'Agriculture & Livestock',
    jobRoles: ['Dairy Farm Assistant', 'Milk Collection Agent', 'Self Employed Dairy Farmer'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Cattle Care', 'Record Keeping'],
    acquiredSkills: ['Cattle Feed Management', 'Hygienic Milking', 'Milk Testing', 'Livestock Health Monitoring'],
    duration: '250 hours',
  },
  {
    courseName: 'Domestic Data Entry Operator',
    qualificationName: 'Domestic Data Entry Operator - SSC/Q2212',
    nsqfLevel: 4,
    sector: 'IT-ITeS',
    jobRoles: ['Data Entry Operator', 'Office Assistant', 'Front Desk Executive'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Basic Computer Operations', 'English Typing'],
    acquiredSkills: ['Fast Typing', 'MS Office', 'Data Formatting', 'Internet Navigation'],
    duration: '400 hours',
  },
  {
    courseName: 'Food Processing Assistant',
    qualificationName: 'Food Processing Assistant - FOP/Q0101',
    nsqfLevel: 3,
    sector: 'Food Processing',
    jobRoles: ['Food Processing Assistant', 'Packaging Operator', 'Quality Control Helper'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Basic Hygiene', 'Food Handling'],
    acquiredSkills: ['Value Addition', 'Packaging', 'Food Safety', 'Inventory Handling'],
    duration: '280 hours',
  },
  {
    courseName: 'Retail Sales Associate',
    qualificationName: 'Retail Sales Associate - RSL/Q0204',
    nsqfLevel: 3,
    sector: 'Retail & Services',
    jobRoles: ['Sales Associate', 'Customer Service Executive', 'Store Helper'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Communication', 'Basic Arithmetic'],
    acquiredSkills: ['Customer Service', 'Billing', 'Product Display', 'Stock Management'],
    duration: '240 hours',
  },
  {
    courseName: 'Masonry Assistant',
    qualificationName: 'Masonry Assistant - C&R/Q0501',
    nsqfLevel: 2,
    sector: 'Construction & Real Estate',
    jobRoles: ['Masonry Helper', 'Site Assistant', 'Concrete Worker'],
    requiredEducation: '5th Pass',
    requiredSkills: ['Physical Fitness', 'Basic Measurement'],
    acquiredSkills: ['Brick Laying', 'Material Mixing', 'Site Safety', 'Basic Finishing'],
    duration: '220 hours',
  },
  {
    courseName: 'Solar PV Installation Technician',
    qualificationName: 'Solar PV Installation Technician - EEE/Q1201',
    nsqfLevel: 4,
    sector: 'Renewable Energy',
    jobRoles: ['Solar Technician', 'Installation Assistant', 'Maintenance Technician'],
    requiredEducation: '10th Pass',
    requiredSkills: ['Basic Electrical Knowledge', 'Tool Handling'],
    acquiredSkills: ['Panel Mounting', 'Wiring & Connection', 'Safety Checks', 'Troubleshooting'],
    duration: '360 hours',
  },
];

const realCentersData = [
  {
    name: 'Bhopal Skill Development Centre',
    address: 'Plot 14, Arera Colony, Bhopal, Madhya Pradesh 462016',
    location: { type: 'Point', coordinates: [77.4010, 23.2599] },
    coursesOffered: [],
    capacity: 180,
    contactInfo: { phone: '0755-2451180', email: 'bhopal.sdc@skillhub.in' },
  },
  {
    name: 'Indore Vocational Training Institute',
    address: 'Industrial Area, Sanwer Road, Indore, Madhya Pradesh 452015',
    location: { type: 'Point', coordinates: [75.8577, 22.7196] },
    coursesOffered: [],
    capacity: 160,
    contactInfo: { phone: '0731-2870012', email: 'indore.vti@skillhub.in' },
  },
  {
    name: 'Patna PM-AJAY Skill Hub',
    address: 'Patliputra Industrial Area, Patna, Bihar 800013',
    location: { type: 'Point', coordinates: [85.1376, 25.5941] },
    coursesOffered: [],
    capacity: 220,
    contactInfo: { phone: '0612-2541098', email: 'patna.skillhub@skillhub.in' },
  },
  {
    name: 'Muzaffarpur Livelihood Training Centre',
    address: 'Station Road, Kazi Mohammadpur, Muzaffarpur, Bihar 842001',
    location: { type: 'Point', coordinates: [85.3790, 26.1209] },
    coursesOffered: [],
    capacity: 150,
    contactInfo: { phone: '0621-2248700', email: 'muzaffarpur.ltc@skillhub.in' },
  },
  {
    name: 'Varanasi Kaushal Vikas Kendra',
    address: 'NH-2 Bypass, Chandpur Industrial Area, Varanasi, Uttar Pradesh 221106',
    location: { type: 'Point', coordinates: [82.9739, 25.3176] },
    coursesOffered: [],
    capacity: 180,
    contactInfo: { phone: '0542-2391002', email: 'varanasi.kvk@skillhub.in' },
  },
  {
    name: 'Lucknow Skill and Employment Academy',
    address: 'Sector 5, Vikas Nagar, Lucknow, Uttar Pradesh 226022',
    location: { type: 'Point', coordinates: [80.9462, 26.8467] },
    coursesOffered: [],
    capacity: 210,
    contactInfo: { phone: '0522-2765432', email: 'lucknow.sea@skillhub.in' },
  },
  {
    name: 'Jaipur Rural Livelihood Excellence Center',
    address: 'Tonk Road, Sanganer, Jaipur, Rajasthan 302029',
    location: { type: 'Point', coordinates: [75.7873, 26.9124] },
    coursesOffered: [],
    capacity: 170,
    contactInfo: { phone: '0141-2730999', email: 'jaipur.rlec@skillhub.in' },
  },
  {
    name: 'Jodhpur Technical & Craft Institute',
    address: 'Heavy Industrial Area, Phase II, Jodhpur, Rajasthan 342005',
    location: { type: 'Point', coordinates: [73.0243, 26.2389] },
    coursesOffered: [],
    capacity: 140,
    contactInfo: { phone: '0291-2741122', email: 'jodhpur.tci@skillhub.in' },
  },
  {
    name: 'Ahmedabad Green Skills Centre',
    address: 'Naroda Industrial Estate, Ahmedabad, Gujarat 382330',
    location: { type: 'Point', coordinates: [72.6570, 23.0225] },
    coursesOffered: [],
    capacity: 180,
    contactInfo: { phone: '079-26546710', email: 'ahmedabad.gsc@skillhub.in' },
  },
];

const realOpportunityData = [
  {
    title: 'Apparel Factory Stitching Operator',
    type: 'WAGE_EMPLOYMENT',
    sector: 'Apparel & Handlooms',
    location: { type: 'Point', coordinates: [85.1410, 25.6000] },
    requiredSkills: ['Pattern Making', 'Machine Operation', 'Garment Finishing'],
    description: 'Factory-based stitching and finishing role in the apparel cluster near Patna.',
  },
  {
    title: 'Commercial Maintenance Electrician',
    type: 'WAGE_EMPLOYMENT',
    sector: 'Electrical & Power',
    location: { type: 'Point', coordinates: [80.9500, 26.8500] },
    requiredSkills: ['House Wiring', 'Circuit Testing', 'Safety Compliance'],
    description: 'Installation and maintenance support role in commercial facilities in Lucknow.',
  },
  {
    title: 'Irrigation Setup & Service Enterprise',
    type: 'SELF_EMPLOYMENT',
    sector: 'Agriculture',
    location: { type: 'Point', coordinates: [75.8000, 26.9000] },
    requiredSkills: ['Drip & Sprinkler Setup', 'Pump Maintenance'],
    description: 'Micro-enterprise opportunity for farming households in the Jaipur region.',
  },
  {
    title: 'Dairy Cooperative Milk Collection Associate',
    type: 'WAGE_EMPLOYMENT',
    sector: 'Agriculture & Livestock',
    location: { type: 'Point', coordinates: [85.3800, 26.1250] },
    requiredSkills: ['Hygienic Milking', 'Milk Testing'],
    description: 'Milk quality testing and collection support role in Muzaffarpur.',
  },
  {
    title: 'Retail Store Sales Associate',
    type: 'WAGE_EMPLOYMENT',
    sector: 'Retail & Services',
    location: { type: 'Point', coordinates: [77.4100, 23.2500] },
    requiredSkills: ['Customer Service', 'Billing', 'Stock Management'],
    description: 'Customer-facing sales and service role in a local retail chain.',
  },
  {
    title: 'Solar Technician for Rural Energy Services',
    type: 'SELF_EMPLOYMENT',
    sector: 'Renewable Energy',
    location: { type: 'Point', coordinates: [72.6570, 23.0225] },
    requiredSkills: ['Panel Mounting', 'Wiring & Connection', 'Troubleshooting'],
    description: 'Local solar installation and service micro-business opportunity in Gujarat.',
  },
];

const seedRealData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected.');

    await NSQFCourse.deleteMany({});
    await TrainingCenter.deleteMany({});
    await Opportunity.deleteMany({});

    const insertedCourses = await NSQFCourse.insertMany(realCoursesData);
    console.log(`Inserted ${insertedCourses.length} real NSQF course records.`);

    const courseMap = {};
    insertedCourses.forEach((course) => {
      courseMap[course.courseName] = course._id;
    });

    const centersWithCourses = realCentersData.map((center) => {
      const centerCourseMappings = {
        'Bhopal Skill Development Centre': ['Self Employed Tailor', 'Assistant Electrician', 'Domestic Data Entry Operator'],
        'Indore Vocational Training Institute': ['Assistant Electrician', 'Solar PV Installation Technician', 'Retail Sales Associate'],
        'Patna PM-AJAY Skill Hub': ['Self Employed Tailor', 'Food Processing Assistant', 'Domestic Data Entry Operator'],
        'Muzaffarpur Livelihood Training Centre': ['Micro Irrigation Technician', 'Dairy Farmer & Entrepreneur', 'Masonry Assistant'],
        'Varanasi Kaushal Vikas Kendra': ['Assistant Beauty Therapist', 'Self Employed Tailor', 'Retail Sales Associate'],
        'Lucknow Skill and Employment Academy': ['Plumber General', 'Manual Arc Welder', 'Solar PV Installation Technician'],
        'Jaipur Rural Livelihood Excellence Center': ['Micro Irrigation Technician', 'Dairy Farmer & Entrepreneur', 'Self Employed Tailor'],
        'Jodhpur Technical & Craft Institute': ['Manual Arc Welder', 'Assistant Electrician', 'Assistant Beauty Therapist'],
        'Ahmedabad Green Skills Centre': ['Solar PV Installation Technician', 'Retail Sales Associate', 'Food Processing Assistant'],
      };

      return {
        ...center,
        coursesOffered: (centerCourseMappings[center.name] || []).map((courseName) => courseMap[courseName]).filter(Boolean),
      };
    });

    const insertedCenters = await TrainingCenter.insertMany(centersWithCourses);
    console.log(`Inserted ${insertedCenters.length} real training centre records.`);

    const insertedOpportunities = await Opportunity.insertMany(realOpportunityData);
    console.log(`Inserted ${insertedOpportunities.length} real opportunity records.`);

    console.log('\n================ REAL DATA SUMMARY ================');
    console.log(`- NSQF courses: ${insertedCourses.length}`);
    console.log(`- Training centers: ${insertedCenters.length}`);
    console.log(`- Opportunities: ${insertedOpportunities.length}`);
    console.log('===============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed real data:', error);
    process.exit(1);
  }
};

seedRealData();
