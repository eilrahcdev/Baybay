import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendOtpEmail } from "../mailer.js";
import { findAuthUserByEmail } from "../authUsers.js";
import { insertEmailOtpRecord } from "../emailOtpStore.js";
import { syncUsersRow } from "../customAuthStore.js";
import { signAuthToken } from "../authToken.js";
import {
  consumeActiveOtps,
  getEmailVerifiedAt,
  getUserById,
  getUserByEmail,
} from "../supabaseStore.js";

const router = express.Router();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiryIso() {
  const minutes = Number(process.env.OTP_TTL_MINUTES || "10");
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

async function issueSignupVerificationOtp({ email }) {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = otpExpiryIso();
  await consumeActiveOtps({
    email,
    purpose: "verify",
    consumedAt: new Date().toISOString(),
  });

  const inserted = await insertEmailOtpRecord({
    email,
    purpose: "verify",
    otpHash,
    expiresAt,
    otpCode: otp,
  });
  if (!inserted.ok) {
    throw new Error(inserted.error?.message || "Failed to create verification OTP.");
  }

  await sendOtpEmail({ to: email, purpose: "verify", otp });
}

/**
 * POST /api/auth/signup
 * body: { full_name, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const cleanName = String(full_name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ message: "full_name, email, password are required" });
    }

    const existing = await findAuthUserByEmail(cleanEmail);

    if (existing?.email_confirmed_at) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const userId = existing?.id || crypto.randomUUID();

    const passwordHash = await bcrypt.hash(password, 10);

    let usersSynced = true;
    let usersErrorMessage = "";
    const usersSync = await syncUsersRow({
      id: userId,
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
    });
    if (!usersSync.ok) {
      usersSynced = false;
      usersErrorMessage = usersSync.message;
      console.error("Signup users sync failed:", usersErrorMessage);
    }

    let otpSent = true;
    try {
      await issueSignupVerificationOtp({
        email: cleanEmail,
      });
    } catch (e) {
      console.error("Signup OTP send failed:", e?.message || e);
      otpSent = false;
    }

    return res.status(existing ? 200 : 201).json({
      message:
        !usersSynced && !otpSent
          ? "Account created, but verification code delivery failed. Please contact support."
          : !usersSynced
          ? "Account created and verification code sent, but account details are incomplete."
          : otpSent
          ? "Signup successful. Verification code sent to your email."
          : "Account created, but we could not send the verification code. Please request a new code.",
      requiresOtpResend: !otpSent,
      usersSynced,
      usersError: usersSynced ? null : usersErrorMessage,
      user: {
        id: userId,
        email: cleanEmail,
      },
    });
  } catch (e) {
    console.error("Signup failed:", e?.message || e);
    return res.status(500).json({ message: "Signup failed" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);
    if (!user?.password_hash) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const emailVerifiedAt = await getEmailVerifiedAt(cleanEmail);
    if (!emailVerifiedAt) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const userId = user.id;

    const accessToken = signAuthToken({
      id: userId,
      email: user.email,
      fullName: user.full_name || "",
    });

    return res.json({
      message: "Login successful",
      user: {
        id: userId,
        email: user.email,
        email_confirmed_at: emailVerifiedAt,
        user_metadata: {
          full_name: user.full_name || "",
        },
      },
      session: {
        access_token: accessToken,
        token_type: "bearer",
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Login failed" });
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <access_token>
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    const profile = user
      ? {
          id: user.id,
          full_name: user.full_name || "",
          email: user.email || "",
          created_at: null,
        }
      : null;

    return res.json({ user: req.user, profile });
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
