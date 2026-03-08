import { verifyAuthToken } from "../authToken.js";
import { getEmailVerifiedAt, getUserById } from "../supabaseStore.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing Bearer token" });
    }

    const decoded = verifyAuthToken(token);
    const userId = String(decoded?.sub || "").trim();
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const user = await getUserById(userId);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    const emailVerifiedAt = await getEmailVerifiedAt(user.email);

    req.user = {
      id: user.id,
      email: user.email,
      email_confirmed_at: emailVerifiedAt,
      user_metadata: {
        full_name: user.full_name || "",
      },
    };
    next();
  } catch (e) {
    if (e?.name === "JsonWebTokenError" || e?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Auth middleware error" });
  }
}
