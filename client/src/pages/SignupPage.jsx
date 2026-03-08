import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CircleCheck,
  CircleX,
  Mail,
  X,
  FileText,
  Shield,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { TERMS_CONTENT, PRIVACY_CONTENT } from "../components/LegalContent";

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
    3: { label: "Good", hint: "Nice — add a symbol for extra strength." },
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

      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-[#7C3A2E]/10 p-2 border border-[#7C3A2E]/15">
              {tab === "terms" ? (
                <FileText className="text-[#7C3A2E]" size={18} />
              ) : (
                <Shield className="text-[#7C3A2E]" size={18} />
              )}
            </div>
            <div>
              <p className="font-semibold text-[#7C3A2E] leading-tight">
                {tab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </p>
              <p className="text-xs text-black/55">
                Scroll to the bottom to enable “I Agree”.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-black/50 hover:text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-6 pt-4">
          <div className="inline-flex rounded-2xl bg-black/5 p-1 border border-black/10">
            <button
              type="button"
              onClick={() => setTab("terms")}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition",
                tab === "terms"
                  ? "bg-white shadow-sm text-[#7C3A2E] border border-black/10"
                  : "text-black/60 hover:text-black",
              ].join(" ")}
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setTab("privacy")}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition",
                tab === "privacy"
                  ? "bg-white shadow-sm text-[#7C3A2E] border border-black/10"
                  : "text-black/60 hover:text-black",
              ].join(" ")}
            >
              Privacy
            </button>
          </div>
        </div>

        {/* Body (scroll area) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="px-5 sm:px-6 py-4 max-h-[60vh] overflow-auto"
        >
          {tab === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-black/10 bg-black/[0.02] flex items-center justify-between gap-3">
          <p className="text-xs text-black/55">
            {canAgree ? "You can agree now." : "Scroll to the bottom to continue."}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5 transition"
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
              className="rounded-xl bg-[#7C3A2E] px-4 py-2 text-sm font-semibold text-white shadow-sm
                         hover:bg-[#6b3127] transition disabled:opacity-60 disabled:cursor-not-allowed"
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

  const redirectTo = `${
    import.meta.env.VITE_SITE_URL || "http://localhost:5173"
  }/login`;

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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) return setError("Please enter your full name.");
    if (!cleanEmail) return setError("Please enter your email.");
    if (!password) return setError("Please enter a password.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!acceptedLegal)
      return setError("Please accept the Terms & Conditions and Privacy Policy.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: cleanName },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Enter your email first.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) return setError(error.message);
      setSent(true);
    } catch {
      setError("Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* Left image */}
      <div className="relative hidden lg:block">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3sEtA9VSN7qPvfv_YSMnxp7BpkOE3F522AH82n7mpA5aYVhcCxRnh_UmC0EtloCxmtacFvNON3KqvCT_IuPtD2h18pj_z_5NGEpgaAma1Qc8bydCT2qBj46MUnLlu1nrnlkSgKiDp957cyhxfcEJKFVRJPsF6a1lgCFvTvZ6H3PA8mrNH9h9Gus3KmuZSWS4b5R5TGZqC0riU0QbYdMxZDNNuiCGzg-MxT6s4Cexa8V4drcWHk9D7uRGtAELPxgrKEpvfKPwANSk"
          alt="BAYBAY background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#7C3A2E]/65" />
        <div className="absolute inset-0 flex items-center justify-center px-10">
          <div className="max-w-md text-center text-white">
            <h1 className="font-display text-5xl leading-tight">
              Be Part of the <br /> Excellence
            </h1>
            <p className="mt-4 text-white/90 leading-relaxed">
              Your gateway to Pangasinan’s artisanal excellence awaits. Join a
              community fueled by culture, creativity, and craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Form card */}
          <div className="rounded-3xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.10)] p-6 sm:p-8">
            <h2 className="text-center font-display text-4xl text-[#7C3A2E]">
              Welcome to Baybay!
            </h2>
            <p className="mt-2 text-center text-sm text-black/60">
              Sign up to start exploring Pangasinan&apos;s atisans and their crafts.
            </p>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {sent ? (
              <div className="mt-6 rounded-2xl border border-[#7C3A2E]/20 bg-[#7C3A2E]/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm border border-black/5">
                    <Mail size={18} className="text-[#7C3A2E]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#7C3A2E]">Verify your email</p>
                    <p className="mt-1 text-sm text-black/65">
                      We sent a verification link to{" "}
                      <span className="font-medium">{email}</span>. Open it to
                      activate your account, then go back and log in.
                    </p>

                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={loading}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-[#7C3A2E]/20 bg-white px-4 py-2 text-sm font-semibold text-[#7C3A2E]
                                 hover:bg-[#7C3A2E]/5 transition disabled:opacity-60"
                    >
                      {loading ? "Resending..." : "Resend verification email"}
                    </button>

                    <p className="mt-4 text-sm text-black/60">
                      Already verified?{" "}
                      <Link
                        to="/login"
                        className="font-semibold text-[#7C3A2E] hover:underline"
                      >
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
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    placeholder="Juan Dela Cruz"
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none
                               focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="juandelacruz@gmail.com"
                    className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none
                               focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Password</label>
                  <div className="relative mt-2">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm outline-none
                                 focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 hover:text-[#7C3A2E]
                                 focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
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

                    <div className="mt-2 h-2 w-full rounded-full bg-black/10 overflow-hidden">
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

                    {password && (
                      <p className="mt-2 text-[11px] text-black/55">{strength.hint}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black/70">Confirm Password</label>

                  <div className="relative mt-2">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 pr-12 text-sm outline-none
                                 focus:border-[#7C3A2E] focus:ring-4 focus:ring-[#7C3A2E]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-black/50 hover:text-[#7C3A2E]
                                 focus:outline-none focus:ring-2 focus:ring-[#7C3A2E]/30"
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
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedLegal}
                      onChange={(e) => {
                        setError("");
                        setAcceptedLegal(e.target.checked);
                      }}
                      className="mt-1 h-4 w-4 rounded border-black/30 text-[#7C3A2E] focus:ring-[#7C3A2E]/30"
                    />
                    <span className="text-sm text-black/70 leading-relaxed">
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
                  className="w-full rounded-xl bg-[#7C3A2E] py-3 font-semibold text-white shadow-sm
                             hover:bg-[#6b3127] transition disabled:opacity-60 disabled:cursor-not-allowed"
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
