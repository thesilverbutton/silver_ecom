/**
 * Read-only inspection of a database. Prints collection counts and a summary of
 * how product image URLs are stored, so a migration can be planned safely.
 *
 * Usage:
 *   npx tsx scripts/inspect-db.ts .env
 *   npx tsx scripts/inspect-db.ts .env.production
 */
import { config } from "dotenv";
import mongoose from "mongoose";

const envFile = process.argv[2] || ".env";
config({ path: envFile, override: true });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) throw new Error(`MONGODB_URI missing in ${envFile}`);

  const host = uri.replace(/.*@([^/?]+).*/, "$1");
  console.log(`\n=== ${envFile} → ${host} / ${dbName} ===`);

  const conn = await mongoose.createConnection(uri, { dbName }).asPromise();
  const db = conn.db;
  if (!db) throw new Error("No database handle");

  const collections = await db.listCollections().toArray();
  if (collections.length === 0) {
    console.log("(no collections — empty database)");
  }

  for (const c of collections.sort((a, b) => a.name.localeCompare(b.name))) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  ${c.name.padEnd(22)} ${count}`);
  }

  // Image URL breakdown
  const hasProducts = collections.some((c) => c.name === "products");
  if (hasProducts) {
    const products = await db
      .collection("products")
      .find({}, { projection: { slug: 1, images: 1 } })
      .toArray();

    const buckets = new Map<string, number>();
    const localPaths = new Set<string>();

    for (const p of products) {
      for (const img of (p.images as { url?: string }[] | undefined) ?? []) {
        const url = img?.url ?? "";
        let kind: string;
        if (url.startsWith("http")) {
          kind = new URL(url).hostname;
          if (kind === "res.cloudinary.com") {
            kind = `res.cloudinary.com/${url.split("/")[3] ?? "?"}`;
          }
        } else {
          kind = "LOCAL";
          localPaths.add(url);
        }
        buckets.set(kind, (buckets.get(kind) ?? 0) + 1);
      }
    }

    console.log(`\n  image url sources across ${products.length} products:`);
    for (const [kind, n] of [...buckets].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${String(n).padStart(4)}  ${kind}`);
    }

    if (localPaths.size > 0) {
      console.log(`\n  distinct local image paths (${localPaths.size}):`);
      for (const p of [...localPaths].sort()) console.log(`    ${p}`);
    }
  }

  await conn.close();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Inspect failed:", err.message);
    process.exit(1);
  });
