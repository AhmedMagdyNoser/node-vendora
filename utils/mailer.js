const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // To use the Gmail service
  port: 465, // 465 if secure: true, 587 if secure: false
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (to, subject, html) =>
  await transporter.sendMail({ from: `"Vendora" ${process.env.EMAIL_USER}`, to, subject, html });
