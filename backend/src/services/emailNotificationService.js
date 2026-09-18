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

const buildCertificateEmailContent = ({
  beneficiaryName,
  courseName,
  centerName,
  certificate,
  pdfBuffer,
}) => {
  const stageLabel = certificate?.stage === 'ENROLLMENT' ? 'Enrollment Certificate' : 'Completion Certificate';
  const safePdfBuffer = pdfBuffer || Buffer.from('%PDF-1.4\n%\uFEFF\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

  return {
    subject: `${stageLabel} approved - ${certificate?.certificateId || 'CERTIFICATE'}`,
    text: [
      `Dear ${beneficiaryName || 'Beneficiary'},`,
      '',
      `Your ${stageLabel} has been approved by the Livelihood Navigator admin team.`,
      `Certificate ID: ${certificate?.certificateId || 'N/A'}`,
      `Course: ${courseName || 'Training course'}`,
      `Training Centre: ${centerName || 'Training centre'}`,
      'Please keep this certificate ID safe. It is required to unlock your course and verify your learning record.',
      'A PDF copy of the certificate is attached to this email.',
      '',
      'Regards,',
      'Livelihood Navigator',
    ].join('\n'),
    attachments: [
      {
        filename: `${certificate?.certificateId || 'certificate'}.pdf`,
        content: safePdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };
};

const sendCertificateIssuedEmail = async ({
  recipientEmail,
  beneficiaryName,
  courseName,
  centerName,
  certificate,
  pdfBuffer,
}) => {
  if (!env.EMAIL_NOTIFICATIONS_ENABLED) return false;
  if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD || !recipientEmail) {
    console.warn('Certificate email skipped: email configuration is incomplete for beneficiary delivery');
    return false;
  }

  const message = buildCertificateEmailContent({
    beneficiaryName,
    courseName,
    centerName,
    certificate,
    pdfBuffer,
  });

  try {
    await getTransporter().sendMail({
      from: `Livelihood Navigator <${env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: message.subject,
      text: message.text,
      attachments: message.attachments,
    });
    console.log(`Certificate email sent to ${recipientEmail} for ${certificate?.certificateId}`);
    return true;
  } catch (error) {
    console.error(`Certificate email send failed for ${recipientEmail}: ${error.message}`);
    return false;
  }
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

module.exports = {
  sendAnswerNotification,
  buildCertificateEmailContent,
  sendCertificateIssuedEmail,
};