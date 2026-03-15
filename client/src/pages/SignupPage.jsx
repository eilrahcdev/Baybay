import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CircleCheck,
  CircleX,
  Mail,
  User,
  LockKeyhole,
  X,
  FileText,
  Shield,
} from "lucide-react";
import { api } from "../lib/api";
import { TERMS_CONTENT, PRIVACY_CONTENT } from "../components/LegalContent";
import { getFriendlyError } from "../lib/friendlyErrors";
import {
  INPUT_LIMITS,
  PATTERNS,
  isValidFullName,
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  sanitizeEmailInput,
  sanitizeNameInput,
  sanitizePasswordInput,
} from "../lib/inputValidation";

function getPasswordStrength(pw) {
  const v = (pw || "").trim();
  if (!v) return { score: 0, label: "", hint: "" };

  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  score = Math.max(0, Math.min(4, score));

  const map = {
    1: { label: "Weak", hint: "Add more characters and mix letters/numbers." },
    2: { label: "Fair", hint: "Try adding a number and a symbol." },
    3: { label: "Good", hint: "Nice one - add a symbol for extra strength." },
    4: { label: "Strong", hint: "Great password strength." },
  };

  return score === 0
    ? { score: 0, label: "Weak", hint: "Use at least 8 characters." }
    : { score, ...map[score] };
}

/**
 * Modal where user must scroll to the bottom before agreeing.
 * Clicking "I Agree" runs onAgree() and closes the modal.
 */
