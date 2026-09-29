const test = require('node:test');
const assert = require('node:assert/strict');
const { getConversationGateReason } = require('../src/controllers/ivrController');

test('conversation is blocked until an authenticated beneficiary has certificate and identity verification', () => {
  assert.match(getConversationGateReason({ user: null, profile: null }), /Sign in and verify/i);
  assert.match(getConversationGateReason({ user: { _id: 'user-1' }, profile: null }), /Create your beneficiary profile/i);
  assert.match(getConversationGateReason({
    user: { _id: 'user-1' },
    profile: { verification: { scCertificateStatus: 'PENDING_REVIEW', scCertificateIdentityMatch: false } },
  }), /must be verified by an officer/i);
  assert.match(getConversationGateReason({
    user: { _id: 'user-1' },
    profile: { verification: { scCertificateStatus: 'VERIFIED', scCertificateIdentityMatch: false } },
  }), /must be verified by an officer/i);
  assert.equal(getConversationGateReason({
    user: { _id: 'user-1' },
    profile: { verification: { scCertificateStatus: 'VERIFIED', scCertificateIdentityMatch: true } },
  }), null);
});