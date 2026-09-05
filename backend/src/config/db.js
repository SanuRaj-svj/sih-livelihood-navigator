const mongoose = require('mongoose');
const env = require('./env');

const connectWithRetry = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully to:', env.MONGODB_URI.split('@')[1] || 'Cluster');
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.log('Retrying connection to MongoDB Atlas in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

module.exports = connectWithRetry;
