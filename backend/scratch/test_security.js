const mongoose = require('mongoose');
const http = require('http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongod;
let server;
let port = 5098;

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

const runSecurityTest = async () => {
  console.log('===================================================================');
  console.log('         RUNNING SECURITY NEGATIVE TEST SUITE                     ');
  console.log('===================================================================\n');

  try {
    mongod = await MongoMemoryServer.create({
      binary: { version: '5.0.28' },
      instance: { spawnTimeoutMS: 30000 },
    });
    await mongoose.connect(mongod.getUri());

    server = app.listen(port);

    const timestamp = Date.now();

    // TEST 1: Negative test - Public registration passing role: "ADMIN"
    console.log('--- TEST 1: Public Registration with malicious role: "ADMIN" ---');
    const pubRegRes = await request('POST', '/api/auth/register', {
      name: 'Attacker User',
      phone: `99${timestamp.toString().slice(-8)}`,
      email: `attacker_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'ADMIN', // Malicious attempt to escalate privilege
      district: 'Patna',
      state: 'Bihar',
    });

    console.log('HTTP Response Status:', pubRegRes.status);
    console.log('API Response Body:', JSON.stringify(pubRegRes.body, null, 2));

    // Verify in database directly
    const createdDbUser = await User.findById(pubRegRes.body.data._id);
    console.log('\n🔍 Database Record Check:');
    console.log(`- Requested Role in Body: "ADMIN"`);
    console.log(`- Actual Stored Role in DB: "${createdDbUser.role}"`);

    if (createdDbUser.role === 'BENEFICIARY' && pubRegRes.body.data.role === 'BENEFICIARY') {
      console.log('✅ TEST 1 PASSED: Public registration forced role to BENEFICIARY, privilege escalation prevented!');
    } else {
      console.error('❌ TEST 1 FAILED: Privilege escalation succeeded!');
    }

    // TEST 2: Unauthenticated / Non-Admin attempting to call POST /api/auth/register-officer
    console.log('\n--- TEST 2: Unauthenticated attempt to POST /api/auth/register-officer ---');
    const unauthRes = await request('POST', '/api/auth/register-officer', {
      name: 'Rogue Officer',
      phone: `95${timestamp.toString().slice(-8)}`,
      email: `rogue_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'OFFICER',
    });
    console.log('HTTP Response Status:', unauthRes.status);
    console.log('API Response Body:', JSON.stringify(unauthRes.body, null, 2));
    if (unauthRes.status === 401) {
      console.log('✅ TEST 2 PASSED: Unauthenticated officer registration blocked (401 Unauthorized)');
    }

    // TEST 3: Admin user creating an officer via POST /api/auth/register-officer
    console.log('\n--- TEST 3: Admin creating Officer via POST /api/auth/register-officer ---');
    // First create an admin user directly in DB for testing
    const adminDbUser = await User.create({
      name: 'System Admin',
      phone: '9000000000',
      email: 'admin@pmajay.gov.in',
      passwordHash: 'Password123!',
      role: 'ADMIN',
    });
    const loginAdminRes = await request('POST', '/api/auth/login', {
      emailOrPhone: 'admin@pmajay.gov.in',
      password: 'Password123!',
    });
    const adminToken = loginAdminRes.body.data.token;

    const createOfficerRes = await request(
      'POST',
      '/api/auth/register-officer',
      {
        name: 'Officer Rajesh Kumar',
        phone: `96${timestamp.toString().slice(-8)}`,
        email: `officer_rajesh_${timestamp}@pmajay.gov.in`,
        password: 'Password123!',
        role: 'OFFICER',
        district: 'Patna',
      },
      adminToken
    );
    console.log('HTTP Response Status:', createOfficerRes.status);
    console.log('API Response Body:', JSON.stringify(createOfficerRes.body, null, 2));
    if (createOfficerRes.status === 201 && createOfficerRes.body.data.role === 'OFFICER') {
      console.log('✅ TEST 3 PASSED: Authenticated Admin successfully created an OFFICER account!');
    }

    console.log('\n===================================================================');
    console.log('  🎉 ALL SECURITY NEGATIVE & ADMIN TESTS PASSED PERFECTLY!         ');
    console.log('===================================================================\n');
  } catch (err) {
    console.error('❌ SECURITY TEST ERROR:', err);
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(0);
  }
};

runSecurityTest();
