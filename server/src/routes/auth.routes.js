import express from "express";
import { supabase } from "../supabase.js";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * body: { full_name, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email, password are required" });
    }

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name }, // saved to raw_user_meta_data; trigger will use this
      },
    });

    if (error) return res.status(400).json({ message: error.message });

    // Optional: ensure profile exists (trigger should handle this)
    // If you want to force it server-side (safe via service role):
    if (data?.user?.id) {
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: data.user.id, full_name, email }, { onConflict: "id" });
    }

    return res.status(201).json({
      message: "Signup successful",
      user: data.user,
      session: data.session, // may be null if email confirmation is enabled
    });
  } catch (e) {
    return res.status(500).json({ message: "Signup failed" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ message: error.message });

    return res.json({
      message: "Login successful",
      user: data.user,
      session: data.session, // contains access_token
    });
  } catch (e) {
    return res.status(500).json({ message: "Login failed" });
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <access_token>
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Fetch profile using admin (or user token + RLS)
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", userId)
      .single();

    if (error) return res.status(400).json({ message: error.message });

    return res.json({ user: req.user, profile });
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
