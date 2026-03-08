import { insertEmailOtp } from "./supabaseStore.js";

export async function insertEmailOtpRecord({
  email,
  purpose,
  otpHash,
  expiresAt,
  otpCode,
}) {
  try {
    await insertEmailOtp({
      email,
      purpose,
      otpHash,
      expiresAt,
      otpCode,
    });

    return { ok: true, storedPlainOtp: Boolean(otpCode) };
  } catch (error) {
    return { ok: false, error };
  }
}
