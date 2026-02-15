import "./env.js"; // IMPORTANT: loads server/.env reliably

import express from "express";
import cors from "cors";
import helmet from "helmet";

import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authOtpRoutes from "./routes/authOtp.routes.js";

const app = express();

/* ==============================
   MIDDLEWARE
============================== */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: false,
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
app.use("/api/auth", authRoutes);
app.use("/api", authOtpRoutes);
app.use("/api", publicRoutes);

/* ==============================
   START SERVER
============================== */
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://baybay-2m9pb1ywr-eilrachs-projects.vercel.app/ "
  ],
  credentials: true
}));
