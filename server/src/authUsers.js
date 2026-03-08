import { getEmailVerifiedAt, getUserByEmail } from "./supabaseStore.js";

export async function findAuthUserByEmail(email) {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return null;

  const user = await getUserByEmail(target);
  if (!user) return null;
  const emailVerifiedAt = await getEmailVerifiedAt(target);

  return {
    id: user.id,
    email: user.email,
    email_confirmed_at: emailVerifiedAt,
    user_metadata: { full_name: user.full_name || "" },
  };
}
