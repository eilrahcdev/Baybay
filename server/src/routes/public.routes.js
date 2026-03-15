import { Router } from "express";
import { getCollections } from "../mongo.js";
import {
  artisansQuerySchema,
  getValidationErrorMessage,
  newsletterSchema,
  productsQuerySchema,
  productVariantsQuerySchema,
  searchQuerySchema,
  tiktokVideosQuerySchema,
} from "../validators.js";

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

function normalizeAliasKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAliasKeySet(...values) {
  const set = new Set();
  for (const value of values) {
    const raw = String(value ?? "").trim();
    if (!raw) continue;
    set.add(normalizeAliasKey(raw));
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      set.add(`id:${asNumber}`);
      set.add(`artisan_id:${asNumber}`);
    }
  }
  return set;
}

const ARTISAN_ALIAS_RULES = [
  { alias: "Kuya Robert", matches: ["robert fernandez", "malasiqui furniture", "id:7"] },
  { alias: "Kuya Marvin", matches: ["marvin diso", "pozorrubio sword", "id:2"] },
  { alias: "Uncle Mike", matches: ["mike salinas", "binmaley furniture"] },
  { alias: "Uncle Juan", matches: ["juan lomibao", "binmaley clay pottery"] },
  { alias: "Nanay Josephine", matches: ["josephine datuin", "san carlos bamboo basket"] },
  { alias: "Tatay Rufo", matches: ["rufo dela cruz", "calasaio puto"] },
];

const PRODUCT_ALIAS_RULES = [
  { alias: "Kuya Robert", names: ["high chair", "sofa bed", "wooden table", "bed"] },
  {
    alias: "Uncle Mike",
    names: [
      "spider sala set",
      "banig dining set",
      "rocking chair",
      "coffee table",
      "cleopatra sala set",
      "apakan round table set",
      "boogan sala set",
      "dining table set",
      "american sala set",
    ],
  },
  {
    alias: "Kuya Marvin",
    names: ["knife", "katana", "kris double blade", "kris double sword", "sword"],
  },
];

const HONORIFIC_TERMS = new Set(["kuya", "uncle", "nanay", "tatay"]);

function findAliasFromKeys(keys) {
  for (const rule of ARTISAN_ALIAS_RULES) {
    const matched = (rule.matches || []).some((value) => keys.has(normalizeAliasKey(value)));
    if (matched) return rule.alias;
  }
  return null;
}

function firstNameFrom(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  return normalized.split(" ")[0];
}

function getArtisanAliasForSearch(artisan) {
  const directAlias =
    artisan?.alias || artisan?.nickname || artisan?.display_name || artisan?.artisan_alias || null;
  if (String(directAlias || "").trim()) return String(directAlias).trim();

  const keys = toAliasKeySet(
    artisan?.id ? `id:${artisan.id}` : "",
    artisan?.artisan_id ? `artisan_id:${artisan.artisan_id}` : "",
    artisan?.name,
    artisan?.full_name,
    artisan?.title
  );
  const mapped = findAliasFromKeys(keys);
  if (mapped) return mapped;

  const firstName = firstNameFrom(artisan?.name || artisan?.full_name);
  if (!firstName) return null;
  return `Kuya ${firstName}`;
}

function findAliasFromProductName(name) {
  const normalized = normalizeAliasKey(name);
  if (!normalized) return null;
  for (const rule of PRODUCT_ALIAS_RULES) {
    const includeSet = new Set((rule.names || []).map((value) => normalizeAliasKey(value)));
    if (includeSet.has(normalized)) return rule.alias;
  }
  return null;
}

function categoryFallbackAlias(product) {
  const category = normalizeAliasKey(product?.category);
  if (category === "clay pottery") return "Uncle Juan";
  if (category === "bamboo crafts") return "Nanay Josephine";
  if (category === "food delicacies") return "Tatay Rufo";
  return null;
}

function getProductOwnerAliasForSearch(product) {
  const directAlias =
    product?.owner_alias || product?.artisan_alias || product?.alias || product?.nickname || null;
  if (String(directAlias || "").trim()) return String(directAlias).trim();

  const keys = toAliasKeySet(
    product?.artisan_id ? `artisan_id:${product.artisan_id}` : "",
    product?.owner,
    product?.artisan_name,
    product?.artisan_title
  );
  const mapped = findAliasFromKeys(keys);
  if (mapped) return mapped;

  const byName = findAliasFromProductName(product?.name);
  if (byName) return byName;

  return categoryFallbackAlias(product);
}

function toPossessive(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  return /s$/i.test(clean) ? `${clean}'` : `${clean}'s`;
}

function categoryLabel(category) {
  const normalized = normalizeAliasKey(category);
  if (normalized === "furniture") return "furniture";
  if (normalized === "food delicacies") return "delicacies";
  if (normalized === "clay pottery") return "pottery";
  if (normalized === "bamboo crafts") return "bamboo crafts";
  if (normalized === "crafts") return "crafts";
  return "products";
}

