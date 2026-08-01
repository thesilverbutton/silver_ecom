/**
 * Read-only check that every image URL stored in the production database actually
 * resolves, and that none of them still point at a local path or the old CDN.
 *
 * Usage: npx tsx scripts/verify-production-images.ts
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import { siteImages } from "../lib/images";

config({ path: ".env.production", override: true, quiet: true });

async function head(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI!;
  const expectedCloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const conn = await mongoose.createConnection(uri, { dbName: process.env.MONGODB_DB }).asPromise();

  const products = await conn
    .db!.collection("products")
    .find({}, { projection: { slug: 1, images: 1 } })
    .toArray();

  const urls = new Map<string, string[]>();
  for (const p of products) {
    for (const img of (p.images as { url?: string }[] | undefined) ?? []) {
      if (!img?.url) continue;
      const list = urls.get(img.url) ?? [];
      list.push(p.slug as string);
      urls.set(img.url, list);
    }
  }

  console.log(`\nChecking ${urls.size} distinct product image URLs from production DB\n`);

  let bad = 0;
  for (const [url, slugs] of urls) {
    const problems: string[] = [];
    if (!url.startsWith("http")) problems.push("LOCAL PATH");
    else if (!url.includes(`/${expectedCloud}/`)) problems.push("WRONG CLOUD");

    const status = await head(url);
    if (status !== 200) problems.push(`HTTP ${status}`);

    if (problems.length) {
      bad++;
      console.log(`  FAIL  ${problems.join(", ")}\n        ${url}\n        used by: ${slugs.join(", ")}`);
    }
  }
  console.log(bad === 0 ? "  All product images OK (200, correct cloud)" : `\n  ${bad} problem(s)`);

  // Site imagery referenced from code
  console.log(`\nChecking ${Object.keys(siteImages).length} site image URLs from lib/images.ts\n`);
  for (const [key, url] of Object.entries(siteImages)) {
    const status = await head(url);
    const okCloud = url.includes(`/${expectedCloud}/`);
    if (status !== 200 || !okCloud) {
      bad++;
      console.log(`  FAIL  ${key} — HTTP ${status}${okCloud ? "" : ", WRONG CLOUD"}`);
    } else {
      console.log(`  ok    ${key}`);
    }
  }

  await conn.close();
  if (bad > 0) process.exitCode = 1;
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error("Verify failed:", err.message);
    process.exit(1);
  });
