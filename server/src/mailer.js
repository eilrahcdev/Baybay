import nodemailer from "nodemailer";

function clean(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function getBrandConfig() {
  return {
    appName: process.env.APP_NAME || "BAYBAY",
    logoUrl: process.env.MAIL_LOGO_URL || "",
    supportEmail: process.env.MAIL_SUPPORT || process.env.MAIL_FROM || process.env.SMTP_USER || "",
    accent: process.env.MAIL_ACCENT_COLOR || "#7C3A2E",
    surface: "#fff9f6",
  };
}

function layoutEmail({ title, subtitle, bodyHtml, footerHtml = "" }) {
  const brand = getBrandConfig();
  const logoBlock = brand.logoUrl
    ? `<img src="${brand.logoUrl}" alt="${brand.appName} logo" style="height:40px;width:auto;display:block;" />`
    : `<div style="font-size:20px;font-weight:700;letter-spacing:0.08em;color:${brand.accent};">${brand.appName}</div>`;

  return `
  <div style="margin:0;padding:24px;background:${brand.surface};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1b1b1b;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;margin:0 auto;background:#ffffff;border:1px solid #f0e3dd;border-radius:18px;overflow:hidden;">
      <tr>
        <td style="padding:22px 24px;border-bottom:1px solid #f4ebe7;background:linear-gradient(145deg,#fff,#fff8f4);">
          ${logoBlock}
          <h1 style="margin:14px 0 0;font-size:22px;line-height:1.3;color:${brand.accent};">${title}</h1>
          ${
            subtitle
              ? `<p style="margin:8px 0 0;color:#5b4c46;font-size:14px;line-height:1.5;">${subtitle}</p>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #f4ebe7;background:#fffaf7;color:#7b6a63;font-size:12px;line-height:1.5;">
          ${footerHtml || `Need help? Contact us at <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};">${brand.supportEmail}</a>.`}
        </td>
      </tr>
    </table>
  </div>`;
}

export function createMailer() {
  const user = (process.env.SMTP_USER || "").trim();
  const isGmail = user.toLowerCase().endsWith("@gmail.com");
  const host =
    process.env.SMTP_HOST ||
    (isGmail ? "smtp.gmail.com" : "");
  const port = Number(process.env.SMTP_PORT || (isGmail ? "465" : "587"));
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  const pass = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP settings. Set SMTP_USER, SMTP_PASS, and SMTP_HOST (or use Gmail).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
  });
}

function resolveFromAddress() {
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const configured = (process.env.MAIL_FROM || "").trim();
  const appName = process.env.APP_NAME || "BAYBAY";

  if (!smtpUser) return configured;
  if (!configured) return smtpUser;

  const isGmail = smtpUser.toLowerCase().endsWith("@gmail.com");
  if (!isGmail) return configured;

  // Gmail SMTP rejects unauthenticated sender domains.
  const containsSender = configured.toLowerCase().includes(smtpUser.toLowerCase());
  if (containsSender) return configured;

  return `${appName} <${smtpUser}>`;
}

async function sendMailWithRetry(message, retryCount = 1) {
  let attempt = 0;
  let lastError;

  while (attempt <= retryCount) {
    try {
      const transporter = createMailer();
      const info = await transporter.sendMail(message);
      return info;
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt > retryCount) break;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError;
}

export async function sendOtpEmail({ to, purpose, otp }) {
  const from = resolveFromAddress();
  const envelopeFrom = clean(process.env.SMTP_USER) || from;
  const recipient = normalizeEmail(to);
  const appName = process.env.APP_NAME || "BAYBAY";
  const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || "10");

  if (!isValidEmail(recipient)) {
    throw new Error("Invalid recipient email for OTP.");
  }

  const isVerify = purpose === "verify";
  const subject = isVerify
    ? `${appName} verification code`
    : `${appName} password reset code`;

  const text = `Your ${appName} ${
    isVerify ? "verification" : "password reset"
  } code is: ${otp}

This code expires in ${ttlMinutes} minutes.

If you did not request this, you can ignore this email.`;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;color:#3f342f;">
      Use the one-time code below to ${
        isVerify ? "verify your account" : "reset your password"
      }.
    </p>
    <div style="margin:14px 0 16px;display:inline-block;border:1px solid #ead8d1;background:#fffaf8;border-radius:14px;padding:14px 18px;font-size:30px;font-weight:700;letter-spacing:7px;color:#161616;">
      ${otp}
    </div>
    <p style="margin:0;color:#5b4c46;font-size:14px;">
      This code expires in <strong>${ttlMinutes} minutes</strong>.
    </p>
    <p style="margin:12px 0 0;color:#7b6a63;font-size:13px;">
      If you did not request this, you can safely ignore this email.
    </p>`;

  const html = layoutEmail({
    title: isVerify ? "Verify your email address" : "Reset your password",
    subtitle: `Secure your ${appName} account in just one step.`,
    bodyHtml,
  });

  const info = await sendMailWithRetry(
    {
      from,
      to: recipient,
      subject,
      text,
      html,
      // Force SMTP RCPT TO to target recipient instead of inferring unexpectedly.
      envelope: {
        from: envelopeFrom,
        to: [recipient],
      },
    },
    1
  );

  const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
  const rejected = Array.isArray(info?.rejected) ? info.rejected : [];
  console.log(
    `OTP email send result: to=${recipient} accepted=${accepted.join(",") || "-"} rejected=${
      rejected.join(",") || "-"
    }`
  );
}

export async function sendResetLinkEmail({ to, resetUrl }) {
  const from = resolveFromAddress();
  const envelopeFrom = clean(process.env.SMTP_USER) || from;
  const recipient = normalizeEmail(to);
  const appName = process.env.APP_NAME || "BAYBAY";
  const ttlMinutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || "30");
  const subject = `${appName} password reset link`;

  if (!isValidEmail(recipient)) {
    throw new Error("Invalid recipient email for reset link.");
  }

  const text = `Reset your ${appName} password using this secure link:
${resetUrl}

This link expires in ${ttlMinutes} minutes.

If you did not request this, you can ignore this email.`;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:15px;color:#3f342f;">
      Click the secure button below to reset your password.
    </p>
    <a href="${resetUrl}" style="display:inline-block;margin:8px 0 14px;background:#7C3A2E;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;">
      Reset password
    </a>
    <p style="margin:0 0 10px;color:#5b4c46;font-size:14px;">
      This link expires in <strong>${ttlMinutes} minutes</strong>.
    </p>
    <p style="margin:0;color:#7b6a63;font-size:13px;word-break:break-all;">
      If the button doesn't work, copy and paste this URL into your browser:<br />
      <a href="${resetUrl}" style="color:#7C3A2E;">${resetUrl}</a>
    </p>`;

  const html = layoutEmail({
    title: "Reset your password",
    subtitle: `Use this secure link to continue with your ${appName} account.`,
    bodyHtml,
  });

  const info = await sendMailWithRetry(
    {
      from,
      to: recipient,
      subject,
      text,
      html,
      envelope: {
        from: envelopeFrom,
        to: [recipient],
      },
    },
    1
  );

  const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
  const rejected = Array.isArray(info?.rejected) ? info.rejected : [];
  console.log(
    `Reset email send result: to=${recipient} accepted=${accepted.join(",") || "-"} rejected=${
      rejected.join(",") || "-"
    }`
  );
}
