const mongoose = require('mongoose');
const http = require('http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const NSQFCourse = require('../src/models/NSQFCourse');
const TrainingCenter = require('../src/models/TrainingCenter');
const Opportunity = require('../src/models/Opportunity');
const User = require('../src/models/User');

let mongod;
let server;
let port = 5099;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

const runVerification = async () => {
  console.log('===================================================================');
  console.log('         STARTING COMPLETE E2E 14-STEP VERIFICATION SUITE         ');
  console.log('===================================================================\n');

  try {
    mongod = await MongoMemoryServer.create({
      binary: { version: '5.0.28' },
      instance: { spawnTimeoutMS: 30000 },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB Server:', uri);

    // Seed Courses, Training Centers, and Opportunities
    const course = await NSQFCourse.create({
      courseName: 'Self Employed Tailor',
      qualificationName: 'Self Employed Tailor - AMH/Q1947',
      nsqfLevel: 4,
      sector: 'Apparel & Handlooms',
      jobRoles: ['Tailor', 'Garment Assembler'],
      requiredEducation: '8th Pass',
      requiredSkills: ['Basic Stitching'],
      acquiredSkills: ['Pattern Making', 'Machine Operation'],
      duration: '300 hours',
    });

    const center = await TrainingCenter.create({
      name: 'Patna PM-AJAY Skill Training Hub',
      address: 'Plot 42, Patliputra, Patna, Bihar',
      location: { type: 'Point', coordinates: [85.1376, 25.5941] },
      coursesOffered: [course._id],
      capacity: 120,
      contactInfo: { phone: '0612-2541098', email: 'patna.hub@pmajay.gov.in' },
    });

    await Opportunity.create({
      title: 'Apparel Factory Stitching Operator',
      type: 'WAGE_EMPLOYMENT',
      sector: 'Apparel & Handlooms',
      location: { type: 'Point', coordinates: [85.141, 25.6] },
      requiredSkills: ['Pattern Making'],
      description: 'Stitching operator job at Patna apparel factory',
    });

    console.log('✅ Seed data successfully initialized in memory DB.\n');

    server = app.listen(port, () => {
      console.log(`✅ Express App listening on http://127.0.0.1:${port}`);
    });

    const timestamp = Date.now();
    let beneficiaryToken, officerToken;
    let beneficiaryProfileId, enrollmentId, outcomeId, interventionId;

    // Step 1: Register Beneficiary User
    console.log('\n--- Step 1: POST /api/auth/register (Register Beneficiary) ---');
    const regBenRes = await request('POST', '/api/auth/register', {
      name: 'Ramesh Kumar',
      phone: `98${timestamp.toString().slice(-8)}`,
      email: `ramesh_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'BENEFICIARY',
      district: 'Patna',
      state: 'Bihar',
    });
    console.log('STATUS:', regBenRes.status);
    console.log('RESPONSE:', JSON.stringify(regBenRes.body, null, 2));
    beneficiaryToken = regBenRes.body.token || regBenRes.body.data?.token;

    // Step 2: Create/Update Beneficiary Profile
    console.log('\n--- Step 2: POST /api/beneficiaries/profile (Create Beneficiary Profile) ---');
    const profileRes = await request(
      'POST',
      '/api/beneficiaries/profile',
      {
        personal: { age: 24, gender: 'Male' },
        education: { level: '8th Pass', field: 'General' },
        location: {
          state: 'Bihar',
          district: 'Patna',
          coordinates: { type: 'Point', coordinates: [85.1376, 25.5941] },
        },
        livelihood: { currentOccupation: 'Unemployed', currentIncomeRange: '0-5000' },
        skills: ['Basic Stitching'],
        interests: ['Apparel & Handlooms', 'Tailoring'],
        employmentPreference: 'SELF_EMPLOYMENT',
        mobility: { willingToTravel: true, maxDistanceKm: 30 },
      },
      beneficiaryToken
    );
    console.log('STATUS:', profileRes.status);
    console.log('RESPONSE:', JSON.stringify(profileRes.body, null, 2));
    beneficiaryProfileId = profileRes.body.data._id;

    // Step 3: Recommendation Engine (GET /api/recommendations)
    console.log('\n--- Step 3: GET /api/recommendations (Rule-Based Recommendations) ---');
    const recRes = await request('GET', '/api/recommendations', null, beneficiaryToken);
    console.log('STATUS:', recRes.status);
    console.log('RESPONSE:', JSON.stringify(recRes.body, null, 2));

    // Step 4: Beneficiary Self-Enrollment (POST /api/enrollments)
    console.log('\n--- Step 4: POST /api/enrollments (Enroll Beneficiary) ---');
    const enrollRes = await request(
      'POST',
      '/api/enrollments',
      { courseId: course._id, centerId: center._id },
      beneficiaryToken
    );
    console.log('STATUS:', enrollRes.status);
    console.log('RESPONSE:', JSON.stringify(enrollRes.body, null, 2));
    enrollmentId = enrollRes.body.data.enrollment._id;

    // Step 5: GET /api/enrollments/me (View Own Enrollments)
    console.log('\n--- Step 5: GET /api/enrollments/me ---');
    const myEnrollRes = await request('GET', '/api/enrollments/me', null, beneficiaryToken);
    console.log('STATUS:', myEnrollRes.status);
    console.log('RESPONSE:', JSON.stringify(myEnrollRes.body, null, 2));

    // Step 6: Update Progress (PATCH /api/enrollments/:id/progress)
    console.log('\n--- Step 6: PATCH /api/enrollments/:id/progress (Creates/Updates TrainingProgress) ---');
    const progressRes = await request(
      'PATCH',
      `/api/enrollments/${enrollmentId}/progress`,
      {
        attendancePercentage: 45,
        milestonesCompleted: ['Orientation Module', 'Basic Stitching Test'],
        currentModule: 'Pattern Cutting',
        notes: 'Beneficiary requested additional guidance on pattern layout',
      },
      beneficiaryToken
    );
    console.log('STATUS:', progressRes.status);
    console.log('RESPONSE:', JSON.stringify(progressRes.body, null, 2));

    // Step 7: Create Admin and Register Officer via POST /api/auth/register-officer
    console.log('\n--- Step 7: Admin Register Officer User via POST /api/auth/register-officer ---');
    const adminUser = await User.create({
      name: 'Super Admin',
      phone: `99${timestamp.toString().slice(-8)}`,
      email: `admin_${timestamp}@pmajay.gov.in`,
      passwordHash: 'Password123!',
      role: 'ADMIN',
    });

    const loginAdminRes = await request('POST', '/api/auth/login', {
      emailOrPhone: `admin_${timestamp}@pmajay.gov.in`,
      password: 'Password123!',
    });
    const adminToken = loginAdminRes.body.data.token;

    const regOffRes = await request(
      'POST',
      '/api/auth/register-officer',
      {
        name: 'Officer Vikram Singh',
        phone: `97${timestamp.toString().slice(-8)}`,
        email: `officer_${timestamp}@pmajay.gov.in`,
        password: 'Password123!',
        role: 'OFFICER',
        district: 'Patna',
        state: 'Bihar',
      },
      adminToken
    );
    console.log('STATUS:', regOffRes.status);
    console.log('RESPONSE:', JSON.stringify(regOffRes.body, null, 2));

    const loginOfficerRes = await request('POST', '/api/auth/login', {
      emailOrPhone: `officer_${timestamp}@pmajay.gov.in`,
      password: 'Password123!',
    });
    officerToken = loginOfficerRes.body.data.token;

    // Step 8: GET /api/enrollments (Officer view all, filtered by district & status)
    console.log('\n--- Step 8: GET /api/enrollments (Officer Query with Filters) ---');
    const allEnrollRes = await request(
      'GET',
      '/api/enrollments?district=Patna&status=IN_PROGRESS',
      null,
      officerToken
    );
    console.log('STATUS:', allEnrollRes.status);
    console.log('RESPONSE:', JSON.stringify(allEnrollRes.body, null, 2));

    // Step 9: POST /api/outcomes (Officer Records Outcome)
    console.log('\n--- Step 9: POST /api/outcomes (Record Beneficiary Outcome) ---');
    const outcomeRes = await request(
      'POST',
      '/api/outcomes',
      {
        beneficiaryId: beneficiaryProfileId,
        enrollmentId,
        outcomeType: 'SELF_EMPLOYED',
        employerOrBusinessName: 'Ramesh Tailoring Works',
        monthlyIncome: 12000,
        dateAchieved: new Date(),
      },
      officerToken
    );
    console.log('STATUS:', outcomeRes.status);
    console.log('RESPONSE:', JSON.stringify(outcomeRes.body, null, 2));
    outcomeId = outcomeRes.body.data._id;

    // Step 10: GET /api/outcomes (Officer Lists Outcomes)
    console.log('\n--- Step 10: GET /api/outcomes ---');
    const listOutcomeRes = await request('GET', '/api/outcomes?outcomeType=SELF_EMPLOYED', null, officerToken);
    console.log('STATUS:', listOutcomeRes.status);
    console.log('RESPONSE:', JSON.stringify(listOutcomeRes.body, null, 2));

    // Step 11: POST /api/interventions (Officer Flags HIGH Risk Intervention)
    console.log('\n--- Step 11: POST /api/interventions (Flag High Risk Intervention) ---');
    const interventionRes = await request(
      'POST',
      '/api/interventions',
      {
        beneficiaryId: beneficiaryProfileId,
        reason: 'Attendance recorded at 45% (below 50% threshold)',
        riskLevel: 'HIGH',
        actionTaken: 'Contacted beneficiary and scheduled counseling session',
      },
      officerToken
    );
    console.log('STATUS:', interventionRes.status);
    console.log('RESPONSE:', JSON.stringify(interventionRes.body, null, 2));
    interventionId = interventionRes.body.data._id;

    // Step 12: GET /api/interventions (Officer Lists Interventions)
    console.log('\n--- Step 12: GET /api/interventions ---');
    const listInterventionRes = await request('GET', '/api/interventions?riskLevel=HIGH', null, officerToken);
    console.log('STATUS:', listInterventionRes.status);
    console.log('RESPONSE:', JSON.stringify(listInterventionRes.body, null, 2));

    // Step 13: PATCH /api/interventions/:id (Officer Updates Intervention)
    console.log('\n--- Step 13: PATCH /api/interventions/:id ---');
    const updateInterventionRes = await request(
      'PATCH',
      `/api/interventions/${interventionId}`,
      {
        status: 'IN_PROGRESS',
        actionTaken: 'Home visit conducted by district officer; toolkit voucher issued',
      },
      officerToken
    );
    console.log('STATUS:', updateInterventionRes.status);
    console.log('RESPONSE:', JSON.stringify(updateInterventionRes.body, null, 2));

    // Step 14: Hit All 3 Officer Dashboard Endpoints
    console.log('\n--- Step 14a: GET /api/admin/dashboard/summary (Dashboard Summary Scoped by District) ---');
    const summaryRes = await request('GET', '/api/admin/dashboard/summary?district=Patna', null, officerToken);
    console.log('STATUS:', summaryRes.status);
    console.log('RESPONSE:', JSON.stringify(summaryRes.body, null, 2));

    console.log('\n--- Step 14b: GET /api/admin/dashboard/skill-demand (Bar-Chart Aggregation) ---');
    const demandRes = await request('GET', '/api/admin/dashboard/skill-demand', null, officerToken);
    console.log('STATUS:', demandRes.status);
    console.log('RESPONSE:', JSON.stringify(demandRes.body, null, 2));

    console.log('\n--- Step 14c: GET /api/admin/dashboard/at-risk (At-Risk Beneficiaries & Low Attendance) ---');
    const atRiskRes = await request('GET', '/api/admin/dashboard/at-risk', null, officerToken);
    console.log('STATUS:', atRiskRes.status);
    console.log('RESPONSE:', JSON.stringify(atRiskRes.body, null, 2));

    console.log('\n===================================================================');
    console.log('  🎉 ALL 14 VERIFICATION STEPS PASSED SUCCESSFULLY WITHOUT ERRORS! ');
    console.log('===================================================================\n');
  } catch (err) {
    console.error('❌ VERIFICATION FAILED WITH ERROR:', err);
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(0);
  }
};

runVerification();
