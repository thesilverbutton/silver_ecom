/**
 * Uploads the marketing / editorial imagery (hero, brand story, button macro,
 * about hero) into the TARGET Cloudinary account under silver-button/site.
 *
 * These are content images rather than app chrome. The logo and payment badges
 * stay in /public on purpose — they are tiny, same-origin, and part of the
 * deployment, so routing them through a CDN adds latency without benefit.
 *
 * Prints a ready-to-paste block for lib/images.ts.
 *
 * Usage:
 *   npx tsx scripts/migrate-site-images.ts --apply
 */
import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const APPLY = process.argv.includes("--apply");
const TARGET_ENV = ".env.production";
const FOLDER = "silver-button/site";
const MAX_UPLOAD_BYTES = 9 * 1024 * 1024;

/** key → source (local path under /public, or a remote URL to fetch). */
const ASSETS: Record<string, string> = {
  heroCraftJourney: "/hero_image.png",
  brandStoryLoom: "/hero_images/about_m1_u-min.webp",
  silverButtonMacro: "/silver_button.png",
  aboutHero:
    "https://res.cloudinary.com/deht0dsks/image/upload/v1785558822/about_page_image_nhlo8n.png",
};

function prepare(absPath: string): { file: string; cleanup?: () => void } {
  const { size } = fs.statSync(absPath);
  if (size <= MAX_UPLOAD_BYTES) return { file: absPath };

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tsb-site-"));
  const out = path.join(dir, path.basename(absPath).replace(/\.\w+$/, ".jpg"));
  execFileSync("convert", [absPath, "-resize", "2400x2400>", "-quality", "86", "-strip", out]);
  console.log(
    `      downscaled ${(size / 1e6).toFixed(1)}MB → ${(fs.statSync(out).size / 1e6).toFixed(1)}MB`,
  );
  return { file: out, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

async function main() {
  config({ path: TARGET_ENV, override: true, quiet: true });
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — site image migration`);
  console.log(`Target cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  const results: Record<string, string> = {};

  for (const [key, source] of Object.entries(ASSETS)) {
    const publicId = `${FOLDER}/${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
    const isRemote = source.startsWith("http");
    let uploadSource = source;
    let cleanup: (() => void) | undefined;

    if (!isRemote) {
      const abs = path.join(process.cwd(), "public", source.replace(/^\//, ""));
      if (!fs.existsSync(abs)) {
        console.log(`  MISSING  ${source}`);
        continue;
      }
      if (APPLY) {
        const p = prepare(abs);
        uploadSource = p.file;
        cleanup = p.cleanup;
      }
    }

    if (!APPLY) {
      console.log(`  would upload  ${source}\n              → ${publicId}`);
      continue;
    }

    try {
      const res = await cloudinary.uploader.upload(uploadSource, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        invalidate: true,
      });
      results[key] = res.secure_url;
      console.log(`  uploaded  ${publicId}  (${res.width}x${res.height})`);
    } catch (err) {
      console.log(`  FAILED    ${source} — ${(err as Error).message}`);
      process.exitCode = 1;
    } finally {
      cleanup?.();
    }
  }

  if (APPLY && Object.keys(results).length > 0) {
    console.log("\n--- paste into lib/images.ts ---");
    for (const [k, v] of Object.entries(results)) console.log(`  ${k}: "${v}",`);
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error("\nFailed:", err.message);
    process.exit(1);
  });
