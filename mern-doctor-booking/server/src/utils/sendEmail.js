const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends email when SMTP is configured; otherwise logs the link (fine for local dev).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured()) {
    console.log('\n--- Email (dev mode — SMTP not set) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log('-------------------------------------\n');
    return { devMode: true };
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
  return { devMode: false };
};

module.exports = { sendEmail, isEmailConfigured };
