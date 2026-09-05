const mongoose = require('mongoose');

async function testConn() {
  try {
    console.log('Connecting to Atlas MongoDB...');
    await mongoose.connect('mongodb+srv://jainsarthak575_db_user:sH6EfDYO3ckNM2pR@cluster0.s1rlrnf.mongodb.net/livelihood_navigator', { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully to Atlas Mongo!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Atlas Mongo failed:', err.message);
  }
}

testConn();
