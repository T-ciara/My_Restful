const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(to, firstName, otp) {
  await transporter.sendMail({
    from: `"ParkManager" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your ParkManager verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="background:#3b82f6;color:#fff;font-size:28px;width:56px;height:56px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">🅿</div>
          <h2 style="color:#0f172a;margin:12px 0 4px;">ParkManager</h2>
        </div>
        <p style="color:#374151;font-size:15px;">Hello <strong>${firstName}</strong>,</p>
        <p style="color:#374151;font-size:15px;">Use the code below to verify your email address:</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#3b82f6;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:12px;text-align:center;">If you did not create a ParkManager account, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
