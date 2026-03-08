import "./env.js";
import { MongoClient } from "mongodb";

const uri = String(process.env.MONGODB_URI || "").trim();
const directUri = String(process.env.MONGODB_URI_DIRECT || "").trim();
const dbName = process.env.MONGODB_DB_NAME || "Baybay";

if (!uri && !directUri) {
  throw new Error("Missing MONGODB_URI (or MONGODB_URI_DIRECT) in server/.env");
}

const uriCandidates = directUri ? [directUri] : [uri].filter(Boolean);

let client = null;
let dbPromise;

function buildMongoErrorMessage(error) {
  const raw = String(error?.message || error || "");

  if (raw.includes("querySrv") || raw.includes("_mongodb._tcp")) {
    return [
      "MongoDB DNS SRV lookup failed (querySrv).",
      "Your network/DNS cannot resolve Atlas SRV records.",
      "Fix: use a standard Atlas connection string in MONGODB_URI_DIRECT (mongodb://...hosts...).",
      "In Atlas: Database > Connect > Drivers > 'Standard connection string (not DNS seed list)'.",
      `Original error: ${raw}`,
    ].join(" ");
  }

  if (raw.toLowerCase().includes("authentication failed")) {
    return [
      "MongoDB authentication failed.",
      "Check DB username/password and URL-encode special password characters.",
      `Original error: ${raw}`,
    ].join(" ");
  }

  return `MongoDB connection failed: ${raw}`;
}

async function connectWithUri(nextUri) {
  const nextClient = new MongoClient(nextUri, {
    serverSelectionTimeoutMS: 12000,
    connectTimeoutMS: 12000,
  });
  await nextClient.connect();
  client = nextClient;
  return nextClient.db(dbName);
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      let lastError;

      for (const candidate of uriCandidates) {
        try {
          return await connectWithUri(candidate);
        } catch (error) {
          lastError = error;
          try {
            await client?.close();
          } catch {
            // Ignore close errors while trying next URI.
          }
          client = null;
        }
      }

      throw new Error(buildMongoErrorMessage(lastError));
    })();
  }
  return dbPromise;
}

export async function getCollections() {
  const db = await getDb();
  return {
    users: db.collection("users"),
    emailOtps: db.collection("email_otps"),
    newsletterSubscribers: db.collection("newsletter_subscribers"),
    products: db.collection("products"),
    artisans: db.collection("artisans"),
    productVariants: db.collection("product_variants"),
    tiktokVideos: db.collection("tiktok_videos"),
    team: db.collection("team"),
  };
}

export async function ensureMongoIndexes() {
  const {
    users,
    emailOtps,
    newsletterSubscribers,
    products,
    artisans,
    productVariants,
    tiktokVideos,
    team,
  } =
    await getCollections();

  await Promise.all([
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),

    emailOtps.createIndex({ email: 1, purpose: 1, created_at: -1 }),
    emailOtps.createIndex(
      { email: 1, purpose: 1 },
      {
        unique: true,
        partialFilterExpression: { consumed_at: null },
      }
    ),
    emailOtps.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),

    newsletterSubscribers.createIndex({ email: 1 }, { unique: true }),
    newsletterSubscribers.createIndex({ created_at: -1 }),

    products.createIndex({ created_at: -1 }),
    artisans.createIndex({ is_featured: 1, created_at: -1 }),
    productVariants.createIndex({ product_id: 1, is_available: 1, weight_kg: 1 }),
    tiktokVideos.createIndex({ id: 1 }, { unique: true }),
    tiktokVideos.createIndex({ is_active: 1, is_featured: 1, created_at: -1 }),
    team.createIndex({ created_at: -1 }),
  ]);
}
