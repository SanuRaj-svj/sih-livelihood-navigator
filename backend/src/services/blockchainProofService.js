const crypto = require('crypto');

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalize(value[key]);
        return result;
      }, {});
  }
  return value;
};

const canonicalJson = (value) => JSON.stringify(canonicalize(value));

const createRecordHash = (snapshot) => crypto
  .createHash('sha256')
  .update(canonicalJson(snapshot))
  .digest('hex');

const buildCertificateId = () => `CERT-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

module.exports = { createRecordHash, buildCertificateId };
