import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";

const router = Router();

/**
 * GET /api/products?limit=8
 * Reads from the Supabase "products" table.
 */
router.get("/products", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "8", 10), 200);

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return res.status(400).json({ message: error.message });
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/artisans?featured=true
 */
router.get("/artisans", async (req, res) => {
  try {
    const featured = String(req.query.featured || "").toLowerCase() === "true";

    let q = supabaseAdmin.from("artisans").select("*");

    if (featured) q = q.eq("is_featured", true);

    q = q.order("created_at", { ascending: false });

    const { data, error } = await q;

    if (error) return res.status(400).json({ message: error.message });
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/product-variants?product_id=36
 * Reads from the Supabase "product_variants" table.
 */
router.get("/product-variants", async (req, res) => {
  try {
    const productIdRaw = req.query.product_id;
    const productId = productIdRaw ? Number(productIdRaw) : null;

    if (!productId || Number.isNaN(productId)) {
      return res.status(400).json({ message: "product_id is required and must be a number" });
    }

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_available", true)
      .order("weight_kg", { ascending: true });

    if (error) return res.status(400).json({ message: error.message });
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/team
 */
router.get("/team", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("team")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ message: error.message });
    return res.json(data || []);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/search?q=keyword
 * Case-insensitive partial-word search for products and artisans.
 */
router.get("/search", async (req, res) => {
  try {
    const raw = String(req.query.q || "").trim();
    if (!raw) {
      return res.json({ products: [], artisans: [] });
    }

    // Normalize spacing and lowercase.
    const normalized = raw.replace(/\s+/g, " ").toLowerCase();

    // Split into words and keep terms with at least 2 characters.
    const terms = normalized
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    if (terms.length === 0) {
      return res.json({ products: [], artisans: [] });
    }

    const esc = (s) => s.replaceAll(",", "%2C");

    // Build product filters.
    const productFilters = [];
    for (const word of terms) {
      const like = esc(`%${word}%`);
      productFilters.push(`name.ilike.${like}`);
      productFilters.push(`description.ilike.${like}`);
      productFilters.push(`category.ilike.${like}`);
    }

    // Build artisan filters.
    const artisanFilters = [];
    for (const word of terms) {
      const like = esc(`%${word}%`);
      artisanFilters.push(`name.ilike.${like}`);
      artisanFilters.push(`title.ilike.${like}`);
      artisanFilters.push(`bio.ilike.${like}`);
    }

    const [pRes, aRes] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("id,name,description,image_url,price,category")
        .or(productFilters.join(","))
        .limit(12),

      supabaseAdmin
        .from("artisans")
        .select("id,name,title,bio,image_url")
        .or(artisanFilters.join(","))
        .limit(12),
    ]);

    if (pRes.error) {
      return res.status(400).json({ message: pRes.error.message });
    }

    if (aRes.error) {
      return res.status(400).json({ message: aRes.error.message });
    }

    return res.json({
      products: pRes.data || [],
      artisans: aRes.data || [],
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

export default router;
