const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Hospital Appointment" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Hospital Appointment OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hospital Appointment</h2>
        <p>Your OTP for patient login is:</p>

        <h1 style="letter-spacing: 6px;">${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendOtpEmail,
};