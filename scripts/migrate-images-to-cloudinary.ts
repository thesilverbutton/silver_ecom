/**
 * Uploads every product image referenced by the SOURCE database into the TARGET
 * Cloudinary account, then writes a manifest mapping each old URL to its new one.
 *
 * Handles two kinds of source URL:
 *   - local paths  (/product_Images/foo.png)  → read from ./public and upload
 *   - remote URLs  (old Cloudinary account)    → Cloudinary fetches them directly
 *
 * Cloudinary's Free plan rejects images over 10MB, so anything larger is
 * downscaled with ImageMagick into a temp file first. The original on disk is
 * never modified.
 *
 * Idempotent: public_ids are derived from the filename and uploaded with
 * overwrite, so re-running produces the same result.
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-cloudinary.ts            # dry run
 *   npx tsx scripts/migrate-images-to-cloudinary.ts --apply
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const APPLY = process.argv.includes("--apply");
const SOURCE_ENV = ".env";
const TARGET_ENV = ".env.production";

const CLOUD_FOLDER = "silver-button/products";
const MANIFEST_PATH = path.join(process.cwd(), "scripts", "image-manifest.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Free plan hard limit is 10MB; stay under it with headroom. */
const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

export interface ManifestEntry {
  url: string;
  publicId: string;
  width: number;
  height: number;
}
export type ImageManifest = Record<string, ManifestEntry>;

function readEnv(file: string) {
  const parsed = config({ path: file, override: true, quiet: true });
  if (parsed.error) throw new Error(`Cannot read ${file}: ${parsed.error.message}`);
  return process.env;
}

/** Collect the distinct set of image URLs used by products in the source DB. */
async function collectSourceUrls(): Promise<string[]> {
  readEnv(SOURCE_ENV);
  const uri = process.env.MONGODB_URI!;
  const dbName = process.env.MONGODB_DB;
  const conn = await mongoose.createConnection(uri, { dbName }).asPromise();

  const products = await conn
    .db!.collection("products")
    .find({}, { projection: { images: 1 } })
    .toArray();

  const urls = new Set<string>();
  for (const p of products) {
    for (const img of (p.images as { url?: string }[] | undefined) ?? []) {
      if (img?.url) urls.add(img.url);
    }
  }
  await conn.close();
  return [...urls].sort();
}

/** Downscale into a temp file when the source exceeds the plan limit. */
function prepareLocalFile(absPath: string): { file: string; cleanup?: () => void } {
  const { size } = fs.statSync(absPath);
  if (size <= MAX_UPLOAD_BYTES) return { file: absPath };

  const tmp = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "tsb-img-")),
    path.basename(absPath).replace(/\.\w+$/, ".jpg"),
  );

  // Cap the long edge at 2400px and re-encode; plenty for a 2:3 product shot.
  execFileSync("convert", [
    absPath,
    "-resize", "2400x2400>",
    "-quality", "84",
    "-strip",
    tmp,
  ]);

  const newSize = fs.statSync(tmp).size;
  console.log(
    `      downscaled ${(size / 1e6).toFixed(1)}MB → ${(newSize / 1e6).toFixed(1)}MB`,
  );
  return { file: tmp, cleanup: () => fs.rmSync(path.dirname(tmp), { recursive: true, force: true }) };
}

function publicIdFor(sourceUrl: string): string {
  const base = sourceUrl.startsWith("http")
    ? (new URL(sourceUrl).pathname.split("/").pop() ?? "asset")
    : (sourceUrl.split("/").pop() ?? "asset");

  const slug = base
    .replace(/\.\w+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${CLOUD_FOLDER}/${slug}`;
}

async function main() {
  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — image migration\n`);

  const sourceUrls = await collectSourceUrls();
  console.log(`Found ${sourceUrls.length} distinct image URLs in ${SOURCE_ENV} DB\n`);

  // Configure Cloudinary against the TARGET account.
  readEnv(TARGET_ENV);
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(`Target Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  const manifest: ImageManifest = {};
  const missing: string[] = [];
  const failed: string[] = [];

  for (const sourceUrl of sourceUrls) {
    const publicId = publicIdFor(sourceUrl);
    const isRemote = sourceUrl.startsWith("http");
    let uploadSource = sourceUrl;
    let cleanup: (() => void) | undefined;

    if (!isRemote) {
      const abs = path.join(PUBLIC_DIR, sourceUrl.replace(/^\//, ""));
      if (!fs.existsSync(abs)) {
        console.log(`  MISSING  ${sourceUrl}`);
        missing.push(sourceUrl);
        continue;
      }
      if (APPLY) {
        const prepared = prepareLocalFile(abs);
        uploadSource = prepared.file;
        cleanup = prepared.cleanup;
      } else {
        uploadSource = abs;
      }
    }

    if (!APPLY) {
      console.log(`  would upload  ${sourceUrl}\n              → ${publicId}`);
      continue;
    }

    try {
      const res = await cloudinary.uploader.upload(uploadSource, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        invalidate: true,
      });
      manifest[sourceUrl] = {
        url: res.secure_url,
        publicId: res.public_id,
        width: res.width,
        height: res.height,
      };
      console.log(`  uploaded  ${publicId}  (${res.width}x${res.height})`);
    } catch (err) {
      console.log(`  FAILED    ${sourceUrl} — ${(err as Error).message}`);
      failed.push(sourceUrl);
    } finally {
      cleanup?.();
    }
  }

  if (APPLY) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`\nManifest written: ${path.relative(process.cwd(), MANIFEST_PATH)}`);
    console.log(`  mapped:  ${Object.keys(manifest).length}`);
  }
  if (missing.length) console.log(`  missing on disk: ${missing.length}`);
  if (failed.length) {
    console.log(`  failed: ${failed.length}`);
    process.exitCode = 1;
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error("\nImage migration failed:", err.message);
    process.exit(1);
  });
