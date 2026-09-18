const crypto = require('crypto');

const canonicalJson = (value) => JSON.stringify(value, Object.keys(value).sort());

const createRecordHash = (snapshot) => crypto
  .createHash('sha256')
  .update(canonicalJson(snapshot))
  .digest('hex');

const buildCertificateId = () => `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

module.exports = { createRecordHash, buildCertificateId };
