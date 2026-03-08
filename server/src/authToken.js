import "./env.js";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

if (!secret) {
  throw new Error("Missing JWT_SECRET in server/.env");
}

export function signAuthToken({ id, email, fullName }) {
  return jwt.sign(
    {
      sub: id,
      email,
      full_name: fullName || "",
    },
    secret,
    { expiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, secret);
}
