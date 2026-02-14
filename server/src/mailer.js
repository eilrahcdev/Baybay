import nodemailer from "nodemailer";

export function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = (process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP_HOST/SMTP_USER/SMTP_PASS in server/.env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendOtpEmail({ to, purpose, otp }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const appName = "BAYBAY";

  const subject =
    purpose === "verify"
      ? `${appName} Account Verification Code`
      : `${appName} Password Reset Code`;

  const text = `Your ${appName} ${purpose === "verify" ? "verification" : "password reset"} code is: ${otp}
This code expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2 style="color:#7C3A2E;margin:0 0 12px;">${appName}</h2>
    <p style="margin:0 0 10px;">
      Your <b>${purpose === "verify" ? "verification" : "password reset"}</b> code is:
    </p>
    <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#111;
                padding:12px 16px;border:1px solid #eee;border-radius:12px;
                display:inline-block;background:#fafafa;">
      ${otp}
    </div>
    <p style="margin:12px 0 0;color:#555;">
      This code expires in <b>${process.env.OTP_TTL_MINUTES || 10} minutes</b>.
    </p>
  </div>`;

  const transporter = createMailer();
  await transporter.sendMail({ from, to, subject, text, html });
}
