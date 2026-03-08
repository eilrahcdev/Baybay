import "./env.js"; // Load server/.env from the server folder.

import express from "express";
import cors from "cors";
import helmet from "helmet";

import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authOtpRoutes from "./routes/authOtp.routes.js";

const app = express();

/* Middleware */
app.use(helmet());
app.use(express.json());

// Central CORS config
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "https://baybay-mu.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests without an Origin header (Postman/curl).
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // Keep true if you use cookies/auth.
  })
);

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.get("/", (req, res) => {
  res.send("Baybay API is running");
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api", authOtpRoutes);
app.use("/api", publicRoutes);

/* Start server */
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
