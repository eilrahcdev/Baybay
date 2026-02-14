import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js"; 
import authOtpRoutes from "./routes/authOtp.routes.js";


dotenv.config();

const app = express();

/* ==============================
   MIDDLEWARE
============================== */
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: false, // change to true if you use cookies later
  })
);

app.use(express.json());

/* ==============================
   HEALTH CHECK
============================== */
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

/* ==============================
   ROUTES
============================== */

// 🔐 Auth Routes
app.use("/api/auth", authRoutes);

// 🌐 Public Routes
app.use("/api", publicRoutes);

/* ==============================
   START SERVER
============================== */
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ API running on http://localhost:${port}`);
});

app.use("/api", publicRoutes);
app.use("/api", authOtpRoutes);
