const test = require('node:test');
const assert = require('node:assert/strict');
const { opportunityOutcomeType } = require('../src/controllers/opportunityApplicationController');

test('hired opportunities map to the existing verified outcome categories', () => {
  assert.equal(opportunityOutcomeType('SELF_EMPLOYMENT'), 'SELF_EMPLOYED');
  assert.equal(opportunityOutcomeType('WAGE_EMPLOYMENT'), 'WAGE_EMPLOYED');
});