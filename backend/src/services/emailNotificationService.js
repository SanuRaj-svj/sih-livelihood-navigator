const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_APP_PASSWORD.replace(/\s/g, ''),
      },
    });
  }
  return transporter;
};

const sendAnswerNotification = async ({ session, answer }) => {
  if (!env.EMAIL_NOTIFICATIONS_ENABLED) return false;
  if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD || !env.EMAIL_RECIPIENT) {
    console.warn('IVR email notification skipped: email configuration is incomplete');
    return false;
  }

  const profile = session.extractedProfileData || {};
  try {
    await getTransporter().sendMail({
      from: `Livelihood IVR <${env.EMAIL_USER}>`,
      to: env.EMAIL_RECIPIENT,
      subject: `IVR answer recorded: ${session.sessionId}`,
      text: [
        'A livelihood IVR answer was recorded.',
        '',
        `Call/session ID: ${session.sessionId}`,
        `Language: ${session.language}`,
        `Session status: ${session.status}`,
        `Answer: ${answer}`,
        '',
        'Current extracted profile:',
        JSON.stringify(profile, null, 2),
      ].join('\n'),
    });
    console.log(`IVR email notification sent to ${env.EMAIL_RECIPIENT}`);
    return true;
  } catch (error) {
    console.error(`IVR email notification failed: ${error.message}`);
    return false;
  }
};

module.exports = { sendAnswerNotification };