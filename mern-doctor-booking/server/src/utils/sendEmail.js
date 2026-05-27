// const nodemailer = require('nodemailer');

// const isEmailConfigured = () =>
//   Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// const getTransporter = () =>
//   nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: Number(process.env.EMAIL_PORT) || 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

// /**
//  * Sends email when SMTP is configured; otherwise logs the link (fine for local dev).
//  */
// const sendEmail = async ({ to, subject, html, text }) => {
//   if (!isEmailConfigured()) {
//     console.log('\n--- Email (dev mode — SMTP not set) ---');
//     console.log(`To: ${to}`);
//     console.log(`Subject: ${subject}`);
//     console.log(text || html);
//     console.log('-------------------------------------\n');
//     return { devMode: true };
//   }

//   const transporter = getTransporter();
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//     to,
//     subject,
//     html,
//     text,
//   });
//   return { devMode: false };
// };

// module.exports = { sendEmail, isEmailConfigured };



/////////newwwwwwwww
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  // Check if SMTP credentials exist
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.log('\n--- Email (dev mode — SMTP not set) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log(text);
    console.log('-------------------------------------\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Send email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  console.log(`Email sent to ${to}`);
};

module.exports = { sendEmail };