import { useState } from "react";
import { Link } from "react-router-dom";
import baybayLogo from "../assets/baybay logo.png";
import { api } from "../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const submitNewsletter = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFeedback("Please enter your email address.");
      return;
    }

    try {
      setSubmitting(true);
      setFeedback("");
      await api.subscribeNewsletter({ email: cleanEmail });
      setEmail("");
      setFeedback("Thanks! You are subscribed to our newsletter.");
    } catch (error) {
      setFeedback("We could not subscribe you right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-[#7C3A2E]/15 bg-[#211210] pt-14 pb-8 text-white">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-10 rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + Description */}
          <div>
            <img
              src={baybayLogo}
              alt="Baybay Logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-300">
              Empowering Pangasinan&apos;s local artisans by bringing their stories and crafts to the world.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">
              Products
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a className="hover:text-white transition" href="#products">
                  Featured Products
                </a>
              </li>
              <li>
                <Link className="hover:text-white transition" to="/products">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a className="hover:text-white transition" href="#about">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-white transition" href="#team">
                  Our Team
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">
              Newsletter
            </h4>
            <p className="mb-4 text-sm text-gray-300">
              Subscribe to get updates on new artisans and products.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={submitNewsletter}
            >
              <label className="sr-only" htmlFor="newsletter-email">Email</label>
              <input
                id="newsletter-email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#7C3A2E]"
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting}
                className="whitespace-nowrap rounded-xl bg-[#7C3A2E] px-5 py-2 text-sm font-semibold transition hover:bg-[#5e2b22]"
              >
                {submitting ? "Saving..." : "Subscribe"}
              </button>
            </form>
            {feedback ? <p className="mt-3 text-xs text-gray-300">{feedback}</p> : null}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} BAYBAY. All rights reserved.</p>
          <p className="text-gray-500">Made for Pangasinan artisans.</p>
        </div>
      </div>
    </footer>
  );
}
