const mongoose = require('mongoose');
const env = require('../config/env');
const GovernmentScheme = require('../models/GovernmentScheme');

const governmentSchemes = [
  {
    schemeCode: 'PM-AJAY',
    name: 'Pradhan Mantri Anusuchit Jaati Abhyuday Yojana',
    ministry: 'Ministry of Social Justice and Empowerment',
    description: 'Government programme supporting socio-economic development of Scheduled Caste communities through village development, grants, and hostels.',
    beneficiaryGroups: ['Scheduled Caste communities', 'SC students', 'SC-dominated villages'],
    eligibility: ['Eligibility depends on the relevant PM-AJAY component and current government guidelines.', 'Beneficiary community and project conditions must be verified before approval.'],
    benefits: ['Village development support', 'Grants-in-aid for eligible projects', 'Hostel support through eligible institutions'],
    sectors: ['Agriculture', 'Education', 'Livelihoods', 'Infrastructure'],
    applicationUrl: 'https://pmajay.dosje.gov.in/',
    sourceUrl: 'https://socialjustice.gov.in/schemes/36',
  },
  {
    schemeCode: 'PMKVY',
    name: 'Pradhan Mantri Kaushal Vikas Yojana',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    description: 'National skill-training programme providing access to industry-relevant training and certification through approved channels.',
    beneficiaryGroups: ['Indian citizens seeking skill training', 'Youth and job seekers'],
    eligibility: ['Eligibility depends on the selected course, training centre, and current programme guidelines.'],
    benefits: ['Skill training', 'Assessment and certification', 'Recognition of prior learning where available'],
    sectors: ['Skill Training', 'Employment'],
    applicationUrl: 'https://www.skillindiadigital.gov.in/',
    sourceUrl: 'https://www.msde.gov.in/en/schemes-initiatives/schemes/pmkvy',
  },
  {
    schemeCode: 'PM-VISHWAKARMA',
    name: 'PM Vishwakarma',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    description: 'Support programme for traditional artisans and craftspeople working with their hands and tools.',
    beneficiaryGroups: ['Traditional artisans', 'Craftspeople'],
    eligibility: ['Applicant must belong to an eligible traditional trade listed in the current scheme guidelines.', 'Registration and verification are required.'],
    benefits: ['Skill training', 'Toolkit incentive', 'Credit support', 'Digital transaction incentive', 'Marketing support'],
    sectors: ['Handicrafts', 'Artisan Trades', 'Micro-Enterprise'],
    applicationUrl: 'https://pmvishwakarma.gov.in/',
    sourceUrl: 'https://msme.gov.in/1-pm-vishwakarma-scheme',
  },
  {
    schemeCode: 'PM-SVANIDHI',
    name: 'PM Street Vendor\'s AtmaNirbhar Nidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    description: 'Working-capital support programme for eligible street vendors to restart and grow their businesses.',
    beneficiaryGroups: ['Street vendors', 'Urban micro-entrepreneurs'],
    eligibility: ['Vendor status and eligibility must be verified through the local urban authority or scheme process.'],
    benefits: ['Working-capital loan facility', 'Digital transaction incentives', 'Repayment-linked incentives under current guidelines'],
    sectors: ['Street Vending', 'Retail', 'Micro-Enterprise'],
    applicationUrl: 'https://pmsvanidhi.mohua.gov.in/',
    sourceUrl: 'https://mohua.gov.in/cms/pm-svanidhi.php',
  },
  {
    schemeCode: 'MUDRA',
    name: 'Pradhan Mantri MUDRA Yojana',
    ministry: 'Department of Financial Services, Ministry of Finance',
    description: 'Credit programme supporting micro enterprises through participating lenders and eligible loan products.',
    beneficiaryGroups: ['Micro-enterprises', 'Small business owners', 'Entrepreneurs'],
    eligibility: ['Loan eligibility, amount, and terms are decided by the participating lender after assessment.'],
    benefits: ['Institutional credit for eligible micro enterprises', 'Business expansion and working-capital support'],
    sectors: ['Manufacturing', 'Trading', 'Services', 'Agriculture-allied Activities'],
    applicationUrl: 'https://www.mudra.org.in/',
    sourceUrl: 'https://www.financialservices.gov.in/beta/en/mudra',
  },
  {
    schemeCode: 'NAPS',
    name: 'National Apprenticeship Promotion Scheme',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    description: 'Apprenticeship promotion programme connecting eligible apprentices and establishments under applicable rules.',
    beneficiaryGroups: ['Apprentices', 'Employers', 'Training establishments'],
    eligibility: ['Eligibility depends on apprenticeship trade, age, qualification, and establishment requirements.'],
    benefits: ['Apprenticeship opportunities', 'On-the-job training', 'Government support as applicable under current guidelines'],
    sectors: ['Apprenticeship', 'Manufacturing', 'Services'],
    applicationUrl: 'https://www.apprenticeshipindia.gov.in/',
    sourceUrl: 'https://www.msde.gov.in/en/schemes-initiatives/schemes/naps',
  },
  {
    schemeCode: 'STAND-UP-INDIA',
    name: 'Stand-Up India',
    ministry: 'Department of Financial Services, Ministry of Finance',
    description: 'Bank-loan facilitation programme for eligible SC/ST and women entrepreneurs starting greenfield enterprises.',
    beneficiaryGroups: ['Scheduled Caste entrepreneurs', 'Scheduled Tribe entrepreneurs', 'Women entrepreneurs'],
    eligibility: ['Applicant and enterprise must satisfy the current scheme and lender requirements.', 'Enterprise must be a greenfield project under applicable guidelines.'],
    benefits: ['Composite loan support through participating banks', 'Handholding and credit facilitation'],
    sectors: ['Manufacturing', 'Services', 'Trading', 'Agriculture-allied Activities'],
    applicationUrl: 'https://www.standupmitra.in/',
    sourceUrl: 'https://www.financialservices.gov.in/beta/en/stand-up-india-scheme',
  },
  {
    schemeCode: 'SKILL-INDIA-DIGITAL',
    name: 'Skill India Digital Hub',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    description: 'Digital platform for discovering skill courses, training centres, jobs, and related skilling services.',
    beneficiaryGroups: ['Learners', 'Job seekers', 'Training providers', 'Employers'],
    eligibility: ['Requirements vary by course, centre, job, or service selected on the platform.'],
    benefits: ['Course discovery', 'Training-centre discovery', 'Skill and employment services'],
    sectors: ['Skill Training', 'Employment'],
    applicationUrl: 'https://www.skillindiadigital.gov.in/',
    sourceUrl: 'https://www.skillindiadigital.gov.in/',
  },
];

const ensureGovernmentSchemes = async () => {
  const count = await GovernmentScheme.countDocuments();
  if (count > 0) return count;
  const inserted = await GovernmentScheme.insertMany(governmentSchemes);
  console.log(`Inserted ${inserted.length} government schemes.`);
  return inserted.length;
};

const seedGovernmentSchemes = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await GovernmentScheme.deleteMany({});
    await ensureGovernmentSchemes();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed government schemes:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};


if (require.main === module) seedGovernmentSchemes();

module.exports = { ensureGovernmentSchemes };
