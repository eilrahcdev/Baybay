import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthProvider";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutPurpose from "../components/AboutPurpose";
import Artisan from "../components/Artisan";
import Shows from "../components/Shows";
import Team from "../components/Team";
import Footer from "../components/Footer";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import AuthGateModal from "../components/AuthGateModal";

export default function HomePage({
  featured = [],
  loadingProducts = false,
  team = [],
  loadingTeam = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Auth gate modal state is managed only in HomePage.
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);

  // Load featured artisans from the API.
  const [artisans, setArtisans] = useState([]);
  const [loadingArtisans, setLoadingArtisans] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadArtisans() {
      try {
        setLoadingArtisans(true);
        const featured = await api.artisansFeatured();
        if (!alive) return;

        const featuredList = Array.isArray(featured) ? featured : [];
        if (featuredList.length > 0) {
          setArtisans(featuredList);
          return;
        }

        const all = await api.artisansAll();
        if (!alive) return;
        setArtisans(Array.isArray(all) ? all.slice(0, 8) : []);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setArtisans([]);
      } finally {
        if (!alive) return;
        setLoadingArtisans(false);
      }
    }

    loadArtisans();
    return () => {
      alive = false;
    };
  }, []);

  // If redirected here by auth gate, reopen the modal.
  useEffect(() => {
    const gate = location.state?.authGate;
    if (!gate?.from) return;

    // Open modal and remember target path.
    setRedirectTo(gate.from);
    setAuthModalOpen(true);

    // Clear router state to avoid reopening on refresh/back.
    navigate("/", { replace: true, state: {} });
  }, [location.state, navigate]);

  // Helper to gate protected navigation from HomePage.
  const goProtected = (path) => {
    if (!user) {
      setRedirectTo(path);
      setAuthModalOpen(true);
      return;
    }
    navigate(path);
  };

  return (
    <>
      <Navbar />
      <Hero />
      <Artisan
        artisans={artisans}
        loading={loadingArtisans}
        onViewDetails={(artisanId) =>
          goProtected(`/artisans/${encodeURIComponent(String(artisanId))}`)
        }
      />
      <AboutPurpose />

      <Shows
        featured={featured}
        loading={loadingProducts}
        onQuickView={(p) => setQuickViewProduct(p)}
        onViewAll={() => goProtected("/products")}
      />

      <Team team={team} loading={loadingTeam} />

      {/* Auth modal is rendered only on HomePage. */}
      <AuthGateModal
        open={authModalOpen}
        title="Sign up or log in first to continue"
        message="You must be logged in to view artisan details and all products."
        onClose={() => {
          setAuthModalOpen(false);
          setRedirectTo(null);
        }}
        onLogin={() => {
          navigate("/login", {
            state: { from: redirectTo || "/" },
          });
        }}
        onSignup={() => {
          navigate("/signup", {
            state: { from: redirectTo || "/" },
          });
        }}
      />

      <Footer />

      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
