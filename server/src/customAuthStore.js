import { upsertUser } from "./supabaseStore.js";

export async function syncUsersRow({ id, fullName, email, passwordHash }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return { ok: false, message: "Missing email for users sync." };

  try {
    await upsertUser({
      id,
      fullName,
      email: cleanEmail,
      passwordHash,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error?.message || "Failed to sync users row." };
  }
}
