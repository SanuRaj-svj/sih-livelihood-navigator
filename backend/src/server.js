const mongoose = require('mongoose');
const app = require('./app');
const connectWithRetry = require('./config/db');
const env = require('./config/env');
const { syncSkillIndiaCenters } = require('./utils/seedSkillIndiaCenters');
const { ensureGovernmentSchemes } = require('./utils/seedGovernmentSchemes');
const TrainingCertificate = require('./models/TrainingCertificate');

const PORT = env.PORT;

const startServer = async () => {
  await connectWithRetry();
  try {
    await TrainingCertificate.collection.dropIndex('enrollmentId_1');
    console.log('Removed legacy certificate enrollment index.');
  } catch (error) {
    if (error.codeName !== 'IndexNotFound') {
      console.error('Certificate index migration warning:', error.message);
    }
  }
  await TrainingCertificate.syncIndexes();
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
  });

  ensureGovernmentSchemes().catch((error) => {
    console.error('Government scheme baseline initialization failed:', error.message);
  });

  const syncCenters = () => syncSkillIndiaCenters().catch((error) => {
    console.error('Skill India centre sync failed; keeping existing centre data:', error.message);
  });
  syncCenters();
  const centerSyncTimer = setInterval(syncCenters, env.SKILL_INDIA_CENTER_SYNC_INTERVAL_MS);
  centerSyncTimer.unref();

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing HTTP and MongoDB connections...`);
    clearInterval(centerSyncTimer);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('❌ Failed to start backend:', error.message);
  process.exit(1);
});
