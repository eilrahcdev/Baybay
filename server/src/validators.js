import { z } from "zod";

export const INPUT_LIMITS = {
  EMAIL_MAX: 254,
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 80,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72, // bcrypt-safe max to avoid silent truncation
  OTP_LENGTH: 6,
  SEARCH_QUERY_MAX: 80,
  PRODUCT_ID_MAX: 40,
};

const fullNameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[\x21-\x7E]+$/;
const otpRegex = new RegExp(`^\\d{${INPUT_LIMITS.OTP_LENGTH}}$`);
const productIdRegex = /^[A-Za-z0-9_-]+$/;
const noControlCharsRegex = /^[^\x00-\x1F\x7F]*$/;
const noWhitespaceRegex = /^\S+$/;
const searchRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(noWhitespaceRegex, "Email must not contain spaces.")
  .max(INPUT_LIMITS.EMAIL_MAX, `Email must not exceed ${INPUT_LIMITS.EMAIL_MAX} characters.`)
  .email("Please provide a valid email address.");

const fullNameSchema = z
  .string()
  .trim()
  .min(INPUT_LIMITS.FULL_NAME_MIN, `Full name must be at least ${INPUT_LIMITS.FULL_NAME_MIN} characters.`)
  .max(INPUT_LIMITS.FULL_NAME_MAX, `Full name must not exceed ${INPUT_LIMITS.FULL_NAME_MAX} characters.`)
  .transform((value) => value.replace(/\s+/g, " "))
  .refine((value) => fullNameRegex.test(value), {
    message: "Full name must only contain letters and spaces.",
  });

const passwordSchema = z
  .string()
  .min(INPUT_LIMITS.PASSWORD_MIN, `Password must be at least ${INPUT_LIMITS.PASSWORD_MIN} characters.`)
  .max(INPUT_LIMITS.PASSWORD_MAX, `Password must not exceed ${INPUT_LIMITS.PASSWORD_MAX} characters.`)
  .regex(noWhitespaceRegex, "Password must not contain spaces.")
  .regex(
    passwordRegex,
    "Password must include uppercase, lowercase, number, and special character."
  );

const purposeSchema = z.enum(["verify", "reset"]);

const otpSchema = z
  .string()
  .trim()
  .regex(otpRegex, `OTP must be exactly ${INPUT_LIMITS.OTP_LENGTH} digits.`);

function parseBooleanQueryValue(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return value;
}

function parseIntegerQueryValue(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

export function getValidationErrorMessage(error, fallback = "Invalid request input.") {
  const issue = error?.issues?.[0];
  if (!issue) return fallback;

  const field = Array.isArray(issue.path) && issue.path.length ? issue.path.join(".") : null;
  return field ? `${field}: ${issue.message}` : issue.message || fallback;
}

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const signupSchema = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .max(INPUT_LIMITS.PASSWORD_MAX, `Password must not exceed ${INPUT_LIMITS.PASSWORD_MAX} characters.`)
    .regex(noWhitespaceRegex, "Password must not contain spaces.")
    .regex(noControlCharsRegex, "Password contains invalid characters."),
});

export const requestOtpSchema = z.object({
  email: emailSchema,
  purpose: purposeSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  purpose: purposeSchema,
  otp: otpSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
});

export const productsQuerySchema = z.object({
  limit: z.preprocess(parseIntegerQueryValue, z.number().int().min(1).max(200).default(8)),
});

export const artisansQuerySchema = z.object({
  featured: z.preprocess(parseBooleanQueryValue, z.boolean().default(false)),
});

export const productVariantsQuerySchema = z.object({
  product_id: z
    .string()
    .trim()
    .min(1, "product_id is required.")
    .max(INPUT_LIMITS.PRODUCT_ID_MAX, `product_id must not exceed ${INPUT_LIMITS.PRODUCT_ID_MAX} characters.`)
    .regex(productIdRegex, "product_id contains invalid characters."),
});

export const tiktokVideosQuerySchema = z.object({
  featured: z.preprocess(parseBooleanQueryValue, z.boolean().default(false)),
  active: z.preprocess(parseBooleanQueryValue, z.boolean().default(true)),
  limit: z.preprocess(parseIntegerQueryValue, z.number().int().min(1).max(100).default(12)),
});

export const searchQuerySchema = z.object({
  q: z.preprocess(
    (value) => (value === undefined || value === null ? "" : String(value)),
    z
      .string()
      .trim()
      .max(
        INPUT_LIMITS.SEARCH_QUERY_MAX,
        `Search query must not exceed ${INPUT_LIMITS.SEARCH_QUERY_MAX} characters.`
      )
      .regex(noControlCharsRegex, "Search query contains invalid characters.")
      .transform((value) => value.replace(/\s+/g, " "))
      .refine((value) => value === "" || searchRegex.test(value), {
        message: "Search query must only contain letters and spaces.",
      })
  ),
});