function getProductOwnerLabelForSearch(product) {
  const alias = getProductOwnerAliasForSearch(product);
  if (!alias) return null;
  return `${toPossessive(alias)} ${categoryLabel(product?.category)}`;
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAllTerms(haystack, terms = []) {
  const text = normalizeSearchText(haystack);
  if (!text) return false;
  return terms.every((term) => text.includes(term));
}

function buildProductSearchText(product) {
  return [
    product?.name,
    product?.description,
    product?.category,
    product?.owner,
    product?.artisan_name,
    product?.artisan_title,
    product?.owner_alias,
    product?.artisan_alias,
    product?.alias,
    product?.nickname,
    getProductOwnerAliasForSearch(product),
    getProductOwnerLabelForSearch(product),
  ]
    .filter(Boolean)
    .join(" ");
}

function buildArtisanSearchText(artisan) {
  return [
    artisan?.name,
    artisan?.full_name,
    artisan?.title,
    artisan?.bio,
    artisan?.alias,
    artisan?.nickname,
    artisan?.display_name,
    artisan?.artisan_alias,
    getArtisanAliasForSearch(artisan),
  ]
    .filter(Boolean)
    .join(" ");
}

function dedupeById(rows = []) {
  const seen = new Set();
  const output = [];
  for (const row of rows) {
    const key = String(row?.id ?? row?._id ?? "").trim();
    const stableKey = key || JSON.stringify([row?.name || "", row?.full_name || "", row?.title || ""]);
    if (seen.has(stableKey)) continue;
    seen.add(stableKey);
    output.push(row);
  }
  return output;
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
    return res
      .status(400)
      .json({ message: getValidationErrorMessage(parsed.error, "Please enter a valid email address.") });
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
    const parsedQuery = productsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: getValidationErrorMessage(parsedQuery.error) });
    }
    const { limit } = parsedQuery.data;
    const { products } = await getCollections();
    const rows = await products.find({}).sort({ created_at: -1 }).limit(limit).toArray();
    return res.json((rows || []).map((row) => normalizeProduct(req, row)));
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

router.get("/artisans", async (req, res) => {
  try {
    const parsedQuery = artisansQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: getValidationErrorMessage(parsedQuery.error) });
    }
    const { featured } = parsedQuery.data;
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
    const parsedQuery = productVariantsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: getValidationErrorMessage(parsedQuery.error) });
    }
    const { product_id: productIdRaw } = parsedQuery.data;

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
    const parsedQuery = tiktokVideosQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: getValidationErrorMessage(parsedQuery.error) });
    }
    const {
      featured: onlyFeatured,
      active: onlyActive,
      limit,
    } = parsedQuery.data;

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
    const parsedQuery = searchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: getValidationErrorMessage(parsedQuery.error) });
    }
    const raw = parsedQuery.data.q;
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
    const hasHonorificTerm = terms.some((word) => HONORIFIC_TERMS.has(word));

    for (const word of terms) {
      const regex = new RegExp(escapeRegex(word), "i");
      productOr.push(
        { name: regex },
        { description: regex },
        { category: regex },
        { owner_alias: regex },
        { artisan_alias: regex },
        { alias: regex },
        { nickname: regex },
        { owner: regex },
        { artisan_name: regex },
        { artisan_title: regex }
      );
      artisanOr.push(
        { name: regex },
        { full_name: regex },
        { title: regex },
        { bio: regex },
        { alias: regex },
        { nickname: regex },
        { display_name: regex },
        { artisan_alias: regex }
      );
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
              artisan_id: 1,
              owner: 1,
              artisan_name: 1,
              artisan_title: 1,
              owner_alias: 1,
              artisan_alias: 1,
              alias: 1,
              nickname: 1,
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
              artisan_id: 1,
              alias: 1,
              nickname: 1,
              display_name: 1,
              artisan_alias: 1,
            },
          }
        )
        .limit(12)
        .toArray(),
    ]);

    let mergedProducts = Array.isArray(productRows) ? productRows : [];
    let mergedArtisans = Array.isArray(artisanRows) ? artisanRows : [];

    if (hasHonorificTerm) {
      const [scanProducts, scanArtisans] = await Promise.all([
        products
          .find(
            {},
            {
              projection: {
                id: 1,
                name: 1,
                description: 1,
                image_url: 1,
                price: 1,
                category: 1,
                artisan_id: 1,
                owner: 1,
                artisan_name: 1,
                artisan_title: 1,
                owner_alias: 1,
                artisan_alias: 1,
                alias: 1,
                nickname: 1,
                created_at: 1,
              },
            }
          )
          .sort({ created_at: -1 })
          .limit(400)
          .toArray(),
        artisans
          .find(
            {},
            {
              projection: {
                id: 1,
                name: 1,
                full_name: 1,
                title: 1,
                bio: 1,
                image_url: 1,
                artisan_id: 1,
                alias: 1,
                nickname: 1,
                display_name: 1,
                artisan_alias: 1,
                created_at: 1,
              },
            }
          )
          .sort({ created_at: -1 })
          .limit(400)
          .toArray(),
      ]);

      const aliasMatchedProducts = (scanProducts || []).filter((row) =>
        includesAllTerms(buildProductSearchText(row), terms)
      );
      const aliasMatchedArtisans = (scanArtisans || []).filter((row) =>
        includesAllTerms(buildArtisanSearchText(row), terms)
      );

      mergedProducts = dedupeById([...mergedProducts, ...aliasMatchedProducts]).slice(0, 12);
      mergedArtisans = dedupeById([...mergedArtisans, ...aliasMatchedArtisans]).slice(0, 12);
    }

    return res.json({
      products: (mergedProducts || []).map((row) => normalizeProduct(req, row)),
      artisans:
        (mergedArtisans || []).map((a) => ({
          ...normalizeArtisan(req, a),
          full_name: a.full_name || a.name || "",
        })) || [],
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
});

export default router;
