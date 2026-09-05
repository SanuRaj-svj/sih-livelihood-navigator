const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

/**
 * CLI Script to Bootstrap Initial System Admin Account
 * Usage: node src/utils/seedAdmin.js [email] [phone] [password] [name]
 */
const bootstrapAdmin = async () => {
  try {
    const adminEmail = process.argv[2] || process.env.INITIAL_ADMIN_EMAIL || 'admin@pmajay.gov.in';
    const adminPhone = process.argv[3] || process.env.INITIAL_ADMIN_PHONE || '9999999999';
    const adminPassword = process.argv[4] || process.env.INITIAL_ADMIN_PASSWORD || 'Admin@PM-AJAY2026!';
    const adminName = process.argv[5] || process.env.INITIAL_ADMIN_NAME || 'System Master Admin';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log(`ℹ️ An Admin user already exists in DB: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      console.log('No new admin created.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create the initial admin account directly in DB
    const admin = await User.create({
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
    console.log(`- Email:    ${admin.email}`);
    console.log(`- Phone:    ${admin.phone}`);
    console.log(`- Role:     ${admin.role}`);
    console.log(`- User ID:  ${admin._id}`);
    console.log('===================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error bootstrapping admin:', error.message);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

bootstrapAdmin();
