import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { sendOtpEmail } from "../mailer.js";

const router = express.Router();

const requestSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
});

const verifySchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
  otp: z.string().min(4).max(10),
});

const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(10),
  newPassword: z.string().min(8),
});

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function ttlDate() {
  const minutes = Number(process.env.OTP_TTL_MINUTES || "10");
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

// 1) Request OTP (verify/reset)
router.post("/auth/request-otp", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
  const purpose = parsed.data.purpose;

  // Optional: for reset, ensure the user exists in Supabase Auth
  if (purpose === "reset") {
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 2000 });
    if (error) return res.status(500).json({ message: error.message });
    const exists = list.users?.some((u) => (u.email || "").toLowerCase() === email);
    if (!exists) return res.status(404).json({ message: "No account found for this email." });
  }

  const otp = generateOtp();
  const otp_hash = await bcrypt.hash(otp, 10);
  const expires_at = ttlDate();

  // Invalidate old unconsumed OTPs for same email+purpose
  await supabaseAdmin
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null);

  const { error: insertErr } = await supabaseAdmin.from("email_otps").insert([
    { email, purpose, otp_hash, expires_at },
  ]);

  if (insertErr) return res.status(500).json({ message: insertErr.message });

  try {
    await sendOtpEmail({ to: email, purpose, otp });
  } catch (e) {
    return res.status(500).json({ message: "Failed to send OTP email. Check SMTP config." });
  }

  return res.json({ ok: true, message: "OTP sent." });
});

// 2) Verify OTP (for verify/reset confirmation)
router.post("/auth/verify-otp", async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
  const purpose = parsed.data.purpose;
  const otp = parsed.data.otp;

  const { data: rows, error } = await supabaseAdmin
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return res.status(500).json({ message: error.message });
  const record = rows?.[0];
  if (!record) return res.status(400).json({ message: "OTP not found. Request a new one." });

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: "OTP expired. Request a new one." });
  }

  // throttle attempts
  if ((record.attempts || 0) >= 5) {
    return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
  }

  const ok = await bcrypt.compare(otp, record.otp_hash);

  await supabaseAdmin
    .from("email_otps")
    .update({ attempts: (record.attempts || 0) + 1 })
    .eq("id", record.id);

  if (!ok) return res.status(400).json({ message: "Invalid OTP." });

  // Mark consumed
  await supabaseAdmin
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", record.id);

  // If purpose is verify, you can mark profile as verified (custom column)
  // (You need to add email_verified boolean column in profiles if you want.)
  return res.json({ ok: true, message: "OTP verified." });
});

// 3) Reset password using OTP + new password
router.post("/auth/reset-password", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request" });

  const email = parsed.data.email.toLowerCase();
  const otp = parsed.data.otp;
  const newPassword = parsed.data.newPassword;

  // Find latest RESET otp
  const { data: rows, error } = await supabaseAdmin
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", "reset")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return res.status(500).json({ message: error.message });
  const record = rows?.[0];
  if (!record) return res.status(400).json({ message: "OTP not found. Request a new one." });

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ message: "OTP expired. Request a new one." });
  }

  if ((record.attempts || 0) >= 5) {
    return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
  }

  const ok = await bcrypt.compare(otp, record.otp_hash);

  await supabaseAdmin
    .from("email_otps")
    .update({ attempts: (record.attempts || 0) + 1 })
    .eq("id", record.id);

  if (!ok) return res.status(400).json({ message: "Invalid OTP." });

  // Consume OTP
  await supabaseAdmin
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", record.id);

  // Update password in Supabase Auth
  // Find user by email
  const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 2000 });
  if (listErr) return res.status(500).json({ message: listErr.message });

  const user = users.users?.find((u) => (u.email || "").toLowerCase() === email);
  if (!user) return res.status(404).json({ message: "No account found." });

  const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updErr) return res.status(500).json({ message: updErr.message });

  return res.json({ ok: true, message: "Password reset successful." });
});

export default router;
