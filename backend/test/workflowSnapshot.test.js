const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildWorkflowSnapshot,
  canonicalVoiceProfileToPersistenceShape,
} = require('../src/services/livelihoodWorkflowService');

test('buildWorkflowSnapshot connects skills, gaps, opportunities, and roadmap', () => {
  const snapshot = buildWorkflowSnapshot({
    profile: {
      skills: ['tailoring'],
      traditionalSkills: ['embroidery'],
      interests: ['fashion'],
      aspirations: ['home enterprise'],
      physicalConstraints: ['back pain'],
      mobility: { willingToTravel: false, maxDistanceKm: 0 },
      employmentPreference: 'SELF_EMPLOYMENT',
      location: { state: 'Bihar', district: 'Patna' },
    },
    assessment: {
      recommendations: [
        { type: 'COURSE', details: { sector: 'Apparel', skillGaps: ['digital marketing'], roadmap: [{ title: 'Complete training' }] } },
        { type: 'OPPORTUNITY', details: { pathwayType: 'SELF_EMPLOYMENT' } },
      ],
    },
  });

  assert.deepEqual(snapshot.skillEngine.current, ['tailoring', 'embroidery']);
  assert.deepEqual(snapshot.skillGapEngine.nsqf, ['digital marketing']);
  assert.equal(snapshot.opportunityMatcher.training.length, 1);
  assert.equal(snapshot.opportunityMatcher.enterprise.length, 1);
  assert.equal(snapshot.roadmap.steps.length, 1);
  assert.equal(snapshot.communityIntelligence.district, 'Patna');
});

test('canonical voice profile maps safely to existing Mongo profile enums', () => {
  const mapped = canonicalVoiceProfileToPersistenceShape({
    gender: 'UNKNOWN',
    education_level: 'higher_secondary_12th',
    employment_preference: 'self_employment',
    traditional_skills: ['weaving'],
  });

  assert.equal(mapped.personal.gender, undefined);
  assert.equal(mapped.education.level, '12th Pass');
  assert.equal(mapped.employmentPreference, 'SELF_EMPLOYMENT');
  assert.deepEqual(mapped.traditionalSkills, ['weaving']);
});