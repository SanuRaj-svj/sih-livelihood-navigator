const test = require('node:test');
const assert = require('node:assert/strict');
const { isReminderDue, isCheckInOverdue, nextCheckInAt } = require('../src/services/trainingCheckInReminderService');

test('check-in reminder becomes due two days before the scheduled date', () => {
  const now = new Date('2026-10-01T00:00:00.000Z');
  assert.equal(isReminderDue({ nextCheckInAt: new Date('2026-10-03T00:00:00.000Z'), now }), true);
  assert.equal(isReminderDue({ nextCheckInAt: new Date('2026-10-04T00:00:00.000Z'), now }), false);
});

test('one reminder is sent for each scheduled check-in and the next date is weekly', () => {
  const dueAt = new Date('2026-10-03T00:00:00.000Z');
  assert.equal(isReminderDue({ nextCheckInAt: dueAt, lastCheckInReminderFor: dueAt, now: new Date('2026-10-01T00:00:00.000Z') }), false);
  assert.equal(nextCheckInAt(new Date('2026-10-01T00:00:00.000Z')).toISOString(), '2026-10-08T00:00:00.000Z');
});

test('missed check-ins escalate only after the three-day grace period', () => {
  const now = new Date('2026-10-10T00:00:00.000Z');
  assert.equal(isCheckInOverdue({ nextCheckInAt: new Date('2026-10-07T00:00:00.000Z'), now }), true);
  assert.equal(isCheckInOverdue({ nextCheckInAt: new Date('2026-10-08T00:00:00.000Z'), now }), false);
});