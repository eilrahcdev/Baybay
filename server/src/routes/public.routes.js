import express from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { newsletterSchema } from "../validators.js";

const router = express.Router();

// Health
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "baybay-api" });
});

// Products
router.get("/products", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "12", 10), 50);
  const featured = req.query.featured === "true";

  let query = supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featured) query = query.eq("is_featured", true);

  const { data, error } = await query;

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Featured artisan (or list)
router.get("/artisans", async (req, res) => {
  const featured = req.query.featured === "true";

  let query = supabaseAdmin
    .from("artisans")
    .select("*")
    .order("created_at", { ascending: false });

  if (featured) query = query.eq("is_featured", true).limit(1);

  const { data, error } = await query;

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Team
router.get("/team", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Impact stats
router.get("/impact", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("impact_stats")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Newsletter subscribe
router.post("/newsletter/subscribe", async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const email = parsed.data.email.toLowerCase();

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .insert([{ email }]);

  // If duplicate, return friendly success
  if (error?.message?.toLowerCase().includes("duplicate") || error?.code === "23505") {
    return res.json({ ok: true, message: "You are already subscribed." });
  }

  if (error) return res.status(500).json({ message: error.message });
  res.json({ ok: true, message: "Subscribed successfully!" });
});

export default router;
