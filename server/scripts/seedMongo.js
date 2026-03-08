import "../src/env.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureMongoIndexes, getCollections, getDb } from "../src/mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

const DEFAULT_PRODUCTS_CSV = "c:\\Users\\charlie\\Downloads\\products_rows.csv";
const DEFAULT_PRODUCT_VARIANTS_CSV = "c:\\Users\\charlie\\Downloads\\product_variants_rows.csv";
const DEFAULT_ARTISANS_CSV = "c:\\Users\\charlie\\Downloads\\artisans_rows.csv";
const DEFAULT_TIKTOK_VIDEOS_CSV = "c:\\Users\\charlie\\Downloads\\tiktok_videos_rows.csv";
const DEFAULT_IMAGE_SOURCE_DIRS =
  "c:\\Users\\charlie\\Downloads\\baybay images;c:\\Users\\charlie\\Downloads\\baybay image";

const CSV_PRODUCTS_PATH = process.env.SEED_PRODUCTS_CSV || DEFAULT_PRODUCTS_CSV;
const CSV_PRODUCT_VARIANTS_PATH =
  process.env.SEED_PRODUCT_VARIANTS_CSV || DEFAULT_PRODUCT_VARIANTS_CSV;
const CSV_ARTISANS_PATH = process.env.SEED_ARTISANS_CSV || DEFAULT_ARTISANS_CSV;
const CSV_TIKTOK_VIDEOS_PATH = process.env.SEED_TIKTOK_VIDEOS_CSV || DEFAULT_TIKTOK_VIDEOS_CSV;

const PRUNE_MISSING = String(process.env.SEED_PRUNE_MISSING || "true").toLowerCase() === "true";

const uploadsRoot = path.resolve(process.env.UPLOADS_DIR || path.join(serverRoot, "uploads"));
const productUploadsDir = path.join(uploadsRoot, "products");
const artisanUploadsDir = path.join(uploadsRoot, "artisans");
const teamUploadsDir = path.join(uploadsRoot, "team");

const imageSourceDirs = String(process.env.SEED_IMAGE_SOURCE_DIRS || DEFAULT_IMAGE_SOURCE_DIRS)
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const now = new Date();
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"]);

const fallbackNewsletterSeed = [
  {
    email: "updates@baybay.local",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i];

    if (ch === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n" && !inQuotes) {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function rowsToObjects(csvText) {
  const rows = parseCsvRows(csvText).filter((r) => r.some((x) => String(x || "").trim() !== ""));
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h || "").trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    for (let i = 0; i < headers.length; i += 1) {
      obj[headers[i]] = String(r[i] ?? "").trim();
    }
    return obj;
  });
}

function toNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return false;
  return raw === "true" || raw === "1" || raw === "yes";
}

function toDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return new Date();
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? new Date() : dt;
}

function toNullableString(value) {
  const raw = String(value ?? "").trim();
  return raw || null;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeKey(value) {
  return normalizeWhitespace(String(value || ""))
    .replace(/%20/g, " ")
    .toLowerCase();
}

async function loadCsvObjects(filePath, label) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const rows = rowsToObjects(content);
    if (rows.length === 0) {
      throw new Error(`${label}: file is empty or invalid CSV`);
    }
    return rows;
  } catch (error) {
    throw new Error(`${label}: failed to read CSV at "${filePath}" (${error.message})`);
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectImageFiles(rootDir) {
  const files = [];
  if (!(await pathExists(rootDir))) return files;

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function buildImageIndex(sourceDirs) {
  const byFileName = new Map();
  const byBaseName = new Map();
  const files = [];

  for (const dir of sourceDirs) {
    const discovered = await collectImageFiles(dir);
    for (const filePath of discovered) {
      files.push(filePath);
      const fileName = path.basename(filePath);
      const fileNameKey = normalizeKey(fileName);
      const baseNameKey = normalizeKey(path.parse(fileName).name);
      if (!byFileName.has(fileNameKey)) byFileName.set(fileNameKey, filePath);
      if (!byBaseName.has(baseNameKey)) byBaseName.set(baseNameKey, filePath);
    }
  }

  return { byFileName, byBaseName, files };
}

function extractFileNameFromUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return decodeURIComponent(path.posix.basename(url.pathname));
  } catch {
    try {
      return decodeURIComponent(path.basename(raw));
    } catch {
      return path.basename(raw);
    }
  }
}

function toPosixPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

async function resolveLocalImagePath(value, imageIndex) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if ((raw.startsWith("C:\\") || raw.startsWith("c:\\")) && (await pathExists(raw))) {
    return raw;
  }

  const fileName = extractFileNameFromUrl(raw);
  if (!fileName) return null;

  const fileNameKey = normalizeKey(fileName);
  const baseNameKey = normalizeKey(path.parse(fileName).name);

  if (imageIndex.byFileName.has(fileNameKey)) return imageIndex.byFileName.get(fileNameKey);
  if (imageIndex.byBaseName.has(baseNameKey)) return imageIndex.byBaseName.get(baseNameKey);
  return null;
}

