import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, X, Search } from "lucide-react";
import logo from "../assets/baybay logo.png";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthProvider";
import { resolveImageUrl } from "../lib/imageUrl";
import { INPUT_LIMITS, sanitizeSearchInput } from "../lib/inputValidation";

function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="surface-card relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-black/70 hover:text-black hover:bg-white"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#7C3A2E]">Confirm Log Out</h3>
            <p className="mt-2 text-sm text-black/60 leading-relaxed">
              Are you sure you want to log out of your account?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-[#7C3A2E] py-3 text-white font-semibold hover:bg-[#6b3127] transition"
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-black/15 py-3 font-semibold text-black/70 hover:bg-black/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState({ products: [], artisans: [] });
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  // Close search dropdown when clicking outside.
  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Close search dropdown on route change.
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  // Debounced search.
  useEffect(() => {
    const q = query.trim();

    // Reset state when query is empty.
    if (!q) {
      setResults({ products: [], artisans: [] });
      setNoResults(false);
      setSearchOpen(false);
      setSearchLoading(false);
      return;
    }

    setSearchOpen(true);
    setSearchLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.search(q);
        const products = Array.isArray(data?.products) ? data.products : [];
        const artisans = Array.isArray(data?.artisans) ? data.artisans : [];

        setResults({ products, artisans });
        setNoResults(products.length === 0 && artisans.length === 0);
      } catch (e) {
        console.error(e);
        setResults({ products: [], artisans: [] });
        setNoResults(true);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleLogoutConfirm = async () => {
    signOut();
    setLogoutOpen(false);
    setProfileOpen(false);
    setOpen(false);
    navigate("/", { replace: true });
  };

  const getInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.full_name || "";
    if (!fullName) return "U";
    const names = fullName.split(" ").filter(Boolean);
    return names.length > 1
      ? (names[0][0] + names[1][0]).toUpperCase()
      : names[0][0].toUpperCase();
  };

  const goToProductSearch = (q) => {
    // Navigate to Products page with current search query.
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const goToArtisan = (id) => {
    navigate(`/artisans/${id}`);
    setSearchOpen(false);
  };

  const totalHits = useMemo(
    () => (results.products?.length || 0) + (results.artisans?.length || 0),
    [results]
  );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#4b2018]/80 shadow-[0_12px_36px_rgba(34,17,12,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="BAYBAY logo"
              className="h-9 w-9 rounded-full object-cover border border-white/60"
            />
            <span className="text-white font-semibold tracking-wide hidden sm:block">
              BAYBAY
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1.5">
            <a className="nav-link rounded-full px-3 py-1.5 text-sm" href="#home">Home</a>
            <a className="nav-link rounded-full px-3 py-1.5 text-sm" href="#products">Products</a>
            <a className="nav-link rounded-full px-3 py-1.5 text-sm" href="#artisans">Artisan</a>
            <a className="nav-link rounded-full px-3 py-1.5 text-sm" href="#about">About</a>
            <a className="nav-link rounded-full px-3 py-1.5 text-sm" href="#team">Team</a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 relative">
            {/* Search input with dropdown */}
            <div className="relative hidden lg:block" ref={boxRef}>
                <input
                  value={query}
                  onChange={(e) => setQuery(sanitizeSearchInput(e.target.value))}
                  onFocus={() => {
                    if (query.trim()) setSearchOpen(true);
                  }}
                  className="w-56 rounded-full border border-white/20 bg-white/10 py-1.5 pl-4 pr-10 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Search products or artisans..."
                  type="text"
                  maxLength={INPUT_LIMITS.SEARCH_QUERY_MAX}
                />

              <span className="absolute right-3 top-1.5 text-white/80 text-lg">
                <Search size={18} />
              </span>

              {searchOpen && (
                <div className="absolute right-0 z-50 mt-3 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-black/10 bg-white/95 shadow-2xl backdrop-blur">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <p className="text-sm font-semibold text-black/70">
                      Results for <span className="text-black">{query.trim()}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearchOpen(false);
                      }}
                      className="text-xs font-semibold text-[#7C3A2E] hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {searchLoading ? (
                    <div className="p-4 space-y-2">
                      <div className="h-10 w-full rounded-xl bg-black/5 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-black/5 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-black/5 animate-pulse" />
                    </div>
                  ) : noResults ? (
                    <div className="p-5">
                      <p className="text-sm text-black/60">No results found.</p>
                    </div>
                  ) : (
                    <div className="max-h-[65vh] overflow-auto lg:max-h-[420px]">
                      {/* Artisans */}
                      {results.artisans?.length ? (
                        <div className="p-4 border-b">
                          <p className="text-xs font-semibold text-black/50 uppercase tracking-wide">
                            Artisans
                          </p>
                          <div className="mt-3 space-y-2">
                            {results.artisans.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => goToArtisan(a.id)}
                                className="w-full flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5 transition text-left"
                              >
                                <img
                                  src={resolveImageUrl(
                                    a.image_url || a.artisan_image || a.photo_url || a.avatar_url || a.image,
                                    "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=200"
                                  )}
                                  alt={a.name || "Artisan"}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-black/80 truncate">
                                    {a.full_name || "Artisan"}
                                  </p>
                                  <p className="text-xs text-black/50 truncate">
                                    {a.title || "Local Artisan"}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Products */}
                      {results.products?.length ? (
                        <div className="p-4">
                          <p className="text-xs font-semibold text-black/50 uppercase tracking-wide">
                            Products
                          </p>
                          <div className="mt-3 space-y-2">
                            {results.products.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => goToProductSearch(p.name || query.trim())}
                                className="w-full flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-black/5 transition text-left"
                              >
                                <img
                                  src={resolveImageUrl(
                                    p.image_url || p.product_image || p.image || p.img || p.photo_url,
                                    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200"
                                  )}
                                  alt={p.name || "Product"}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-black/80 truncate">
                                    {p.name || "Product"}
                                  </p>
                                  <p className="text-xs text-black/50 truncate">
                                    ₱{Number(p.price || 0).toLocaleString()}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => goToProductSearch(query.trim())}
                            className="mt-4 w-full rounded-xl bg-[#7C3A2E] py-2.5 text-sm font-semibold text-white hover:bg-[#6b3127] transition"
                          >
                            View all results in Products
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {!searchLoading && !noResults ? (
                    <div className="px-4 py-3 border-t text-xs text-black/45">
                      {totalHits} result{totalHits === 1 ? "" : "s"} found
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Guest actions */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="hidden w-24 items-center justify-center rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#7C3A2E] sm:inline-flex"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="hidden w-24 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7C3A2E] transition hover:bg-white/90 sm:inline-flex"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Logged-in actions */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/95 font-bold text-[#7C3A2E] shadow transition hover:scale-105"
                >
                  {getInitials()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl">
                    <div className="px-4 py-4 border-b">
                      <p className="font-semibold">
                        {user?.user_metadata?.full_name || user?.full_name || "User"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut size={18} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/25 p-2 text-white transition hover:bg-white/10 md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-icons">{open ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-white/10 md:hidden">
            <div className="flex flex-col gap-3 px-6 py-4">
              <a className="nav-link" href="#home" onClick={() => setOpen(false)}>Home</a>
              <a className="nav-link" href="#products" onClick={() => setOpen(false)}>Products</a>
              <a className="nav-link" href="#artisans" onClick={() => setOpen(false)}>Artisan</a>
              <a className="nav-link" href="#about" onClick={() => setOpen(false)}>About</a>
              <a className="nav-link" href="#team" onClick={() => setOpen(false)}>Team</a>

              {!user && (
                <>
                  <Link to="/login" className="text-white" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="text-white" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}

              {user && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="text-red-200 text-left"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
