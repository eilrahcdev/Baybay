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

  console.log("[SIGNUP OTP] invalidating old verify OTPs", { email });

  await consumeActiveOtps({
    email,
    purpose: "verify",
    consumedAt: new Date().toISOString(),
  });

  console.log("[SIGNUP OTP] inserting new verify OTP", { email });

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

  console.log("[SIGNUP OTP] sending email", { email });

  await sendOtpEmail({ to: email, purpose: "verify", otp });

  console.log("[SIGNUP OTP] completed", { email });
}

/**
 * POST /api/auth/signup
 * body: { full_name, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    console.log("[SIGNUP] route hit");
    console.log("[SIGNUP] raw body", req.body);

    const { full_name, email, password } = req.body || {};

    const cleanName = String(full_name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    console.log("[SIGNUP] cleaned input", {
      cleanName,
      cleanEmail,
      hasPassword: Boolean(password),
    });

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ message: "full_name, email, password are required" });
    }

    console.log("[SIGNUP] checking existing user", { email: cleanEmail });
    const existing = await findAuthUserByEmail(cleanEmail);
    console.log("[SIGNUP] existing user result", existing);

    if (existing?.email_confirmed_at) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const userId = existing?.id || crypto.randomUUID();
    console.log("[SIGNUP] userId selected", { userId });

    const passwordHash = await bcrypt.hash(password, 10);
    console.log("[SIGNUP] password hashed");

    const usersSync = await syncUsersRow({
      id: userId,
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    console.log("[SIGNUP] users sync result", usersSync);

    if (!usersSync.ok) {
      return res.status(500).json({
        message: "Failed to create account. User record was not saved.",
        debug: usersSync.message,
      });
    }

    const savedUser = await getUserByEmail(cleanEmail);
    console.log("[SIGNUP] saved user check", savedUser);

    if (!savedUser) {
      return res.status(500).json({
        message: "Failed to create account. User record could not be confirmed.",
      });
    }

    try {
      await issueSignupVerificationOtp({
        email: cleanEmail,
      });
    } catch (e) {
      console.error("[SIGNUP] OTP issue failed:", e?.message || e);
      return res.status(500).json({
        message:
          "Account created, but we could not send the verification code. Please request a new code.",
        requiresOtpResend: true,
        usersSynced: true,
        user: {
          id: savedUser.id,
          email: cleanEmail,
        },
      });
    }

    return res.status(existing ? 200 : 201).json({
      message: "Signup successful. Verification code sent to your email.",
      requiresOtpResend: false,
      usersSynced: true,
      usersError: null,
      user: {
        id: savedUser.id,
        email: cleanEmail,
      },
    });
  } catch (e) {
    console.error("[SIGNUP] failed:", e);
    return res.status(500).json({
      message: "Signup failed",
      error: e?.message || String(e),
    });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

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
    console.error("[LOGIN] failed:", e);
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
          created_at: user.created_at || null,
        }
      : null;

    return res.json({ user: req.user, profile });
  } catch (e) {
    console.error("[ME] failed:", e);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;