async function copyImageToUploads(sourcePath, targetDir, targetBaseName) {
  await fs.mkdir(targetDir, { recursive: true });

  const ext = path.extname(sourcePath).toLowerCase() || ".jpg";
  const fileName = `${targetBaseName}${ext}`;
  const destinationPath = path.join(targetDir, fileName);
  await fs.copyFile(sourcePath, destinationPath);

  const relative = path.relative(uploadsRoot, destinationPath);
  return `/uploads/${toPosixPath(relative)}`;
}

async function mapProducts(rows, imageIndex) {
  const docs = [];
  const missingImages = [];
  let copiedImages = 0;

  for (const row of rows) {
    const id = toNumber(row.id);
    if (id == null) continue;

    const imageSourcePath = await resolveLocalImagePath(row.image_url, imageIndex);
    let imageUrl = toNullableString(row.image_url);

    if (imageSourcePath) {
      const slug = slugify(row.name || `product-${id}`);
      imageUrl = await copyImageToUploads(imageSourcePath, productUploadsDir, `product-${id}-${slug}`);
      copiedImages += 1;
    } else if (imageUrl) {
      missingImages.push({ id, image_url: imageUrl });
    }

    docs.push({
      id,
      name: toNullableString(row.name) || "Product",
      category: toNullableString(row.category) || "Uncategorized",
      price: toNumber(row.price) ?? 0,
      description: toNullableString(row.description) || "",
      image_url: imageUrl,
      is_featured: toBoolean(row.is_featured),
      created_at: toDate(row.created_at),
      price_unit: toNullableString(row.price_unit),
    });
  }

  return { docs, copiedImages, missingImages };
}

function mapProductVariants(rows) {
  return rows
    .map((row) => {
      const id = toNumber(row.id);
      if (id == null) return null;

      return {
        id,
        product_id: toNumber(row.product_id) ?? toNullableString(row.product_id),
        variant_name: toNullableString(row.variant_name) || "Variant",
        weight_kg: toNumber(row.weight_kg),
        price: toNumber(row.price) ?? 0,
        is_available: toBoolean(row.is_available),
        created_at: toDate(row.created_at),
      };
    })
    .filter(Boolean);
}

async function mapArtisans(rows, imageIndex) {
  const docs = [];
  const missingImages = [];
  let copiedImages = 0;

  for (const row of rows) {
    const id = toNumber(row.id);
    if (id == null) continue;

    const imageSourcePath = await resolveLocalImagePath(row.image_url, imageIndex);
    let imageUrl = toNullableString(row.image_url);
    if (imageSourcePath) {
      const slug = slugify(row.name || `artisan-${id}`);
      imageUrl = await copyImageToUploads(imageSourcePath, artisanUploadsDir, `artisan-${id}-${slug}`);
      copiedImages += 1;
    } else if (imageUrl) {
      missingImages.push({ id, image_url: imageUrl });
    }

    docs.push({
      id,
      name: toNullableString(row.name) || "Artisan",
      title: toNullableString(row.title) || "Local Artisan",
      bio: toNullableString(row.bio) || "",
      image_url: imageUrl,
      is_featured: toBoolean(row.is_featured),
      created_at: toDate(row.created_at),
      artisan_id: toNumber(row.artisan_id) ?? toNullableString(row.artisan_id),
      facebook_url: toNullableString(row.facebook_url),
    });
  }

  return { docs, copiedImages, missingImages };
}

function mapTiktokVideos(rows) {
  return rows
    .map((row) => {
      const id = toNumber(row.id);
      if (id == null) return null;

      return {
        id,
        title: normalizeWhitespace(row.title) || "TikTok Video",
        video_url: toNullableString(row.video_url),
        is_featured: toBoolean(row.is_featured),
        is_active: toBoolean(row.is_active),
        created_at: toDate(row.created_at),
      };
    })
    .filter(Boolean);
}

async function buildTeamSeed(imageIndex) {
  const teamFiles = imageIndex.files
    .filter((f) => /^team(?:\s*\d+)?\.(jpg|jpeg|png|webp|gif)$/i.test(path.basename(f)))
    .sort((a, b) =>
      path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true })
    );

  if (teamFiles.length === 0) {
    return {
      docs: [
        {
          id: 1,
          title: "Baybay Team",
          team_image: null,
          created_at: now,
        },
      ],
      copiedImages: 0,
      missingImages: [],
    };
  }

  const docs = [];
  for (let i = 0; i < teamFiles.length; i += 1) {
    const source = teamFiles[i];
    const id = i + 1;
    const teamImage = await copyImageToUploads(source, teamUploadsDir, `team-${id}`);
    docs.push({
      id,
      title: `Baybay Team ${id}`,
      team_image: teamImage,
      created_at: now,
    });
  }

  return { docs, copiedImages: teamFiles.length, missingImages: [] };
}

