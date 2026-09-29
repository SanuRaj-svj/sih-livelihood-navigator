const TrainingEnrollment = require('../models/TrainingEnrollment');
const Intervention = require('../models/Intervention');
const { sendTrainingCheckInReminder } = require('./emailNotificationService');

const REMINDER_LEAD_TIME_MS = 2 * 24 * 60 * 60 * 1000;
const OVERDUE_ESCALATION_MS = 3 * 24 * 60 * 60 * 1000;
const NEXT_CHECK_IN_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

const isReminderDue = ({ nextCheckInAt: dueValue, lastCheckInReminderFor, now = new Date() }) => {
  if (!dueValue) return false;
  const dueAt = new Date(dueValue);
  const remindedFor = lastCheckInReminderFor ? new Date(lastCheckInReminderFor) : null;
  return dueAt.getTime() <= now.getTime() + REMINDER_LEAD_TIME_MS
    && (!remindedFor || remindedFor.getTime() !== dueAt.getTime());
};

const nextCheckInAt = (from = new Date()) => new Date(new Date(from).getTime() + NEXT_CHECK_IN_INTERVAL_MS);
const isCheckInOverdue = ({ nextCheckInAt: dueValue, now = new Date() }) => Boolean(dueValue)
  && now.getTime() - new Date(dueValue).getTime() >= OVERDUE_ESCALATION_MS;

const runScheduledCheckInReminders = async (now = new Date()) => {
  await TrainingEnrollment.updateMany(
    {
      status: { $in: ['ENROLLED', 'IN_PROGRESS'] },
      enrollmentCertificateVerifiedAt: { $ne: null },
      nextCheckInAt: null,
    },
    { $set: { nextCheckInAt: nextCheckInAt(now), lastCheckInReminderAt: null, lastCheckInReminderFor: null } },
  );
  const candidates = await TrainingEnrollment.find({
    status: { $in: ['ENROLLED', 'IN_PROGRESS'] },
    enrollmentCertificateVerifiedAt: { $ne: null },
    nextCheckInAt: { $lte: new Date(now.getTime() + REMINDER_LEAD_TIME_MS) },
  })
    .populate({ path: 'beneficiaryId', populate: { path: 'userId', select: 'name email' } })
    .populate('courseId', 'courseName')
    .populate('centerId', 'name');

  let remindersSent = 0;
  let escalationsCreated = 0;
  for (const enrollment of candidates) {
    if (isReminderDue({ nextCheckInAt: enrollment.nextCheckInAt, lastCheckInReminderFor: enrollment.lastCheckInReminderFor, now })) {
      const user = enrollment.beneficiaryId?.userId;
      const sent = await sendTrainingCheckInReminder({
        recipientEmail: user?.email,
        beneficiaryName: user?.name,
        courseName: enrollment.courseId?.courseName,
        centerName: enrollment.centerId?.name,
        dueAt: enrollment.nextCheckInAt,
      });
      if (sent) {
        enrollment.lastCheckInReminderAt = now;
        enrollment.lastCheckInReminderFor = enrollment.nextCheckInAt;
        await enrollment.save();
        remindersSent += 1;
      }
    }

    if (isCheckInOverdue({ nextCheckInAt: enrollment.nextCheckInAt, now })) {
      const sourceKey = `check-in-overdue:${enrollment._id}:${new Date(enrollment.nextCheckInAt).getTime()}`;
      const result = await Intervention.updateOne(
        { sourceKey },
        { $setOnInsert: {
          beneficiaryId: enrollment.beneficiaryId?._id,
          enrollmentId: enrollment._id,
          source: 'SYSTEM',
          sourceKey,
          reason: `Scheduled training check-in overdue since ${new Date(enrollment.nextCheckInAt).toISOString()}; officer follow-up recommended.`,
          riskLevel: 'MEDIUM',
          status: 'OPEN',
        } },
        { upsert: true, runValidators: true },
      );
      if (result.upsertedCount) escalationsCreated += 1;
    }
  }
  return { candidates: candidates.length, remindersSent, escalationsCreated };
};

module.exports = { isReminderDue, isCheckInOverdue, nextCheckInAt, runScheduledCheckInReminders };