import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { api } from "./lib/api";
import { useReveal } from "./hooks/useReveal";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ArtisanPage from "./pages/ArtisanPage";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

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
      setLoadingProducts(true);
      setLoadingTeam(true);

      const [productsResult, teamResult] = await Promise.allSettled([
        api.products({ limit: 200 }),
        api.team(),
      ]);

      if (!alive) return;

      if (productsResult.status === "fulfilled") {
        setProducts(Array.isArray(productsResult.value) ? productsResult.value : []);
      } else {
        console.error("Failed to load products:", productsResult.reason);
        setProducts([]);
      }

      if (teamResult.status === "fulfilled") {
        setTeam(Array.isArray(teamResult.value) ? teamResult.value : []);
      } else {
        console.error("Failed to load team:", teamResult.reason);
        setTeam([]);
      }

      setLoadingProducts(false);
      setLoadingTeam(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const featured = list.filter((p) => p?.is_featured === true);
    if (featured.length > 0) return featured.slice(0, 6);
    return list.slice(0, 6);
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
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}
