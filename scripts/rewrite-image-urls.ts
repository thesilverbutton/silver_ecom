/**
 * Rewrites product image URLs in a database to their Cloudinary equivalents using
 * scripts/image-manifest.json. Use it to bring an environment that still points at
 * /public/product_Images onto the CDN.
 *
 * Only documents that actually change are written, and already-migrated URLs are
 * left alone, so it is safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/rewrite-image-urls.ts .env             # dry run
 *   npx tsx scripts/rewrite-image-urls.ts .env --apply
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import type { ImageManifest } from "./migrate-images-to-cloudinary";

const envFile = process.argv[2] || ".env";
const APPLY = process.argv.includes("--apply");

config({ path: envFile, override: true, quiet: true });

const MANIFEST_PATH = path.join(process.cwd(), "scripts", "image-manifest.json");

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error("image-manifest.json not found. Run migrate:images -- --apply first.");
  }
  const manifest: ImageManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

  const uri = process.env.MONGODB_URI!;
  const host = uri.replace(/.*@([^/?]+).*/, "$1");
  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — rewrite image URLs`);
  console.log(`  target: ${host} / ${process.env.MONGODB_DB}\n`);

  const conn = await mongoose.createConnection(uri, { dbName: process.env.MONGODB_DB }).asPromise();
  const products = conn.db!.collection("products");

  const docs = await products.find({}, { projection: { slug: 1, images: 1 } }).toArray();

  let changedDocs = 0;
  let changedImages = 0;
  const unmapped = new Set<string>();

  for (const doc of docs) {
    const images = (doc.images as { url?: string }[] | undefined) ?? [];
    let touched = false;

    const next = images.map((img) => {
      if (!img?.url) return img;
      const mapped = manifest[img.url];
      if (!mapped) {
        // Already a Cloudinary URL from a prior run is fine; anything else is a gap.
        if (!img.url.startsWith("http")) unmapped.add(img.url);
        return img;
      }
      touched = true;
      changedImages++;
      return {
        ...img,
        url: mapped.url,
        publicId: mapped.publicId,
        width: mapped.width,
        height: mapped.height,
      };
    });

    if (!touched) continue;
    changedDocs++;

    if (APPLY) {
      await products.updateOne({ _id: doc._id }, { $set: { images: next } });
    } else {
      console.log(`  would update ${doc.slug}`);
    }
  }

  console.log(
    `\n  ${APPLY ? "updated" : "would update"} ${changedDocs} product(s), ${changedImages} image ref(s)`,
  );
  if (unmapped.size > 0) {
    console.log(`  unmapped local paths (${unmapped.size}):`);
    for (const u of unmapped) console.log(`    ${u}`);
  }

  await conn.close();
  if (!APPLY) console.log("\nDry run only. Re-run with --apply to write.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nRewrite failed:", err.message);
    process.exit(1);
  });
