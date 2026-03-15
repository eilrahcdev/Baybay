import express from "express";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../mailer.js";
import { findAuthUserByEmail } from "../authUsers.js";
import { insertEmailOtpRecord } from "../emailOtpStore.js";
import {
  consumeActiveOtps,
  getLatestActiveOtp as getLatestActiveOtpRow,
  updateOtpById,
  updateUserByEmail,
} from "../supabaseStore.js";
import {
  getValidationErrorMessage,
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators.js";

const router = express.Router();

const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiryIso() {
  const minutes = Number(process.env.OTP_TTL_MINUTES || "10");
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function invalidateActiveRecords(email, purpose) {
  await consumeActiveOtps({
    email,
    purpose,
    consumedAt: new Date().toISOString(),
  });
}

async function insertOtpRecord({ email, purpose, otp }) {
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = otpExpiryIso();

  const inserted = await insertEmailOtpRecord({
    email,
    purpose,
    otpHash,
    expiresAt,
    otpCode: otp,
  });

  if (!inserted.ok) {
    throw new Error(inserted.error?.message || "Failed to create OTP record.");
  }

  return { expiresAt };
}

async function getLatestActiveOtp({ email, purpose }) {
  return getLatestActiveOtpRow({
    email,
    purpose,
  });
}

async function markAttempt(record) {
  await updateOtpById(record.id, {
    attempts: (record.attempts || 0) + 1,
  });
}

async function markConsumed(record) {
  const consumedAt = new Date().toISOString();

  await updateOtpById(record.id, {
    consumed_at: consumedAt,
  });

  await consumeActiveOtps({
    email: record.email,
    purpose: record.purpose,
    consumedAt,
  });
}

async function verifyOtpRecord({ record, otp }) {
  if (!record) return { ok: false, reason: "missing" };
  if (new Date(record.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };
  if ((record.attempts || 0) >= MAX_ATTEMPTS) return { ok: false, reason: "attempts" };

  const ok = await bcrypt.compare(otp, record.otp_hash);
  await markAttempt(record);

  if (!ok) return { ok: false, reason: "invalid" };

  await markConsumed(record);
  return { ok: true };
}

router.post("/auth/request-otp", async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: getValidationErrorMessage(parsed.error, "Invalid request") });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const purpose = parsed.data.purpose;

  try {
    console.log("[REQUEST OTP] start", { email, purpose });

    const user = await findAuthUserByEmail(email);

    console.log("[REQUEST OTP] user lookup", {
      found: Boolean(user),
      verified: Boolean(user?.email_confirmed_at),
      email,
      purpose,
    });

    if (purpose === "verify" && !user) {
      return res.status(404).json({ message: "No account found for this email." });
    }

    if (purpose === "verify" && user?.email_confirmed_at) {
      return res.status(400).json({ message: "This account is already verified." });
    }

    if (purpose === "reset" && !user) {
      return res.json({ ok: true, message: "If the account exists, a code has been sent." });
    }

    const otp = generateOtp();

    await invalidateActiveRecords(email, purpose);
    console.log("[REQUEST OTP] old OTPs invalidated", { email, purpose });

    await insertOtpRecord({ email, purpose, otp });
    console.log("[REQUEST OTP] OTP stored", { email, purpose });

    await sendOtpEmail({ to: email, purpose, otp });
    console.log("[REQUEST OTP] email sent", { email, purpose });

    return res.json({ ok: true, message: "OTP sent." });
  } catch (e) {
    console.error("[REQUEST OTP] failed:", e);
    return res.status(500).json({ message: "Failed to send OTP email. Check SMTP config." });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: getValidationErrorMessage(parsed.error, "Invalid request") });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const purpose = parsed.data.purpose;
  const otp = parsed.data.otp;

  try {
    const record = await getLatestActiveOtp({ email, purpose });
    if (!record) return res.status(400).json({ message: "OTP not found. Request a new one." });

    const result = await verifyOtpRecord({ record, otp });

    if (!result.ok) {
      if (result.reason === "expired") {
        return res.status(400).json({ message: "OTP expired. Request a new one." });
      }
      if (result.reason === "attempts") {
        return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
      }
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (purpose === "verify") {
      const user = await findAuthUserByEmail(email);
      if (!user) return res.status(404).json({ message: "No account found." });

      const verifiedAt = new Date().toISOString();

      await updateUserByEmail(email, {
        email_verified_at: verifiedAt,
      });

      await updateOtpById(record.id, {
        attempts: 999,
      });

      await consumeActiveOtps({
        email,
        purpose: "verify",
        consumedAt: verifiedAt,
      });

      console.log("[VERIFY OTP] verified", { email });
    }

    return res.json({ ok: true, message: "OTP verified." });
  } catch (e) {
    console.error("[VERIFY OTP] failed:", e);
    return res.status(500).json({ message: "Failed to verify OTP." });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: getValidationErrorMessage(parsed.error, "Invalid request") });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const otp = parsed.data.otp;
  const newPassword = parsed.data.newPassword;

  try {
    const record = await getLatestActiveOtp({ email, purpose: "reset" });
    if (!record) return res.status(400).json({ message: "OTP not found. Request a new one." });

    const result = await verifyOtpRecord({ record, otp });
    if (!result.ok) {
      if (result.reason === "expired") {
        return res.status(400).json({ message: "OTP expired. Request a new one." });
      }
      if (result.reason === "attempts") {
        return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
      }
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const user = await findAuthUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found." });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await updateUserByEmail(email, {
      password_hash: passwordHash,
    });

    console.log("[RESET PASSWORD] success", { email });

    return res.json({ ok: true, message: "Password reset successful." });
  } catch (e) {
    console.error("[RESET PASSWORD] failed:", e);
    return res.status(500).json({ message: "Failed to reset password." });
  }
});

export default router;
