const mongoose = require('mongoose');
const env = require('../config/env');
const NSQFCourse = require('../models/NSQFCourse');
const TrainingCenter = require('../models/TrainingCenter');
const Opportunity = require('../models/Opportunity');

const coursesData = [
  {
    courseName: 'Self Employed Tailor',
    qualificationName: 'Self Employed Tailor - AMH/Q1947',
    nsqfLevel: 4,
    sector: 'Apparel & Handlooms',
    jobRoles: ['Tailor', 'Garment Assembler', 'Boutique Assistant'],
    requiredEducation: '8th Pass',
    requiredSkills: ['Basic Stitching', 'Hand Sewing'],
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
    acquiredSkills: ['Pipe Layout & Installation', 'Fixture Mounting', 'Leakage Repair', 'PVC/GI Fitting'],
    duration: '350 hours',
  },
  {
    courseName: 'Manual Arc Welder',
    qualificationName: 'Manual Arc Welder - CSC/Q0202',
    nsqfLevel: 4,
    sector: 'Capital Goods & Fabrication',
    jobRoles: ['Shielded Metal Arc Welder', 'Fabrication Assistant'],
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
    jobRoles: ['Beauty Therapist Assistant', 'Salon Assistant'],
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
    jobRoles: ['Drip Irrigation Installer', 'Farm Irrigation Supervisor'],
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
    requiredSkills: ['Cattle Care'],
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
    requiredSkills: ['Basic Computer Operations', 'English Alphabet Typing'],
    acquiredSkills: ['Fast Typing (30 wpm)', 'MS Office / Google Docs', 'Data Formatting', 'Internet Navigation'],
    duration: '400 hours',
  },
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected.');

    console.log('Clearing existing reference collections (NSQFCourse, TrainingCenter, Opportunity)...');
    await NSQFCourse.deleteMany({});
    await TrainingCenter.deleteMany({});
    await Opportunity.deleteMany({});

    console.log('Inserting NSQF Courses...');
    const insertedCourses = await NSQFCourse.insertMany(coursesData);
    console.log(`Inserted ${insertedCourses.length} courses.`);

    // Map course IDs by name helper
    const courseMap = {};
    insertedCourses.forEach((c) => {
      courseMap[c.courseName] = c._id;
    });

    console.log('Inserting Training Centers...');
    const centersData = [
      {
        name: 'Patna PM-AJAY Skill Training Hub',
        address: 'Plot 42, Industrial Area, Patliputra, Patna, Bihar - 800013',
        location: { type: 'Point', coordinates: [85.1376, 25.5941] },
        coursesOffered: [
          courseMap['Self Employed Tailor'],
          courseMap['Assistant Electrician'],
          courseMap['Domestic Data Entry Operator'],
        ],
        capacity: 120,
        contactInfo: { phone: '0612-2541098', email: 'patna.hub@pmajay.gov.in' },
      },
      {
        name: 'Muzaffarpur Vocational Development Center',
        address: 'Near Station Road, Kazi Mohammadpur, Muzaffarpur, Bihar - 842001',
        location: { type: 'Point', coordinates: [85.379, 26.1209] },
        coursesOffered: [
          courseMap['Plumber General'],
          courseMap['Manual Arc Welder'],
          courseMap['Micro Irrigation Technician'],
        ],
        capacity: 90,
        contactInfo: { phone: '0621-2248700', email: 'muzaffarpur.vdc@pmajay.gov.in' },
      },
      {
        name: 'Varanasi Kaushal Vikas Kendra',
        address: 'NH-2 Bypass, Chandpur Industrial Area, Varanasi, Uttar Pradesh - 221106',
        location: { type: 'Point', coordinates: [82.9739, 25.3176] },
        coursesOffered: [
          courseMap['Self Employed Tailor'],
          courseMap['Assistant Beauty Therapist'],
          courseMap['Domestic Data Entry Operator'],
        ],
        capacity: 150,
        contactInfo: { phone: '0542-2391002', email: 'varanasi.kvk@pmajay.gov.in' },
      },
      {
        name: 'Lucknow Livelihood Training Academy',
        address: 'Sector 5, Vikas Nagar, Lucknow, Uttar Pradesh - 226022',
        location: { type: 'Point', coordinates: [80.9462, 26.8467] },
        coursesOffered: [
          courseMap['Assistant Electrician'],
          courseMap['Plumber General'],
          courseMap['Manual Arc Welder'],
        ],
        capacity: 200,
        contactInfo: { phone: '0522-2765432', email: 'lucknow.academy@pmajay.gov.in' },
      },
      {
        name: 'Jaipur Rural Livelihood Excellence Center',
        address: 'Tonk Road, Sanganer, Jaipur, Rajasthan - 302029',
        location: { type: 'Point', coordinates: [75.7873, 26.9124] },
        coursesOffered: [
          courseMap['Micro Irrigation Technician'],
          courseMap['Dairy Farmer & Entrepreneur'],
          courseMap['Self Employed Tailor'],
        ],
        capacity: 100,
        contactInfo: { phone: '0141-2730999', email: 'jaipur.rlec@pmajay.gov.in' },
      },
      {
        name: 'Jodhpur Craft & Technical Institute',
        address: 'Heavy Industrial Area, Phase II, Jodhpur, Rajasthan - 342005',
        location: { type: 'Point', coordinates: [73.0243, 26.2389] },
        coursesOffered: [
          courseMap['Manual Arc Welder'],
          courseMap['Assistant Electrician'],
          courseMap['Assistant Beauty Therapist'],
        ],
        capacity: 110,
        contactInfo: { phone: '0291-2741122', email: 'jodhpur.cti@pmajay.gov.in' },
      },
    ];

    const insertedCenters = await TrainingCenter.insertMany(centersData);
    console.log(`Inserted ${insertedCenters.length} training centers.`);

    console.log('Inserting Opportunities...');
    const opportunitiesData = [
      {
        title: 'Apparel Factory Stitching Operator',
        type: 'WAGE_EMPLOYMENT',
        sector: 'Apparel & Handlooms',
        location: { type: 'Point', coordinates: [85.141, 25.6] },
        requiredSkills: ['Pattern Making', 'Machine Operation', 'Garment Finishing'],
        description: 'Monthly wage employment at Bihar Garments Manufacturing Unit, Patliputra.',
      },
      {
        title: 'Commercial Complex Maintenance Electrician',
        type: 'WAGE_EMPLOYMENT',
        sector: 'Electrical & Power',
        location: { type: 'Point', coordinates: [80.95, 26.85] },
        requiredSkills: ['House Wiring', 'Circuit Testing', 'Safety Compliance'],
        description: 'Full-time electrician role for facility management company in Lucknow.',
      },
      {
        title: 'Drip Irrigation Installation & Service Enterprise',
        type: 'SELF_EMPLOYMENT',
        sector: 'Agriculture',
        location: { type: 'Point', coordinates: [75.8, 26.9] },
        requiredSkills: ['Drip & Sprinkler Setup', 'Pump Maintenance'],
        description: 'PM-AJAY micro-grant supported self-employment model for farm irrigation setup in Jaipur region.',
      },
      {
        title: 'Dairy Cooperative Milk Collection Associate',
        type: 'WAGE_EMPLOYMENT',
        sector: 'Agriculture & Livestock',
        location: { type: 'Point', coordinates: [85.38, 26.125] },
        requiredSkills: ['Hygienic Milking', 'Milk Testing'],
        description: 'Assisting regional dairy cooperative in milk quality testing and collection around Muzaffarpur.',
      },
      {
        title: 'Home-based Beauty & Wellness Studio Owner',
        type: 'SELF_EMPLOYMENT',
        sector: 'Beauty & Wellness',
        location: { type: 'Point', coordinates: [82.98, 25.32] },
        requiredSkills: ['Skin Care Basics', 'Hair Care', 'Threading & Waxing'],
        description: 'Micro-entrepreneurship opportunity with toolkit assistance under PM-AJAY in Varanasi.',
      },
      {
        title: 'Common Service Center (CSC) Data Entry Assistant',
        type: 'WAGE_EMPLOYMENT',
        sector: 'IT-ITeS',
        location: { type: 'Point', coordinates: [73.03, 26.24] },
        requiredSkills: ['Fast Typing (30 wpm)', 'MS Office / Google Docs'],
        description: 'Data entry operator job at District e-Governance Service Center in Jodhpur.',
      },
    ];

    const insertedOpportunities = await Opportunity.insertMany(opportunitiesData);
    console.log(`Inserted ${insertedOpportunities.length} opportunities.`);

    console.log('\n================ SEED SUMMARY ================');
    console.log(`- NSQFCourse documents inserted:     ${insertedCourses.length}`);
    console.log(`- TrainingCenter documents inserted: ${insertedCenters.length}`);
    console.log(`- Opportunity documents inserted:    ${insertedOpportunities.length}`);
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
