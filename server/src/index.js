import "./env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import publicRoutes from "./routes/public.routes.js";
import authRoutes from "./routes/auth.routes.js";
import authOtpRoutes from "./routes/authOtp.routes.js";
import { ensureMongoIndexes } from "./mongo.js";

const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, "../uploads"));

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "https://baybay-mu.vercel.app",
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.get("/", (req, res) => {
  res.send("Baybay API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", authOtpRoutes);
app.use("/api", publicRoutes);

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureMongoIndexes();
    console.log("Mongo indexes ready");
  } catch (error) {
    console.error("Mongo initialization warning:", error?.message || error);
  }

  app.listen(port, () => {
    console.log(`Server running on ${port}`);
    console.log(`Uploads directory: ${uploadsDir}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error?.message || error);
  process.exit(1);
});