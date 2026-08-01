/**
 * Copies catalog data from the SOURCE database (.env) into the TARGET database
 * (.env.production), rewriting product image URLs to the new Cloudinary account
 * using scripts/image-manifest.json.
 *
 * Only catalog data moves by default. Dev orders, payments, carts, customers and
 * audit logs are deliberately left behind — they are test records and do not
 * belong in a production store. Pass --include-transactional to copy them anyway.
 *
 * The admin user is NOT copied; it is created fresh from the TARGET env's
 * ADMIN_EMAIL / ADMIN_PASSWORD so production credentials apply.
 *
 * Refuses to overwrite a non-empty target collection unless --force is given.
 *
 * Usage:
 *   npx tsx scripts/migrate-db-to-production.ts             # dry run
 *   npx tsx scripts/migrate-db-to-production.ts --apply
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import type { ImageManifest } from "./migrate-images-to-cloudinary";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const INCLUDE_TRANSACTIONAL = process.argv.includes("--include-transactional");

const SOURCE_ENV = ".env";
const TARGET_ENV = ".env.production";
const MANIFEST_PATH = path.join(process.cwd(), "scripts", "image-manifest.json");

/** Catalog collections — safe and expected to move to production. */
const CATALOG_COLLECTIONS = ["categories", "products", "settings"];

/** Dev-only test records; opt in explicitly. */
const TRANSACTIONAL_COLLECTIONS = [
  "orders",
  "payments",
  "carts",
  "customers",
  "auditlogs",
  "contactqueries",
];

interface EnvPair {
  uri: string;
  dbName: string | undefined;
  adminEmail?: string;
  adminPassword?: string;
  host: string;
}

function loadEnv(file: string): EnvPair {
  const result = config({ path: file, override: true, quiet: true });
  if (result.error) throw new Error(`Cannot read ${file}: ${result.error.message}`);
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error(`MONGODB_URI missing in ${file}`);
  return {
    uri,
    dbName: process.env.MONGODB_DB,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    host: uri.replace(/.*@([^/?]+).*/, "$1"),
  };
}

function loadManifest(): ImageManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      "image-manifest.json not found. Run migrate-images-to-cloudinary.ts --apply first.",
    );
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as ImageManifest;
}

/** Swap every product image URL for its Cloudinary equivalent. */
function rewriteProductImages(
  doc: Record<string, unknown>,
  manifest: ImageManifest,
  stats: { rewritten: number; unmapped: Set<string> },
) {
  const images = doc.images as
    | { url?: string; publicId?: string; width?: number; height?: number }[]
    | undefined;
  if (!Array.isArray(images)) return doc;

  for (const img of images) {
    if (!img?.url) continue;
    const mapped = manifest[img.url];
    if (!mapped) {
      stats.unmapped.add(img.url);
      continue;
    }
    img.url = mapped.url;
    img.publicId = mapped.publicId;
    img.width = mapped.width;
    img.height = mapped.height;
    stats.rewritten++;
  }
  return doc;
}

async function main() {
  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — database migration\n`);

  const source = loadEnv(SOURCE_ENV);
  const target = loadEnv(TARGET_ENV);

  if (source.uri === target.uri && source.dbName === target.dbName) {
    throw new Error("Source and target are the same database — refusing to run.");
  }

  console.log(`  source: ${source.host} / ${source.dbName}`);
  console.log(`  target: ${target.host} / ${target.dbName}\n`);

  const manifest = loadManifest();
  console.log(`  manifest entries: ${Object.keys(manifest).length}\n`);

  const collections = INCLUDE_TRANSACTIONAL
    ? [...CATALOG_COLLECTIONS, ...TRANSACTIONAL_COLLECTIONS]
    : CATALOG_COLLECTIONS;

  const srcConn = await mongoose.createConnection(source.uri, { dbName: source.dbName }).asPromise();
  const tgtConn = await mongoose.createConnection(target.uri, { dbName: target.dbName }).asPromise();
  const srcDb = srcConn.db!;
  const tgtDb = tgtConn.db!;

  const imageStats = { rewritten: 0, unmapped: new Set<string>() };

  for (const name of collections) {
    const exists = await srcDb.listCollections({ name }).hasNext();
    if (!exists) {
      console.log(`  ${name.padEnd(16)} — not present in source, skipped`);
      continue;
    }

    const docs = await srcDb.collection(name).find({}).toArray();
    const targetCount = await tgtDb.collection(name).countDocuments();

    if (docs.length === 0) {
      console.log(`  ${name.padEnd(16)} — empty in source, skipped`);
      continue;
    }

    if (targetCount > 0 && !FORCE) {
      console.log(
        `  ${name.padEnd(16)} — target already has ${targetCount} docs, SKIPPED (use --force to replace)`,
      );
      continue;
    }

    const prepared =
      name === "products"
        ? docs.map((d) => rewriteProductImages(d, manifest, imageStats))
        : docs;

    if (!APPLY) {
      console.log(`  ${name.padEnd(16)} would copy ${prepared.length} docs`);
      continue;
    }

    if (targetCount > 0 && FORCE) {
      await tgtDb.collection(name).deleteMany({});
    }
    await tgtDb.collection(name).insertMany(prepared, { ordered: false });
    console.log(`  ${name.padEnd(16)} copied ${prepared.length} docs`);
  }

  console.log(`\n  product images rewritten: ${imageStats.rewritten}`);
  if (imageStats.unmapped.size > 0) {
    console.log(`  UNMAPPED image urls (${imageStats.unmapped.size}) — these stay as-is:`);
    for (const u of imageStats.unmapped) console.log(`    ${u}`);
  }

  // --- Admin user from TARGET env ---
  if (!target.adminEmail || !target.adminPassword) {
    console.log("\n  admin: ADMIN_EMAIL/ADMIN_PASSWORD missing in target env, skipped");
  } else {
    const email = target.adminEmail.toLowerCase();
    const existing = await tgtDb.collection("adminusers").findOne({ email });
    if (existing) {
      console.log(`\n  admin: ${email} already exists, left untouched`);
    } else if (!APPLY) {
      console.log(`\n  admin: would create ${email}`);
    } else {
      const passwordHash = await bcrypt.hash(target.adminPassword, 12);
      await tgtDb.collection("adminusers").insertOne({
        name: "Admin",
        email,
        passwordHash,
        role: "admin",
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`\n  admin: created ${email}`);
    }
  }

  if (!INCLUDE_TRANSACTIONAL) {
    console.log(
      `\n  Not copied (dev test data): ${TRANSACTIONAL_COLLECTIONS.join(", ")}` +
        `\n  Pass --include-transactional if you really want them.`,
    );
  }

  await srcConn.close();
  await tgtConn.close();

  if (!APPLY) console.log("\nDry run only. Re-run with --apply to write.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nMigration failed:", err.message);
    process.exit(1);
  });
