const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/livelihood_navigator',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_key_dev',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  AI_SERVICE_TIMEOUT_MS: Number(process.env.AI_SERVICE_TIMEOUT_MS || 8000),
  EMAIL_NOTIFICATIONS_ENABLED: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD || '',
  EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT || '',
};

module.exports = env;
