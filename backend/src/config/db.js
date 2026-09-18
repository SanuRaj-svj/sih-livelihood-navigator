const mongoose = require('mongoose');
const env = require('./env');

const connectWithRetry = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
    });
    console.log('✅ MongoDB Atlas connected successfully to:', env.MONGODB_URI.split('@')[1] || 'Cluster');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
    console.log('Retrying connection to MongoDB Atlas in 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectWithRetry();
  }
};

module.exports = connectWithRetry;
