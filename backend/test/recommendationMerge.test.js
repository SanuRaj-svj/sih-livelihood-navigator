const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeRecommendationSets } = require('../src/controllers/recommendationController');

test('mergeRecommendationSets preserves opportunity recommendations from fallback data', () => {
  const aiRecommendations = [
    {
      type: 'COURSE',
      id: 'course-1',
      score: 0.95,
      details: { courseName: 'Assistant Beauty Therapist' },
    },
  ];

  const fallbackRecommendations = [
    {
      type: 'OPPORTUNITY',
      id: 'opp-1',
      score: 0.82,
      details: { title: 'Home-based Beauty & Wellness Studio Owner' },
    },
    {
      type: 'CENTER',
      id: 'center-1',
      score: 0.76,
      details: { name: 'Patna PM-AJAY Skill Hub' },
    },
  ];

  const merged = mergeRecommendationSets(aiRecommendations, fallbackRecommendations);

  assert.ok(merged.some((item) => item.type === 'OPPORTUNITY'));
  assert.ok(merged.some((item) => item.type === 'CENTER'));
  assert.equal(merged[0].type, 'COURSE');
  assert.ok(merged.length >= 3);
});
