import { Router } from "express";
import { getCollections } from "../mongo.js";
import { newsletterSchema } from "../validators.js";

const router = Router();

function withId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: rest.id ?? String(_id),
  };
}

function pickImageValue(row, keys = []) {
  for (const key of keys) {
    const value = String(row?.[key] || "").trim();
    if (value) return value;
  }
  return null;
}

function toPublicUrl(req, value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;

  const pathValue = raw.startsWith("/") ? raw : `/${raw}`;
  return encodeURI(pathValue);
}

function normalizeProduct(req, doc) {
  const row = withId(doc);
  const imageValue = pickImageValue(row, [
    "image_url",
    "product_image",
    "image",
    "img",
    "photo_url",
  ]);
  const imageUrl = toPublicUrl(req, imageValue);
  return {
    ...row,
    image_url: imageUrl,
    product_image: imageUrl,
  };
}

function normalizeArtisan(req, doc) {
  const row = withId(doc);
  const imageValue = pickImageValue(row, [
    "image_url",
    "artisan_image",
    "image",
    "img",
    "photo_url",
    "avatar_url",
  ]);
  const imageUrl = toPublicUrl(req, imageValue);
  return {
    ...row,
    image_url: imageUrl,
    artisan_image: imageUrl,
  };
}

function normalizeTeam(req, doc) {
  const row = withId(doc);
  const imageValue = pickImageValue(row, [
    "team_image",
    "image_url",
    "photo_url",
    "avatar_url",
  ]);
  const imageUrl = toPublicUrl(req, imageValue);
  return {
    ...row,
    team_image: imageUrl,
    image_url: imageUrl,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * POST /api/newsletter/subscribe
 * body: { email }
 */
router.post("/newsletter/subscribe", async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const { newsletterSubscribers } = await getCollections();
    const now = new Date();
    await newsletterSubscribers.updateOne(
      { email },
      {
        $set: {
          email,
          is_active: true,
          updated_at: now,
        },
        $setOnInsert: {
          created_at: now,
        },
      },
      { upsert: true }
    );

    return res.json({ ok: true, message: "Subscribed successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save newsletter subscription." });
  }
});

/**
 * GET /api/products?limit=8
 */
router.get("/products", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "8", 10), 200);
    const { products } = await getCollections();
    const rows = await products.find({}).sort({ created_at: -1 }).limit(limit).toArray();
    return res.json((rows || []).map((row) => normalizeProduct(req, row)));
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
    const { artisans } = await getCollections();
    const filter = featured ? { is_featured: true } : {};
    let rows = await artisans.find(filter).sort({ created_at: -1 }).toArray();

    // Fallback: if no featured records exist, return recent artisans so UI still works.
    if (featured && (!rows || rows.length === 0)) {
      rows = await artisans.find({}).sort({ created_at: -1 }).limit(8).toArray();
    }

    return res.json((rows || []).map((row) => normalizeArtisan(req, row)));
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/product-variants?product_id=36
 */
router.get("/product-variants", async (req, res) => {
  try {
    const productIdRaw = String(req.query.product_id || "").trim();
    if (!productIdRaw) {
      return res.status(400).json({ message: "product_id is required and must be a number" });
    }

    const numericId = Number(productIdRaw);
    const filter = Number.isNaN(numericId)
      ? { product_id: productIdRaw, is_available: true }
      : {
          $and: [
            {
              $or: [{ product_id: numericId }, { product_id: productIdRaw }],
            },
            { is_available: true },
          ],
        };

    const { productVariants } = await getCollections();
    const rows = await productVariants.find(filter).sort({ weight_kg: 1 }).toArray();
    const variants = (rows || []).map(withId);

    // Match Team-style image behavior: if variant has no image, inherit product image.
    const productIds = Array.from(
      new Set(
        variants
          .map((v) => String(v?.product_id || "").trim())
          .filter(Boolean)
      )
    );

    const productImageById = new Map();
    if (productIds.length > 0) {
      const { products } = await getCollections();
      const numericIds = productIds
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));

      const productRows = await products
        .find({
          $or: [
            { id: { $in: productIds } },
            { id: { $in: numericIds } },
          ],
        })
        .project({
          id: 1,
          image_url: 1,
          product_image: 1,
          image: 1,
          img: 1,
          photo_url: 1,
        })
        .toArray();

      for (const product of productRows || []) {
        const productId = String(product?.id || "").trim();
        if (!productId) continue;
        const imageValue = pickImageValue(product, [
          "image_url",
          "product_image",
          "image",
          "img",
          "photo_url",
        ]);
        const imageUrl = toPublicUrl(req, imageValue);
        if (!imageUrl) continue;
        productImageById.set(productId, imageUrl);
      }
    }

    return res.json(
      variants.map((variant) => {
        const ownImage = toPublicUrl(
          req,
          pickImageValue(variant, ["image_url", "image", "img", "photo_url"])
        );
        const inheritedImage = productImageById.get(String(variant?.product_id || "").trim()) || null;
        const imageUrl = ownImage || inheritedImage;
        return {
          ...variant,
          image_url: imageUrl,
          variant_image: imageUrl,
        };
      })
    );
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/team
 */
router.get("/team", async (req, res) => {
  try {
    const { team } = await getCollections();
    const rows = await team.find({}).sort({ created_at: -1 }).toArray();
    return res.json((rows || []).map((row) => normalizeTeam(req, row)));
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

/**
 * GET /api/tiktok-videos?featured=true&active=true
 */
router.get("/tiktok-videos", async (req, res) => {
  try {
    const onlyFeatured = String(req.query.featured || "").toLowerCase() === "true";
    const onlyActive = String(req.query.active || "true").toLowerCase() !== "false";
    const limit = Math.min(parseInt(req.query.limit || "12", 10), 100);

    const filter = {};
    if (onlyFeatured) filter.is_featured = true;
    if (onlyActive) filter.is_active = true;

    const { tiktokVideos } = await getCollections();
    const rows = await tiktokVideos.find(filter).sort({ created_at: -1 }).limit(limit).toArray();
    return res.json((rows || []).map(withId));
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

    const normalized = raw.replace(/\s+/g, " ").toLowerCase();
    const terms = normalized
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    if (terms.length === 0) {
      return res.json({ products: [], artisans: [] });
    }

    const productOr = [];
    const artisanOr = [];
    for (const word of terms) {
      const regex = new RegExp(escapeRegex(word), "i");
      productOr.push({ name: regex }, { description: regex }, { category: regex });
      artisanOr.push({ name: regex }, { full_name: regex }, { title: regex }, { bio: regex });
    }

    const { products, artisans } = await getCollections();
    const [productRows, artisanRows] = await Promise.all([
      products
        .find(
          { $or: productOr },
          {
            projection: {
              id: 1,
              name: 1,
              description: 1,
              image_url: 1,
              price: 1,
              category: 1,
            },
          }
        )
        .limit(12)
        .toArray(),
      artisans
        .find(
          { $or: artisanOr },
          {
            projection: {
              id: 1,
              name: 1,
              full_name: 1,
              title: 1,
              bio: 1,
              image_url: 1,
            },
          }
        )
        .limit(12)
        .toArray(),
    ]);

    return res.json({
      products: (productRows || []).map((row) => normalizeProduct(req, row)),
      artisans:
        (artisanRows || []).map((a) => ({
          ...normalizeArtisan(req, a),
          full_name: a.full_name || a.name || "",
        })) || [],
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

export default router;
