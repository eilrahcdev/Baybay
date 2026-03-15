export const INPUT_LIMITS = {
  EMAIL_MAX: 254,
  FULL_NAME_MAX: 80,
  PASSWORD_MAX: 72,
  OTP_LENGTH: 6,
  SEARCH_QUERY_MAX: 80,
};

export const PATTERNS = {
  FULL_NAME: "^[A-Za-z]+( [A-Za-z]+)*$",
  OTP: "^\\d{6}$",
  PASSWORD: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9])[\\x21-\\x7E]+$",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_REGEX = new RegExp(PATTERNS.FULL_NAME);

export function sanitizeEmailInput(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .slice(0, INPUT_LIMITS.EMAIL_MAX);
}

export function sanitizeNameInput(value) {
  return String(value || "")
    .replace(/[^A-Za-z\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/, "")
    .slice(0, INPUT_LIMITS.FULL_NAME_MAX);
}

export function sanitizePasswordInput(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, INPUT_LIMITS.PASSWORD_MAX);
}

export function sanitizeOtpInput(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, INPUT_LIMITS.OTP_LENGTH);
}

export function sanitizeSearchInput(value) {
  return String(value || "")
    .replace(/[^A-Za-z\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/, "")
    .slice(0, INPUT_LIMITS.SEARCH_QUERY_MAX);
}

export function normalizeEmail(value) {
  return sanitizeEmailInput(value).trim().toLowerCase();
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(normalizeEmail(value));
}

export function isStrongPassword(value) {
  return new RegExp(PATTERNS.PASSWORD).test(String(value || ""));
}

export function isValidFullName(value) {
  return FULL_NAME_REGEX.test(String(value || "").trim());
}
