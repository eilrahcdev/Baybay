import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import AuthGateModal from "../components/AuthGateModal";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  // Show the modal when user is not logged in.
  useEffect(() => {
    if (!loading && !user) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [loading, user]);

  // Show loader while session is being checked.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border border-black/10 animate-pulse" />
          <p className="mt-3 text-sm text-black/60">Checking session…</p>
        </div>
      </div>
    );
  }

  // Allow access for authenticated users.
  if (user) return children;

  // Block protected page for guests and show the modal.
  return (
    <>
      {/* Simple blocked-page background */}
      <div className="min-h-screen bg-[#FDF8F4]" />

      <AuthGateModal
        open={open}
        title="Sign up or log in first to continue"
        message="You must be logged in to view artisan details and all products."
        onClose={() => {
          setOpen(false);
          // Send user back home after closing the modal.
          navigate("/", { replace: true });
        }}
        onLogin={() => {
          navigate("/login", {
            replace: true,
            state: { from: location.pathname + location.search },
          });
        }}
      />
    </>
  );
}
