const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
  timeoutInSeconds: 10,
  maxRetries: 0,
});

const sendOtpEmail = async (email, otp) => {
  try {
    console.log("Brevo API request starting...");

    const response =
      await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name:
            process.env.BREVO_SENDER_NAME ||
            "Hospital Appointment",
        },

        to: [
          {
            email: email,
          },
        ],

        subject: "Your Hospital Appointment OTP",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hospital Appointment</h2>

            <p>Your OTP for patient login is:</p>

            <h1 style="letter-spacing: 6px;">
              ${otp}
            </h1>

            <p>This OTP is valid for 5 minutes.</p>

            <p>
              If you did not request this email, please ignore it.
            </p>
          </div>
        `,
      });

    console.log(
      "OTP email sent successfully:",
      response.messageId
    );

    return response;
  } catch (error) {
    console.error("Brevo OTP email error:", error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};