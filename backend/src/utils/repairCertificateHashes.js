const mongoose = require('mongoose');
const env = require('../config/env');
const TrainingCertificate = require('../models/TrainingCertificate');
const { createRecordHash } = require('../services/blockchainProofService');

const repairCertificateHashes = async () => {
  await mongoose.connect(env.MONGODB_URI);

  try {
    const certificates = await TrainingCertificate.find().select('_id certificateId recordSnapshot recordHash').lean();
    let repaired = 0;

    for (const certificate of certificates) {
      const recordHash = createRecordHash(certificate.recordSnapshot);
      if (recordHash === certificate.recordHash) continue;

      await TrainingCertificate.updateOne(
        { _id: certificate._id },
        { $set: { recordHash } },
      );
      repaired += 1;
      console.log(`Repaired ${certificate.certificateId}`);
    }

    console.log(`Certificate hash repair complete: ${repaired} of ${certificates.length} updated.`);
  } finally {
    await mongoose.connection.close();
  }
};

repairCertificateHashes().catch((error) => {
  console.error(`Certificate hash repair failed: ${error.message}`);
  process.exitCode = 1;
});
