function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toKeySet(...values) {
  const set = new Set();
  for (const value of values) {
    const raw = String(value ?? "").trim();
    if (!raw) continue;
    set.add(normalizeKey(raw));
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

function findAliasFromKeys(keys) {
  for (const rule of ARTISAN_ALIAS_RULES) {
    const matched = (rule.matches || []).some((value) => keys.has(normalizeKey(value)));
    if (matched) return rule.alias;
  }
  return null;
}

function firstNameFrom(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  return normalized.split(" ")[0];
}

export function getArtisanAlias(artisan) {
  const directAlias =
    artisan?.alias ||
    artisan?.nickname ||
    artisan?.display_name ||
    artisan?.artisan_alias ||
    null;
  if (String(directAlias || "").trim()) return String(directAlias).trim();

  const keys = toKeySet(
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
  const normalized = normalizeKey(name);
  if (!normalized) return null;
  for (const rule of PRODUCT_ALIAS_RULES) {
    const includeSet = new Set((rule.names || []).map((v) => normalizeKey(v)));
    if (includeSet.has(normalized)) return rule.alias;
  }
  return null;
}

function categoryFallbackAlias(product) {
  const category = normalizeKey(product?.category);
  if (category === "clay pottery") return "Uncle Juan";
  if (category === "bamboo crafts") return "Nanay Josephine";
  if (category === "food delicacies") return "Tatay Rufo";
  return null;
}

export function getProductOwnerAlias(product) {
  const directAlias =
    product?.owner_alias ||
    product?.artisan_alias ||
    product?.alias ||
    product?.nickname ||
    null;
  if (String(directAlias || "").trim()) return String(directAlias).trim();

  const keys = toKeySet(
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
  const normalized = normalizeKey(category);
  if (normalized === "furniture") return "furniture";
  if (normalized === "food delicacies") return "delicacies";
  if (normalized === "clay pottery") return "pottery";
  if (normalized === "bamboo crafts") return "bamboo crafts";
  if (normalized === "crafts") return "crafts";
  return "products";
}

export function getProductOwnerLabel(product) {
  const alias = getProductOwnerAlias(product);
  if (!alias) return null;
  return `${toPossessive(alias)} ${categoryLabel(product?.category)}`;
}
