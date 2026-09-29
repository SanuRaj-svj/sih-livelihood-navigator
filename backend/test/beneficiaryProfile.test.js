const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateProfileCompletion,
  getProfileDocumentGateError,
  missingProfileFields,
} = require('../src/controllers/beneficiaryController');

test('profile completion is based on distinct livelihood fields rather than broad sections', () => {
  assert.equal(calculateProfileCompletion({}), 0);

  const profile = {
    personal: { age: 26, gender: 'Female' },
    education: { level: '12th Pass' },
    location: { state: 'Bihar', district: 'Patna' },
    livelihood: { currentOccupation: 'Tailor' },
    skills: ['Tailoring'],
    interests: ['Apparel'],
    aspirations: ['Open a tailoring business'],
    employmentPreference: 'SELF_EMPLOYMENT',
  };
  assert.equal(calculateProfileCompletion(profile), 100);
  assert.equal(calculateProfileCompletion({ ...profile, aspirations: [] }), 90);
});

test('beneficiary profile gate requires officer verification and identity match', () => {
  assert.match(getProfileDocumentGateError(), /Upload your SC certificate/);
  assert.match(getProfileDocumentGateError({ scCertificateStatus: 'PENDING_REVIEW' }), /awaiting officer verification/);
  assert.match(getProfileDocumentGateError({ scCertificateStatus: 'REJECTED' }), /was rejected/);
  assert.match(getProfileDocumentGateError({ scCertificateStatus: 'VERIFIED', scCertificateIdentityMatch: false }), /identity matches/);
  assert.equal(getProfileDocumentGateError({ scCertificateStatus: 'VERIFIED', scCertificateIdentityMatch: true }), null);
});

test('missing profile field report names the exact livelihood details to complete', () => {
  const missing = missingProfileFields({ personal: { age: 30 }, location: { state: 'Bihar' } });
  assert.ok(missing.some((field) => field.field === 'personal.gender' && field.label === 'Gender'));
  assert.ok(missing.some((field) => field.field === 'location.district' && field.label === 'District'));
  assert.ok(missing.some((field) => field.field === 'skills' && field.label === 'Skills'));
});