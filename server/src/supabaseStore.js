import { ObjectId } from "mongodb";
import { getCollections } from "./mongo.js";

function clean(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return clean(value).toLowerCase();
}

function toDate(value) {
  if (value instanceof Date) return value;
  const raw = clean(value);
  if (!raw) return null;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toIso(value) {
  const dt = toDate(value);
  return dt ? dt.toISOString() : null;
}

function mapUser(doc) {
  if (!doc) return null;
  return {
    id: clean(doc.id),
    email: cleanEmail(doc.email),
    full_name: clean(doc.full_name),
    password_hash: clean(doc.password_hash),
    email_verified_at: toIso(doc.email_verified_at),
    created_at: toIso(doc.created_at),
    updated_at: toIso(doc.updated_at),
  };
}

function mapOtp(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    email: cleanEmail(doc.email),
    purpose: clean(doc.purpose),
    otp_hash: clean(doc.otp_hash),
    otp_code: doc.otp_code == null ? null : String(doc.otp_code),
    expires_at: toIso(doc.expires_at),
    consumed_at: toIso(doc.consumed_at),
    attempts: Number(doc.attempts || 0),
    created_at: toIso(doc.created_at),
  };
}

function buildOtpIdFilter(id) {
  if (id == null) throw new Error("Invalid OTP id.");
  if (id instanceof ObjectId) return { _id: id };

  const raw = clean(id);
  if (!raw) throw new Error("Invalid OTP id.");

  if (ObjectId.isValid(raw)) {
    return { _id: new ObjectId(raw) };
  }

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return { id: numeric };
  }

  throw new Error("Invalid OTP id.");
}

export async function getUserByEmail(email) {
  const target = cleanEmail(email);
  if (!target) return null;

  const { users } = await getCollections();
  const doc = await users.findOne(
    { email: target },
    {
      projection: {
        _id: 0,
        id: 1,
        email: 1,
        full_name: 1,
        password_hash: 1,
        email_verified_at: 1,
        created_at: 1,
        updated_at: 1,
      },
    }
  );
  return mapUser(doc);
}

export async function getUserById(id) {
  const target = clean(id);
  if (!target) return null;

  const { users } = await getCollections();
  const doc = await users.findOne(
    { id: target },
    {
      projection: {
        _id: 0,
        id: 1,
        email: 1,
        full_name: 1,
        password_hash: 1,
        email_verified_at: 1,
        created_at: 1,
        updated_at: 1,
      },
    }
  );
  return mapUser(doc);
}

export async function upsertUser({ id, fullName, email, passwordHash }) {
  const cleanId = clean(id);
  const cleanName = clean(fullName);
  const cleanAddr = cleanEmail(email);
  const cleanHash = clean(passwordHash);

  if (!cleanId || !cleanAddr || !cleanHash) {
    throw new Error("Missing required user fields for upsert.");
  }

  const { users } = await getCollections();
  const now = new Date();

  await users.updateOne(
    { email: cleanAddr },
    {
      $set: {
        full_name: cleanName || "User",
        email: cleanAddr,
        password_hash: cleanHash,
        updated_at: now,
      },
      $setOnInsert: {
        id: cleanId,
        created_at: now,
        email_verified_at: null,
      },
    },
    { upsert: true }
  );

  const doc = await users.findOne({ email: cleanAddr });
  if (doc && !clean(doc.id)) {
    await users.updateOne({ _id: doc._id }, { $set: { id: cleanId } });
    doc.id = cleanId;
  }

  return mapUser(doc) || {
    id: cleanId,
    full_name: cleanName || "User",
    email: cleanAddr,
    password_hash: cleanHash,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    email_verified_at: null,
  };
}

export async function updateUserByEmail(email, patch = {}) {
  const target = cleanEmail(email);
  if (!target) throw new Error("Missing email for user update.");

  const updates = {};
  if (patch.full_name !== undefined) {
    updates.full_name = clean(patch.full_name) || "User";
  }
  if (patch.email !== undefined) {
    updates.email = cleanEmail(patch.email);
  }
  if (patch.password_hash !== undefined) {
    updates.password_hash = clean(patch.password_hash);
  }
  if (patch.email_verified_at !== undefined) {
    updates.email_verified_at = toDate(patch.email_verified_at);
  }
  updates.updated_at = new Date();

  const { users } = await getCollections();
  await users.updateOne({ email: target }, { $set: updates });
}

export async function consumeActiveOtps({ email, purpose, consumedAt }) {
  const target = cleanEmail(email);
  const cleanPurpose = clean(purpose);
  if (!target || !cleanPurpose) return;

  const consumedDate = toDate(consumedAt) || new Date();
  const { emailOtps } = await getCollections();

  await emailOtps.updateMany(
    {
      email: target,
      purpose: cleanPurpose,
      consumed_at: null,
    },
    {
      $set: { consumed_at: consumedDate },
    }
  );
}

export async function insertEmailOtp({ email, purpose, otpHash, expiresAt, otpCode }) {
  const target = cleanEmail(email);
  const cleanPurpose = clean(purpose);
  const cleanHash = clean(otpHash);
  const expiresDate = toDate(expiresAt);

  if (!target || !cleanPurpose || !cleanHash || !expiresDate) {
    throw new Error("Missing required OTP fields.");
  }

  const { emailOtps } = await getCollections();
  const doc = {
    email: target,
    purpose: cleanPurpose,
    otp_hash: cleanHash,
    otp_code: otpCode ? String(otpCode) : null,
    expires_at: expiresDate,
    consumed_at: null,
    attempts: 0,
    created_at: new Date(),
  };

  const result = await emailOtps.insertOne(doc);
  return mapOtp({ ...doc, _id: result.insertedId });
}

export async function getLatestActiveOtp({ email, purpose }) {
  const target = cleanEmail(email);
  const cleanPurpose = clean(purpose);
  if (!target || !cleanPurpose) return null;

  const { emailOtps } = await getCollections();
  const doc = await emailOtps.findOne(
    {
      email: target,
      purpose: cleanPurpose,
      consumed_at: null,
    },
    {
      sort: { created_at: -1, _id: -1 },
    }
  );

  return mapOtp(doc);
}

export async function getLatestVerifiedOtp({ email }) {
  const target = cleanEmail(email);
  if (!target) return null;

  const { emailOtps } = await getCollections();
  const doc = await emailOtps.findOne(
    {
      email: target,
      purpose: "verify",
      consumed_at: { $ne: null },
      attempts: 999,
    },
    {
      sort: { consumed_at: -1, _id: -1 },
    }
  );

  return mapOtp(doc);
}

export async function getEmailVerifiedAt(email) {
  const target = cleanEmail(email);
  if (!target) return null;

  const { users } = await getCollections();
  const user = await users.findOne(
    { email: target },
    {
      projection: {
        _id: 0,
        email_verified_at: 1,
      },
    }
  );

  if (user?.email_verified_at) return toIso(user.email_verified_at);
  const record = await getLatestVerifiedOtp({ email: target });
  return record?.consumed_at || null;
}

export async function updateOtpById(id, patch = {}) {
  const filter = buildOtpIdFilter(id);
  const updates = {};

  if (patch.email !== undefined) updates.email = cleanEmail(patch.email);
  if (patch.purpose !== undefined) updates.purpose = clean(patch.purpose);
  if (patch.otp_hash !== undefined) updates.otp_hash = clean(patch.otp_hash);
  if (patch.otp_code !== undefined) updates.otp_code = patch.otp_code ? String(patch.otp_code) : null;
  if (patch.expires_at !== undefined) updates.expires_at = toDate(patch.expires_at);
  if (patch.consumed_at !== undefined) updates.consumed_at = toDate(patch.consumed_at);
  if (patch.attempts !== undefined) updates.attempts = Number(patch.attempts || 0);

  if (Object.keys(updates).length === 0) return;

  const { emailOtps } = await getCollections();
  await emailOtps.updateOne(filter, { $set: updates });
}
