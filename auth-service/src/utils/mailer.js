const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
        from: `"DS_Sport" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Mã xác thực đăng ký tài khoản KICKZONE',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Xác thực đăng ký tài khoản</h2>
        <p>Mã xác thực của bạn là:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #FF4500;">${otp}</div>
        <p>Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };