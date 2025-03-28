const nodemailer = require('nodemailer');

module.exports = async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your mail provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"To-Do App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
