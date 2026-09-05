const mongoose = require('mongoose');
const http = require('http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongod;
let server;
let port = 5097;

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

const testAdminBootstrapAndLogin = async () => {
  console.log('===================================================================');
  console.log('       ADMIN BOOTSTRAP SCRIPT & LOGIN VERIFICATION SUITE          ');
  console.log('===================================================================\n');

  try {
    mongod = await MongoMemoryServer.create({
      binary: { version: '5.0.28' },
      instance: { spawnTimeoutMS: 30000 },
    });
    const mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);

    console.log('--- STEP 1: Execute Bootstrap Admin Logic ---');
    const adminEmail = 'admin.master@pmajay.gov.in';
    const adminPhone = '9876543210';
    const adminPassword = 'AdminSecurePass123!';
    const adminName = 'Master System Administrator';

    // Simulate seedAdmin logic directly against the connected DB instance
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (!existingAdmin) {
      const adminUser = await User.create({
        name: adminName,
        phone: adminPhone,
        email: adminEmail.toLowerCase(),
        passwordHash: adminPassword,
        role: 'ADMIN',
        district: 'Central',
        state: 'Delhi',
        isActive: true,
      });

      console.log('===================================================');
      console.log('🎉 INITIAL MASTER ADMIN BOOTSTRAPPED SUCCESSFULLY!');
      console.log('---------------------------------------------------');
      console.log(`- Email:    ${adminUser.email}`);
      console.log(`- Phone:    ${adminUser.phone}`);
      console.log(`- Role:     ${adminUser.role}`);
      console.log(`- User ID:  ${adminUser._id}`);
      console.log('===================================================\n');
    }

    server = app.listen(port);
    console.log(`✅ Express server listening on http://127.0.0.1:${port}`);

    // STEP 2: Log in via POST /api/auth/login as bootstrapped Admin
    console.log('\n--- STEP 2: HTTP POST /api/auth/login as Bootstrapped Admin ---');
    const loginRes = await request('POST', '/api/auth/login', {
      emailOrPhone: adminEmail,
      password: adminPassword,
    });

    console.log('HTTP Status Code:', loginRes.status);
    console.log('Response Payload:', JSON.stringify(loginRes.body, null, 2));

    if (
      loginRes.status === 200 &&
      loginRes.body.success === true &&
      loginRes.body.data.role === 'ADMIN' &&
      loginRes.body.data.token
    ) {
      console.log('\n✅ VERIFICATION SUCCESSFUL!');
      console.log(`- Logged-in User Email: ${loginRes.body.data.email}`);
      console.log(`- Verified Role in Token/Response: ${loginRes.body.data.role}`);
      console.log(`- Valid JWT Token Received: ${loginRes.body.data.token.slice(0, 35)}...`);
    } else {
      console.error('❌ VERIFICATION FAILED!');
    }

    console.log('\n===================================================================');
    console.log('  🎉 ADMIN BOOTSTRAP & AUTH LOGIN TEST COMPLETE!                    ');
    console.log('===================================================================\n');
  } catch (err) {
    console.error('❌ TEST ERROR:', err);
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(0);
  }
};

testAdminBootstrapAndLogin();
