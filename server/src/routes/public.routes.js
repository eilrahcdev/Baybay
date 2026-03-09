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

function getBaseUrl(req) {
  const explicitBaseUrl = String(process.env.PUBLIC_SERVER_URL || "").trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/, "");
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();

  const protocol = forwardedProto || req.protocol || "http";
  const host = req.get("host");

  if (!host) return "";
  return `${protocol}://${host}`;
}

function toPublicUrl(req, value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }

  const pathValue = raw.startsWith("/") ? raw : `/${raw}`;
  const encodedPath = encodeURI(pathValue);
  const baseUrl = getBaseUrl(req);

  return baseUrl ? `${baseUrl}${encodedPath}` : encodedPath;
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
  const tiktokUrl =
    String(
      row?.tiktok_url ||
        row?.tiktok_link ||
        row?.tiktok_video_url ||
        row?.video_url ||
        ""
    ).trim() || null;

  return {
    ...row,
    image_url: imageUrl,
    artisan_image: imageUrl,
    tiktok_url: tiktokUrl,
    tiktok_video_url: tiktokUrl,
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

const TRUTHY_VALUES = [true, "true", 1, "1", "yes", "TRUE"];

function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactMatchText(value) {
  return normalizeMatchText(value).replace(/[\s-]+/g, "");
}

function toKeySet(...values) {
  const set = new Set();
  for (const value of values) {
    const raw = String(value ?? "").trim();
    if (!raw) continue;
    set.add(raw);
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      set.add(String(asNumber));
    }
  }
  return set;
}

function findTiktokForArtisan(artisan, videos) {
  const list = Array.isArray(videos) ? videos : [];
  if (!artisan || list.length === 0) return null;

  const artisanTitleCompact = compactMatchText(artisan?.title);
  if (artisanTitleCompact) {
    const byTitle = list.find(
      (video) =>
        compactMatchText(video?.title) === artisanTitleCompact ||
        compactMatchText(video?.artisan_title) === artisanTitleCompact
    );
    if (byTitle) return byTitle;
  }

  const artisanKeySet = toKeySet(artisan?.id, artisan?.artisan_id);
  if (artisanKeySet.size > 0) {
    const byId = list.find((video) => {
      const videoKeySet = toKeySet(video?.artisan_id);
      if (videoKeySet.size === 0) return false;
      for (const k of artisanKeySet) {
        if (videoKeySet.has(k)) return true;
      }
      return false;
    });
    if (byId) return byId;
  }
  return null;
}

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

router.get("/artisans", async (req, res) => {
  try {
    const featured = String(req.query.featured || "").toLowerCase() === "true";
    const { artisans, tiktokVideos } = await getCollections();
    const filter = featured ? { is_featured: true } : {};
    let rows = await artisans.find(filter).sort({ created_at: -1 }).toArray();
    const videos = await tiktokVideos
      .find({ is_active: { $in: TRUTHY_VALUES } })
      .project({ id: 1, artisan_id: 1, title: 1, artisan_title: 1, video_url: 1, tiktok_url: 1 })
      .toArray();

    if (featured && (!rows || rows.length === 0)) {
      rows = await artisans.find({}).sort({ created_at: -1 }).limit(8).toArray();
    }

    return res.json(
      (rows || []).map((row) => {
        const artisan = normalizeArtisan(req, row);
        const matchedVideo = findTiktokForArtisan(artisan, videos);
        const matchedUrl =
          String(
            matchedVideo?.video_url ||
              matchedVideo?.tiktok_url ||
              matchedVideo?.url ||
              matchedVideo?.link ||
              matchedVideo?.tiktok_link ||
              ""
          ).trim() || null;

        if (!matchedUrl) return artisan;

        return {
          ...artisan,
          tiktok_url: artisan?.tiktok_url || matchedUrl,
          tiktok_video_url: artisan?.tiktok_video_url || matchedUrl,
        };
      })
    );
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

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

        const inheritedImage =
          productImageById.get(String(variant?.product_id || "").trim()) || null;

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

router.get("/team", async (req, res) => {
  try {
    const { team } = await getCollections();
    const rows = await team.find({}).sort({ created_at: -1 }).toArray();
    return res.json((rows || []).map((row) => normalizeTeam(req, row)));
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/tiktok-videos", async (req, res) => {
  try {
    const onlyFeatured = String(req.query.featured || "").toLowerCase() === "true";
    const onlyActive = String(req.query.active || "true").toLowerCase() !== "false";
    const limit = Math.min(parseInt(req.query.limit || "12", 10), 100);

    const filter = {};
    if (onlyFeatured) filter.is_featured = { $in: TRUTHY_VALUES };
    if (onlyActive) filter.is_active = { $in: TRUTHY_VALUES };

    const { tiktokVideos } = await getCollections();
    const rows = await tiktokVideos.find(filter).sort({ created_at: -1 }).limit(limit).toArray();
    return res.json(
      (rows || []).map((row) => {
        const item = withId(row);
        return {
          ...item,
          video_url:
            item.video_url ||
            item.tiktok_url ||
            item.url ||
            item.link ||
            item.tiktok_link ||
            null,
        };
      })
    );
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

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