async function upsertById(collection, docs) {
  for (const doc of docs) {
    await collection.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
  }
}

async function upsertByEmail(collection, docs) {
  for (const doc of docs) {
    const cleanEmail = String(doc.email || "").trim().toLowerCase();
    if (!cleanEmail) continue;
    await collection.updateOne(
      { email: cleanEmail },
      { $set: { ...doc, email: cleanEmail } },
      { upsert: true }
    );
  }
}

async function countByIds(collection, ids) {
  return collection.countDocuments({ id: { $in: ids } });
}

async function pruneByIds(collection, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const result = await collection.deleteMany({ id: { $nin: ids } });
  return result?.deletedCount || 0;
}

async function run() {
  const db = await getDb();
  await ensureMongoIndexes();

  const productsRows = await loadCsvObjects(CSV_PRODUCTS_PATH, "products_rows.csv");
  const productVariantsRows = await loadCsvObjects(
    CSV_PRODUCT_VARIANTS_PATH,
    "product_variants_rows.csv"
  );
  const artisansRows = await loadCsvObjects(CSV_ARTISANS_PATH, "artisans_rows.csv");
  const tiktokVideosRows = await loadCsvObjects(CSV_TIKTOK_VIDEOS_PATH, "tiktok_videos_rows.csv");

  const imageIndex = await buildImageIndex(imageSourceDirs);
  const productsMapped = await mapProducts(productsRows, imageIndex);
  const artisansMapped = await mapArtisans(artisansRows, imageIndex);
  const teamMapped = await buildTeamSeed(imageIndex);
  const productVariantsSeed = mapProductVariants(productVariantsRows);
  const tiktokVideosSeed = mapTiktokVideos(tiktokVideosRows);

  const productsSeed = productsMapped.docs;
  const artisansSeed = artisansMapped.docs;
  const teamSeed = teamMapped.docs;

  const { products, productVariants, artisans, tiktokVideos, team, newsletterSubscribers } =
    await getCollections();

  await upsertById(products, productsSeed);
  await upsertById(productVariants, productVariantsSeed);
  await upsertById(artisans, artisansSeed);
  await upsertById(tiktokVideos, tiktokVideosSeed);
  await upsertById(team, teamSeed);
  await upsertByEmail(newsletterSubscribers, fallbackNewsletterSeed);

  let pruned = {
    products: 0,
    product_variants: 0,
    artisans: 0,
    tiktok_videos: 0,
    team: 0,
  };

  if (PRUNE_MISSING) {
    pruned = {
      products: await pruneByIds(products, productsSeed.map((x) => x.id)),
      product_variants: await pruneByIds(productVariants, productVariantsSeed.map((x) => x.id)),
      artisans: await pruneByIds(artisans, artisansSeed.map((x) => x.id)),
      tiktok_videos: await pruneByIds(tiktokVideos, tiktokVideosSeed.map((x) => x.id)),
      team: await pruneByIds(team, teamSeed.map((x) => x.id)),
    };
  }

  const result = {
    db: db.databaseName,
    uploads_root: uploadsRoot,
    source_csv: {
      products: CSV_PRODUCTS_PATH,
      product_variants: CSV_PRODUCT_VARIANTS_PATH,
      artisans: CSV_ARTISANS_PATH,
      tiktok_videos: CSV_TIKTOK_VIDEOS_PATH,
    },
    image_source_dirs: imageSourceDirs,
    source_rows: {
      products: productsRows.length,
      product_variants: productVariantsRows.length,
      artisans: artisansRows.length,
      tiktok_videos: tiktokVideosRows.length,
    },
    imported: {
      products: productsSeed.length,
      product_variants: productVariantsSeed.length,
      artisans: artisansSeed.length,
      tiktok_videos: tiktokVideosSeed.length,
      team: teamSeed.length,
    },
    images: {
      product_images_copied: productsMapped.copiedImages,
      artisan_images_copied: artisansMapped.copiedImages,
      team_images_copied: teamMapped.copiedImages,
      product_images_missing: productsMapped.missingImages.length,
      artisan_images_missing: artisansMapped.missingImages.length,
    },
    prune_missing: {
      enabled: PRUNE_MISSING,
      deleted: pruned,
    },
    collections: {
      products: await countByIds(products, productsSeed.map((x) => x.id)),
      product_variants: await countByIds(productVariants, productVariantsSeed.map((x) => x.id)),
      artisans: await countByIds(artisans, artisansSeed.map((x) => x.id)),
      tiktok_videos: await countByIds(tiktokVideos, tiktokVideosSeed.map((x) => x.id)),
      team: await countByIds(team, teamSeed.map((x) => x.id)),
      newsletter_subscribers: await newsletterSubscribers.countDocuments({
        email: { $in: fallbackNewsletterSeed.map((x) => x.email) },
      }),
    },
  };

  console.log("SEED_OK", JSON.stringify(result));
  process.exit(0);
}

run().catch((error) => {
  console.error("SEED_FAILED", error?.message || error);
  process.exit(1);
});
