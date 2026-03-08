export function getFriendlyError(type, rawMessage = "") {
  const msg = String(rawMessage || "").toLowerCase();

  switch (type) {
    case "login":
      if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
        return "Email or password is incorrect. Please try again.";
      }
      if (
        msg.includes("email not confirmed") ||
        msg.includes("verify your email") ||
        msg.includes("not verified")
      ) {
        return "Please verify your email before logging in.";
      }
      return "We could not log you in right now. Please try again.";

    case "signup":
      if (msg.includes("already registered")) {
        return "This email is already registered. Try logging in instead.";
      }
      if (msg.includes("verification code")) {
        return "Your account was created, but we could not send the verification code. Please resend it.";
      }
      return "We could not create your account right now. Please try again.";

    case "resend_verification":
      return "We could not resend the verification email right now. Please try again.";

    case "verify_email":
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("otp")) {
        return "The verification code is invalid or expired. Please request a new code.";
      }
      return "We could not verify your email right now. Please try again.";

    case "resend_verification_code":
      return "We could not resend the verification code right now. Please try again.";

    case "send_reset_code":
      return "We could not send a reset code right now. Please try again.";

    case "send_reset_link":
      return "We could not send a reset link right now. Please try again.";

    case "reset_password":
      if (msg.includes("otp") || msg.includes("code")) {
        return "The code is invalid or expired. Please request a new one.";
      }
      return "We could not reset your password right now. Please try again.";

    case "reset_password_token":
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("link")) {
        return "The reset link is invalid or expired. Please request a new one.";
      }
      return "We could not reset your password right now. Please try again.";

    case "resend_reset_code":
      return "We could not resend the code right now. Please try again.";

    default:
      return "Something went wrong. Please try again.";
  }
}
