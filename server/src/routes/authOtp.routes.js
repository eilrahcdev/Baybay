import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sendOtpEmail } from "../mailer.js";
import { findAuthUserByEmail } from "../authUsers.js";
import { insertEmailOtpRecord } from "../emailOtpStore.js";
import {
  consumeActiveOtps,
  getLatestActiveOtp as getLatestActiveOtpRow,
  updateOtpById,
  updateUserByEmail,
} from "../supabaseStore.js";

const router = express.Router();

const requestSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
});

const otpSchema = z.string().regex(/^\d{6}$/);

const verifySchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
  otp: otpSchema,
});

const resetSchema = z.object({
  email: z.string().email(),
  otp: otpSchema,
  newPassword: z.string().min(8),
});

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
  if (!inserted.ok) throw new Error(inserted.error?.message || "Failed to create OTP record.");
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
  const consumedAt = new Date();
  await updateOtpById(record.id, {
    consumed_at: consumedAt.toISOString(),
  });
  await consumeActiveOtps({
    email: record.email,
    purpose: record.purpose,
    consumedAt: consumedAt.toISOString(),
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

// Request OTP for verification or password reset.
router.post("/auth/request-otp", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
  const purpose = parsed.data.purpose;

  try {
    const user = await findAuthUserByEmail(email);

    if (purpose === "verify" && !user) {
      return res.status(404).json({ message: "No account found for this email." });
    }

    if (purpose === "verify" && user?.email_confirmed_at) {
      return res.status(400).json({ message: "This account is already verified." });
    }

    // Return generic response for reset to prevent account enumeration.
    if (purpose === "reset" && !user) {
      return res.json({ ok: true, message: "If the account exists, a code has been sent." });
    }

    const otp = generateOtp();
    await invalidateActiveRecords(email, purpose);
    await insertOtpRecord({ email, purpose, otp });
    await sendOtpEmail({ to: email, purpose, otp });

    return res.json({ ok: true, message: "OTP sent." });
  } catch (e) {
    console.error("Request OTP failed:", e?.message || e);
    return res.status(500).json({ message: "Failed to send OTP email. Check SMTP config." });
  }
});

// Verify OTP for account verification or reset gate.
router.post("/auth/verify-otp", async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
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

      const verifiedAt = new Date();
      await updateUserByEmail(email, {
        email_verified_at: verifiedAt.toISOString(),
      });
      await updateOtpById(record.id, {
        attempts: 999,
      });
      await consumeActiveOtps({
        email,
        purpose: "verify",
        consumedAt: verifiedAt.toISOString(),
      });
    }

    return res.json({ ok: true, message: "OTP verified." });
  } catch (e) {
    console.error("Verify OTP failed:", e?.message || e);
    return res.status(500).json({ message: "Failed to verify OTP." });
  }
});

// Reset password using OTP + new password.
router.post("/auth/reset-password", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
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

    return res.json({ ok: true, message: "Password reset successful." });
  } catch (e) {
    console.error("Reset password with OTP failed:", e?.message || e);
    return res.status(500).json({ message: "Failed to reset password." });
  }
});

export default router;
