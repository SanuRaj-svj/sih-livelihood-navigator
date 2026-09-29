const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeVoiceCommand } = require('../src/controllers/ivrController');

test('voice interview recognizes repeat, skip, and confirmation commands', () => {
  assert.equal(normalizeVoiceCommand('repeat'), 'REPEAT');
  assert.equal(normalizeVoiceCommand('दोबारा'), 'REPEAT');
  assert.equal(normalizeVoiceCommand('skip'), 'SKIP');
  assert.equal(normalizeVoiceCommand('छोड़ें'), 'SKIP');
  assert.equal(normalizeVoiceCommand('yes'), 'YES');
  assert.equal(normalizeVoiceCommand('नहीं'), 'NO');
  assert.equal(normalizeVoiceCommand('I learned tailoring'), null);
});