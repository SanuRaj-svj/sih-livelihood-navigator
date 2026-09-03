const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/livelihood_navigator',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_key_dev',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
};

module.exports = env;