function LegalModal({ open, onClose, initialTab = "terms", onAgree }) {
  const [tab, setTab] = useState(initialTab);
  const [canAgree, setCanAgree] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Reset scroll progress when tab or modal state changes.
  useEffect(() => {
    if (!open) return;
    setCanAgree(false);

    // Reset scroll position after render.
    const t = setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      // If content is short, allow agree right away.
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 2;
        if (nearBottom) setCanAgree(true);
      });
    }, 0);

    return () => clearTimeout(t);
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 8;
    if (nearBottom) setCanAgree(true);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Terms and Privacy"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal backdrop"
      />

      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-[#7C3A2E]/15 bg-[#7C3A2E]/10 p-2">
              {tab === "terms" ? (
                <FileText className="text-[#7C3A2E]" size={18} />
              ) : (
                <Shield className="text-[#7C3A2E]" size={18} />
              )}
            </div>
            <div>
              <p className="font-semibold leading-tight text-[#7C3A2E]">
                {tab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </p>
              <p className="text-xs text-black/55">Scroll to the bottom to enable "I Agree".</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-black/50 hover:bg-black/5 hover:text-black focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 sm:px-6">
          <div className="inline-flex flex-wrap rounded-2xl border border-black/10 bg-black/5 p-1">
            <button
              type="button"
              onClick={() => setTab("terms")}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                tab === "terms"
                  ? "border border-black/10 bg-white text-[#7C3A2E] shadow-sm"
                  : "text-black/60 hover:text-black",
              ].join(" ")}
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setTab("privacy")}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                tab === "privacy"
                  ? "border border-black/10 bg-white text-[#7C3A2E] shadow-sm"
                  : "text-black/60 hover:text-black",
              ].join(" ")}
            >
              Privacy
            </button>
          </div>
        </div>

        {/* Body (scroll area) */}
        <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-auto px-5 py-4 sm:px-6">
          {tab === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-black/10 bg-black/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-black/55">
            {canAgree ? "You can agree now." : "Scroll to the bottom to continue."}
          </p>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 transition hover:bg-black/5 sm:flex-none"
            >
              Close
            </button>

            <button
              type="button"
              disabled={!canAgree}
              onClick={() => {
                onAgree?.();
                onClose?.();
              }}
              className="flex-1 rounded-xl bg-[#7C3A2E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState("terms"); // "terms" | "privacy"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const openTerms = () => {
    setLegalTab("terms");
    setLegalOpen(true);
  };

  const openPrivacy = () => {
    setLegalTab("privacy");
    setLegalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!cleanName) return setError("Please enter your full name.");
    if (!isValidFullName(cleanName)) {
      return setError("Full name must only contain letters and spaces.");
    }
    if (!isValidEmail(cleanEmail)) return setError("Please enter a valid email.");
    if (!password) return setError("Please enter a password.");
    if (!isStrongPassword(password)) {
      return setError("Use 8-72 chars with uppercase, lowercase, number, and special character.");
    }
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!acceptedLegal)
      return setError("Please accept the Terms & Conditions and Privacy Policy.");

    setLoading(true);
    try {
      const data = await api.signup({
        full_name: cleanName,
        email: cleanEmail,
        password,
      });

      const usersSynced = data?.usersSynced ?? data?.profileSynced;

      if (usersSynced === false) {
        setError(
          "Account created, but we could not save account details yet. Please contact support and share your email."
        );
      } else if (data?.requiresOtpResend) {
        setError(
          "Account created, but we could not send the verification code automatically. Please resend it below."
        );
      }
      setSent(true);
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("signup", e?.message));
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setError("");
    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) return setError("Enter a valid email first.");

    setLoading(true);
    try {
      await api.requestOtp({
        email: cleanEmail,
        purpose: "verify",
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      setError(getFriendlyError("resend_verification_code", e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell relative grid min-h-screen w-full lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
      {/* Left image */}
      <div className="relative hidden lg:block lg:h-screen">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3sEtA9VSN7qPvfv_YSMnxp7BpkOE3F522AH82n7mpA5aYVhcCxRnh_UmC0EtloCxmtacFvNON3KqvCT_IuPtD2h18pj_z_5NGEpgaAma1Qc8bydCT2qBj46MUnLlu1nrnlkSgKiDp957cyhxfcEJKFVRJPsF6a1lgCFvTvZ6H3PA8mrNH9h9Gus3KmuZSWS4b5R5TGZqC0riU0QbYdMxZDNNuiCGzg-MxT6s4Cexa8V4drcWHk9D7uRGtAELPxgrKEpvfKPwANSk"
          alt="BAYBAY background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b130e]/80 via-[#6f3228]/68 to-[#130a08]/74" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_78%_88%,rgba(196,138,126,0.3),transparent_36%)]" />
        <div className="absolute inset-0 flex items-center justify-center px-12">
          <div className="max-w-md text-white">
            <span className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
              Create Account
            </span>
            <h1 className="mt-5 font-display text-5xl leading-tight">Start with Baybay today</h1>
            <p className="mt-5 text-white/90 leading-relaxed">
              Join Baybay and discover the work of Pangasinan artisans through a curated,
              story-first marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative flex items-start justify-center px-4 py-8 sm:items-center sm:px-8 sm:py-10 lg:h-screen lg:overflow-y-auto">
        <div className="pointer-events-none absolute left-2 top-8 h-40 w-40 rounded-full bg-[#e8c3b8]/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-2 h-40 w-40 rounded-full bg-[#7C3A2E]/20 blur-3xl" />

        <div className="w-full max-w-lg">
          {/* Form card */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/88 p-6 shadow-[0_24px_64px_rgba(28,17,13,0.16)] backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-[#7C3A2E]/10 blur-2xl" />

            <span className="inline-flex items-center rounded-full border border-[#7C3A2E]/18 bg-[#7C3A2E]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C3A2E]">
              Create Account
            </span>

            <h2 className="mt-4 text-center font-display text-3xl text-[#7C3A2E] sm:text-4xl">
              Welcome to Baybay!
            </h2>
            <p className="mt-2 text-center text-sm text-black/60">
              Sign up to start exploring Pangasinan&apos;s artisans and their crafts.
            </p>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {sent ? (
              <div className="mt-6 rounded-2xl border border-[#7C3A2E]/20 bg-[#7C3A2E]/6 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border border-black/5 bg-white p-2 shadow-sm">
                    <Mail size={18} className="text-[#7C3A2E]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#7C3A2E]">Verify your email</p>
                    <p className="mt-1 text-sm text-black/65">
                      We sent a 6-digit verification code to{" "}
                      <span className="break-all font-medium">{email}</span>. Enter the code to activate
                      your account.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
                      }
                      className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#7C3A2E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6b3127]"
                    >
                      Continue to Verify Email
                    </button>

                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={loading}
                      className="mt-3 block text-sm font-semibold text-[#7C3A2E] hover:underline disabled:opacity-60"
                    >
                      {loading ? "Sending..." : "Send another code"}
                    </button>

                    <p className="mt-4 text-sm text-black/60">
                      Already verified and logged in?{" "}
                      <Link to="/login" className="font-semibold text-[#7C3A2E] hover:underline">
                        Log In
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-black/70">Full Name</label>
                  <div className="mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 px-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                    <User size={17} className="text-black/45" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(sanitizeNameInput(e.target.value))}
                      type="text"
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                      maxLength={INPUT_LIMITS.FULL_NAME_MAX}
                      minLength={2}
                      pattern={PATTERNS.FULL_NAME}
                      title="Use letters and spaces only."
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Email</label>
                  <div className="mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 px-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                    <Mail size={17} className="text-black/45" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
                      type="email"
                      placeholder="juandelacruz@gmail.com"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                      maxLength={INPUT_LIMITS.EMAIL_MAX}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Password</label>
                  <div className="relative mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 pl-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                    <LockKeyhole size={17} className="text-black/45" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(sanitizePasswordInput(e.target.value))}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="w-full bg-transparent px-3 py-3 pr-12 text-sm outline-none"
                      minLength={8}
                      maxLength={INPUT_LIMITS.PASSWORD_MAX}
                      pattern={PATTERNS.PASSWORD}
                      title="8-72 chars with uppercase, lowercase, number, and special character."
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 transition hover:text-[#7C3A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-black/60">Password strength</p>
                      <p className="text-xs font-semibold text-black/60">{strength.label}</p>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(strength.score / 4) * 100}%`,
                          backgroundColor:
                            strength.score <= 1
                              ? "#ef4444"
                              : strength.score === 2
                              ? "#f59e0b"
                              : strength.score === 3
                              ? "#22c55e"
                              : "#16a34a",
                        }}
                      />
                    </div>

                    {password && <p className="mt-2 text-[11px] text-black/55">{strength.hint}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Confirm Password</label>

                  <div className="relative mt-2 flex items-center rounded-xl border border-black/15 bg-white/90 pl-3 shadow-sm transition focus-within:border-[#7C3A2E] focus-within:ring-4 focus-within:ring-[#7C3A2E]/15">
                    <LockKeyhole size={17} className="text-black/45" />
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(sanitizePasswordInput(e.target.value))}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="w-full bg-transparent px-3 py-3 pr-12 text-sm outline-none"
                      minLength={8}
                      maxLength={INPUT_LIMITS.PASSWORD_MAX}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 transition hover:text-[#7C3A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {password && confirmPassword ? (
                    passwordsMatch ? (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                        <CircleCheck size={16} />
                        <span>Passwords match</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                        <CircleX size={16} />
                        <span>Passwords do not match</span>
                      </div>
                    )
                  ) : null}
                </div>

                {/* Terms checkbox and modal links */}
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedLegal}
                      onChange={(e) => {
                        setError("");
                        setAcceptedLegal(e.target.checked);
                      }}
                      className="mt-1 h-4 w-4 rounded border-black/30 text-[#7C3A2E] focus:ring-[#7C3A2E]/30"
                    />
                    <span className="text-sm leading-relaxed text-black/70">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={openTerms}
                        className="font-semibold text-[#7C3A2E] hover:underline"
                      >
                        Terms & Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={openPrivacy}
                        className="font-semibold text-[#7C3A2E] hover:underline"
                      >
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || passwordsMatch === false || !acceptedLegal}
                  className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-[0_10px_28px_rgba(124,58,46,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3127] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p className="text-center text-sm text-black/60">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-[#7C3A2E] hover:underline">
                    Log In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Legal modal */}
      <LegalModal
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab={legalTab}
        onAgree={() => {
          setError("");
          setAcceptedLegal(true); // Auto-check after clicking "I Agree".
        }}
      />
    </div>
  );
}
