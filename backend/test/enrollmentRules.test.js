const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getCenterEligibilityError,
  getDocumentGateError,
  validateCheckIn,
} = require('../src/controllers/enrollmentController');

test('center eligibility rejects courses not offered at the selected center', () => {
  const result = getCenterEligibilityError({
    center: { coursesOffered: [{ _id: 'course-a' }], capacity: 10 },
    courseId: 'course-b',
    activeEnrollmentCount: 2,
  });
  assert.equal(result, 'Training Center does not offer this course');
});

test('center eligibility rejects enrollment after capacity is reached', () => {
  const result = getCenterEligibilityError({
    center: { coursesOffered: ['course-a'], capacity: 4 },
    courseId: 'course-a',
    activeEnrollmentCount: 4,
  });
  assert.equal(result, 'Training Center has reached its enrollment capacity');
});

test('center eligibility allows available capacity and preserves unconfigured offerings', () => {
  assert.equal(getCenterEligibilityError({
    center: { coursesOffered: ['course-a'], capacity: 4 },
    courseId: 'course-a',
    activeEnrollmentCount: 3,
  }), null);
  assert.equal(getCenterEligibilityError({
    center: { coursesOffered: [], capacity: 0 },
    courseId: 'course-a',
    activeEnrollmentCount: 40,
  }), null);
});

test('source document gate requires verified certificate and beneficiary identity before enrollment', () => {
  assert.equal(getDocumentGateError('NOT_SUBMITTED'), 'Upload your SC certificate and wait for officer verification before enrolling');
  assert.equal(getDocumentGateError('PENDING_REVIEW'), 'Source certificate is awaiting officer verification');
  assert.equal(getDocumentGateError('REJECTED'), 'Source certificate was rejected; upload a valid document before enrolling');
  assert.equal(getDocumentGateError('VERIFIED', false), 'Certificate identity must match the beneficiary profile before enrolling');
  assert.equal(getDocumentGateError('VERIFIED', true), null);
});

test('training check-ins validate attendance and limit text fields', () => {
  assert.equal(validateCheckIn({ attendancePercentage: 0, currentModule: 'Orientation', notes: '' }), null);
  assert.match(validateCheckIn({ attendancePercentage: 101 }), /between 0 and 100/);
  assert.match(validateCheckIn({ attendancePercentage: -1 }), /between 0 and 100/);
  assert.match(validateCheckIn({ attendancePercentage: 50, currentModule: 'x'.repeat(161) }), /160 characters/);
  assert.match(validateCheckIn({ attendancePercentage: 50, notes: 'x'.repeat(1001) }), /1000 characters/);
});