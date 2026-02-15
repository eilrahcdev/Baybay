import { Link } from "react-router-dom";
import baybayLogo from "../assets/baybay logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#1E1B1A] text-white pt-14 pb-8 border-t border-gray-800">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo + Description */}
          <div>
            <img
              src={baybayLogo}
              alt="Baybay Logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering Pangasinan&apos;s local artisans by bringing their stories and crafts to the world.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4 text-orange-200">
              Products
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
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
            <ul className="space-y-2 text-sm text-gray-400">
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
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get updates on new artisans and products.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">Email</label>
              <input
                id="newsletter-email"
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-[#7C3A2E] text-sm outline-none"
                placeholder="Email Address"
                type="email"
              />
              <button
                type="submit"
                className="bg-[#7C3A2E] hover:bg-[#5e2b22] px-5 py-2 rounded-xl transition text-sm font-semibold whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} BAYBAY. All rights reserved.</p>
          <p className="text-gray-600">Made for Pangasinan artisans.</p>
        </div>
      </div>
    </footer>
  );
}
