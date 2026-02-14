import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import logo from "../assets/baybay logo.png";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // 🔥 Listen to auth state
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔥 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    navigate("/");
  };

  // 🔥 Get initials
  const getInitials = () => {
    if (!user?.user_metadata?.full_name) return "U";

    const names = user.user_metadata.full_name.split(" ");
    return names.length > 1
      ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
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
        <div className="hidden md:flex items-center gap-20 ml-20">
          <a className="nav-link" href="#home">Home</a>
          <a className="nav-link" href="#shows">Products</a>
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="#team">Team</a>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 relative">

          {/* Search */}
          <div className="relative hidden lg:block">
            <input
              className="bg-[#5e2b22] text-white placeholder-orange-200 border border-orange-200/30 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-200 w-56 text-sm"
              placeholder="Search..."
              type="text"
            />
            <span className="material-icons absolute right-3 top-1.5 text-orange-200 text-lg">
              search
            </span>
          </div>

          {/* 🔥 IF NOT LOGGED IN */}
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

          {/* 🔥 IF LOGGED IN */}
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
                    <p className="font-semibold">
                      {user.user_metadata.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
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
            <span className="material-icons">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-6 py-4 flex flex-col gap-3">
            <a className="nav-link" href="#home" onClick={() => setOpen(false)}>Home</a>
            <a className="nav-link" href="#shows" onClick={() => setOpen(false)}>Products</a>
            <a className="nav-link" href="#about" onClick={() => setOpen(false)}>About</a>
            <a className="nav-link" href="#team" onClick={() => setOpen(false)}>Team</a>

            {!user && (
              <>
                <Link to="/login" className="text-white">Login</Link>
                <Link to="/signup" className="text-white">Sign Up</Link>
              </>
            )}

            {user && (
              <button onClick={handleLogout} className="text-red-300">
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
