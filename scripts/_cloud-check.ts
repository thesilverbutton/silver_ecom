import { config } from "dotenv";
config({ path: ".env.production", override: true });
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
(async () => {
  const usage = await cloudinary.api.usage();
  console.log("cloud:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("plan:", usage.plan);
  console.log("resources:", usage.resources);
  console.log("credits used:", JSON.stringify(usage.credits ?? {}));
  const list = await cloudinary.api.resources({ max_results: 100, type: "upload" });
  console.log("existing assets:", list.resources.length);
  for (const r of list.resources.slice(0, 20)) console.log("  ", r.public_id, r.bytes);
})().catch((e) => { console.error("ERR", e.message || e); process.exit(1); });
