import { upsertUser } from "./supabaseStore.js";

export async function syncUsersRow({ id, fullName, email, passwordHash }) {
  const cleanEmail = String(email || "").trim().toLowerCase();

  console.log("[CUSTOM AUTH] syncUsersRow called", {
    id,
    fullName,
    email: cleanEmail,
    hasPasswordHash: Boolean(passwordHash),
  });

  if (!cleanEmail) {
    return { ok: false, message: "Missing email for users sync." };
  }

  try {
    const result = await upsertUser({
      id,
      fullName,
      email: cleanEmail,
      passwordHash,
    });

    console.log("[CUSTOM AUTH] syncUsersRow success", {
      id: result?.id,
      email: result?.email,
    });

    return { ok: true, result };
  } catch (error) {
    console.error("[CUSTOM AUTH] syncUsersRow failed", error);
    return { ok: false, message: error?.message || "Failed to sync users row." };
  }
}