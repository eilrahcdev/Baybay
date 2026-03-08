import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { api } from "./lib/api";
import { useReveal } from "./hooks/useReveal";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ArtisanPage from "./pages/ArtisanPage";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AuthCallback from "./pages/AuthCallback"; // Route for email link callbacks.

import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  useReveal();

  const [products, setProducts] = useState([]);
  const [team, setTeam] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoadingProducts(true);
        setLoadingTeam(true);

        const [p, t] = await Promise.all([api.products({ limit: 200 }), api.team()]);

        if (!alive) return;

        setProducts(Array.isArray(p) ? p : []);
        setTeam(Array.isArray(t) ? t : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!alive) return;
        setLoadingProducts(false);
        setLoadingTeam(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    return (products || []).filter((p) => p?.is_featured === true).slice(0, 5);
  }, [products]);

  const productsByCategory = useMemo(() => {
    const groups = {};
    for (const p of products || []) {
      const cat = (p?.category || "Uncategorized").trim();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    }
    return groups;
  }, [products]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            featured={featuredProducts}
            loadingProducts={loadingProducts}
            team={team}
            loadingTeam={loadingTeam}
          />
        }
      />

      {/* Protected routes */}
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage categories={productsByCategory} loading={loadingProducts} />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/artisans/:artisanId"
        element={
          <ProtectedRoute>
            <ArtisanPage />
          </ProtectedRoute>
        }
      />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Email link callback route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
