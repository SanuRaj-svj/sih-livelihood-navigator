const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCertificateEmailContent } = require('../src/services/emailNotificationService');

test('certificate email builder includes certificate ID, stage, and PDF attachment info', () => {
  const message = buildCertificateEmailContent({
    beneficiaryName: 'Asha Kumari',
    courseName: 'Retail Sales Associate',
    centerName: 'Bhopal Skills Center',
    certificate: {
      certificateId: 'CERT-ABC123XYZ',
      stage: 'ENROLLMENT',
    },
  });

  assert.match(message.subject, /CERT-ABC123XYZ/);
  assert.match(message.text, /Enrollment Certificate/i);
  assert.match(message.text, /Retail Sales Associate/);
  assert.match(message.text, /certificate ID/i);
  assert.equal(message.attachments[0].filename, 'CERT-ABC123XYZ.pdf');
});
