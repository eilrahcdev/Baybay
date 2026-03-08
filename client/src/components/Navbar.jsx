import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, X, Search } from "lucide-react";
import logo from "../assets/baybay logo.png";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";

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
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-black/10">
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
  const [user, setUser] = useState(null);

  const [logoutOpen, setLogoutOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState({ products: [], artisans: [] });
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  // Listen to auth state.
  useEffect(() => {
    let alive = true;

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(data?.user ?? null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

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
    await supabase.auth.signOut();
    setLogoutOpen(false);
    setProfileOpen(false);
    setOpen(false);
    navigate("/", { replace: true });
  };

  const getInitials = () => {
    const fullName = user?.user_metadata?.full_name;
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
      <nav className="bg-[#7C3A2E] shadow-lg sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
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
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <a className="nav-link" href="#home">Home</a>
            <a className="nav-link" href="#products">Products</a>
            <a className="nav-link" href="#artisans">Artisan</a>
            <a className="nav-link" href="#about">About</a>
            <a className="nav-link" href="#team">Team</a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 relative">
            {/* Search input with dropdown */}
            <div className="relative hidden lg:block" ref={boxRef}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim()) setSearchOpen(true);
                }}
                className="bg-[#5e2b22] text-white placeholder-orange-200 border border-orange-200/30 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-200 w-56 text-sm"
                placeholder="Search products or artisans..."
                type="text"
              />

              <span className="absolute right-3 top-1.5 text-orange-200 text-lg">
                <Search size={18} />
              </span>

              {searchOpen && (
                <div className="absolute right-0 mt-3 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden z-50">
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
                    <div className="max-h-[420px] overflow-auto">
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
                                  src={
                                    a.image_url ||
                                    "https://images.unsplash.com/photo-1520975693416-35a3c5b84f41?w=200"
                                  }
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
                                  src={p.image_url || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200"}
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
                  className="hidden sm:inline-flex w-24 items-center justify-center rounded-full border border-white text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#7C3A2E] transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="hidden sm:inline-flex w-24 items-center justify-center rounded-full bg-white text-[#7C3A2E] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
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
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#7C3A2E] font-bold shadow hover:scale-105 transition"
                >
                  {getInitials()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-4 border-b">
                      <p className="font-semibold">{user.user_metadata.full_name}</p>
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
              className="md:hidden inline-flex items-center justify-center rounded-full border border-white/25 p-2 text-white hover:bg-white/10 transition"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-icons">{open ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-6 py-4 flex flex-col gap-3">
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
