/**
 * Seed script — idempotent.
 * Creates: admin user, core categories, settings singleton.
 * Run: pnpm seed
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "silver_button";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Missing required env: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!, { dbName: MONGODB_DB });
  console.log("✅ Connected to", MONGODB_DB);

  // --- Admin User ---
  const { AdminUser } = await import("../models/admin-user.model");
  const existingAdmin = await AdminUser.findOne({ email: ADMIN_EMAIL!.toLowerCase() });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD!, 12);
    await AdminUser.create({
      name: "Admin",
      email: ADMIN_EMAIL!.toLowerCase(),
      passwordHash: hash,
      role: "admin",
      permissions: [],
      isActive: true,
    });
    console.log("✅ Admin user created:", ADMIN_EMAIL);
  } else {
    console.log("⏭️  Admin user already exists:", ADMIN_EMAIL);
  }

  // --- Categories ---
  const { Category } = await import("../models/category.model");

  // Gender parent categories
  const genders = [
    { name: "Men", slug: "men", position: 0 },
    { name: "Women", slug: "women", position: 1 },
  ];

  for (const gender of genders) {
    await Category.updateOne(
      { slug: gender.slug },
      {
        $setOnInsert: {
          name: gender.name,
          slug: gender.slug,
          kind: "category",
          position: gender.position,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }

  // Get parent IDs for sub-categories
  const menCategory = await Category.findOne({ slug: "men" });
  const womenCategory = await Category.findOne({ slug: "women" });

  // Men sub-categories
  const menCategories = [
    { name: "Shirts", slug: "men-shirts", position: 0 },
    { name: "Kurtas", slug: "men-kurtas", position: 1 },
    { name: "Trousers", slug: "men-trousers", position: 2 },
    { name: "Jackets", slug: "men-jackets", position: 3 },
    { name: "Accessories", slug: "men-accessories", position: 4 },
  ];

  for (const cat of menCategories) {
    await Category.updateOne(
      { slug: cat.slug },
      {
        $setOnInsert: {
          name: cat.name,
          slug: cat.slug,
          parentId: menCategory?._id,
          kind: "category",
          position: cat.position,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }

  // Women sub-categories
  const womenCategories = [
    { name: "Sarees", slug: "women-sarees", position: 0 },
    { name: "Kurtas", slug: "women-kurtas", position: 1 },
    { name: "Dupattas", slug: "women-dupattas", position: 2 },
    { name: "Dresses", slug: "women-dresses", position: 3 },
    { name: "Accessories", slug: "women-accessories", position: 4 },
  ];

  for (const cat of womenCategories) {
    await Category.updateOne(
      { slug: cat.slug },
      {
        $setOnInsert: {
          name: cat.name,
          slug: cat.slug,
          parentId: womenCategory?._id,
          kind: "category",
          position: cat.position,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }

  const allCatNames = [...genders, ...menCategories, ...womenCategories].map((c) => c.name);
  console.log("✅ Categories seeded:", allCatNames.join(", "));

  // --- Settings ---
  const { Settings } = await import("../models/settings.model");
  const existingSettings = await Settings.findOne({});

  if (!existingSettings) {
    await Settings.create({
      storeName: "The Silver Button",
      supportEmail: "orders@thesilverbutton.com",
      supportPhone: "+91 8130243850",
      currency: "INR",
      gstEnabled: false,
      flatShippingRate: 0,
      codEnabled: false,
      returnWindowDays: 7,
      originPincode: "121001",
      socials: {},
      policies: {
        shipping: "",
        returns: "",
        privacy: "",
        terms: "",
      },
    });
    console.log("✅ Settings singleton created");
  } else {
    console.log("⏭️  Settings already exist");
  }

  // --- Dummy Products ---
  const { Product } = await import("../models/product.model");
  const existingProducts = await Product.countDocuments({});

  if (existingProducts === 0) {
    // Get category IDs
    const menShirts = await Category.findOne({ slug: "men-shirts" });
    const menKurtas = await Category.findOne({ slug: "men-kurtas" });
    const menTrousers = await Category.findOne({ slug: "men-trousers" });
    const menJackets = await Category.findOne({ slug: "men-jackets" });
    const womenSarees = await Category.findOne({ slug: "women-sarees" });
    const womenKurtas = await Category.findOne({ slug: "women-kurtas" });
    const womenDupattas = await Category.findOne({ slug: "women-dupattas" });
    const womenDresses = await Category.findOne({ slug: "women-dresses" });

    const img = (text: string, bg = "e8e4df", fg = "4a4540") =>
      ({
        url: `https://placehold.co/600x800/${bg}/${fg}?text=${encodeURIComponent(text)}`,
        publicId: `dummy-${text.toLowerCase().replace(/\s/g, "-")}`,
        alt: text,
        width: 600,
        height: 800,
        position: 0,
      });

    const dummyProducts = [
      // --- MEN ---
      {
        title: "Indigo Handloom Cotton Shirt",
        slug: "indigo-handloom-cotton-shirt",
        description: "A breezy handloom cotton shirt dyed in natural indigo. Perfect for casual outings and everyday wear. The fabric softens with every wash.",
        shortDescription: "Natural indigo dyed handloom cotton shirt",
        categoryId: menShirts?._id,
        gender: "men",
        images: [img("Indigo Shirt", "2c3e50", "ecf0f1"), img("Indigo Shirt Back", "34495e", "ecf0f1")],
        basePrice: 179900,
        compareAtPrice: 229900,
        hasVariants: true,
        variants: [
          { sku: "ICS-S", options: { size: "S" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "ICS-M", options: { size: "M" }, priceDelta: 0, stock: 8, isActive: true },
          { sku: "ICS-L", options: { size: "L" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "ICS-XL", options: { size: "XL" }, priceDelta: 0, stock: 3, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Cotton",
        weave: "Plain Weave",
        color: "Indigo",
        pattern: "Solid",
        occasion: "Casual",
        fit: "Regular",
        careInstructions: "Hand wash cold. Dry in shade. Iron medium.",
        madeIn: "India",
        tags: ["cotton", "indigo", "handloom", "casual"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Khadi Kurta — Off White",
        slug: "khadi-kurta-off-white",
        description: "A classic khadi kurta in off-white with wooden buttons. Breathable, comfortable, and timeless. Pairs beautifully with churidars or jeans.",
        shortDescription: "Classic khadi kurta with wooden buttons",
        categoryId: menKurtas?._id,
        gender: "men",
        images: [img("Khadi Kurta", "faf3e0", "4a4540"), img("Khadi Kurta Detail", "f5ebe0", "4a4540")],
        basePrice: 249900,
        hasVariants: true,
        variants: [
          { sku: "KK-38", options: { size: "38" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "KK-40", options: { size: "40" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "KK-42", options: { size: "42" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "KK-44", options: { size: "44" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Khadi",
        weave: "Handspun",
        color: "Off White",
        pattern: "Solid",
        occasion: "Festive / Casual",
        fit: "Relaxed",
        careInstructions: "Gentle machine wash. Do not bleach. Tumble dry low.",
        madeIn: "India",
        tags: ["khadi", "kurta", "festive", "handspun"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },
      {
        title: "Handloom Linen Trousers — Olive",
        slug: "handloom-linen-trousers-olive",
        description: "Relaxed-fit linen trousers in earthy olive. Handloom woven with a soft drape that breathes in summer heat.",
        shortDescription: "Relaxed-fit handloom linen trousers",
        categoryId: menTrousers?._id,
        gender: "men",
        images: [img("Linen Trousers", "556b2f", "f0f0f0")],
        basePrice: 199900,
        hasVariants: true,
        variants: [
          { sku: "LT-30", options: { size: "30" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "LT-32", options: { size: "32" }, priceDelta: 0, stock: 9, isActive: true },
          { sku: "LT-34", options: { size: "34" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "LT-36", options: { size: "36" }, priceDelta: 0, stock: 4, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Twill",
        color: "Olive",
        pattern: "Solid",
        occasion: "Casual / Smart Casual",
        fit: "Relaxed",
        careInstructions: "Machine wash cold. Hang dry. Iron while slightly damp.",
        madeIn: "India",
        tags: ["linen", "trousers", "olive", "summer"],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Ikat Nehru Jacket — Navy",
        slug: "ikat-nehru-jacket-navy",
        description: "A statement Nehru jacket in handwoven ikat. The resist-dyed pattern makes each piece unique. Layer over kurtas or plain shirts.",
        shortDescription: "Handwoven ikat Nehru jacket",
        categoryId: menJackets?._id,
        gender: "men",
        images: [img("Ikat Jacket", "1a237e", "e8eaf6"), img("Ikat Pattern", "283593", "e8eaf6")],
        basePrice: 349900,
        compareAtPrice: 449900,
        hasVariants: true,
        variants: [
          { sku: "IJ-M", options: { size: "M" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "IJ-L", options: { size: "L" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "IJ-XL", options: { size: "XL" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Cotton Ikat",
        weave: "Ikat (resist dye)",
        color: "Navy",
        pattern: "Ikat Geometric",
        occasion: "Festive / Wedding",
        fit: "Slim",
        careInstructions: "Dry clean only. Store flat.",
        madeIn: "India",
        tags: ["ikat", "jacket", "nehru", "festive", "wedding"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },
      {
        title: "Chambray Handloom Shirt — Sky Blue",
        slug: "chambray-handloom-shirt-sky-blue",
        description: "A lightweight chambray shirt woven on handlooms. Soft, breathable, and versatile — works from office to weekend brunch.",
        shortDescription: "Lightweight handloom chambray shirt",
        categoryId: menShirts?._id,
        gender: "men",
        images: [img("Chambray Shirt", "87ceeb", "2c3e50")],
        basePrice: 159900,
        hasVariants: true,
        variants: [
          { sku: "CS-S", options: { size: "S" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "CS-M", options: { size: "M" }, priceDelta: 0, stock: 10, isActive: true },
          { sku: "CS-L", options: { size: "L" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "CS-XL", options: { size: "XL" }, priceDelta: 0, stock: 0, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Chambray",
        weave: "Plain Weave",
        color: "Sky Blue",
        pattern: "Solid",
        occasion: "Office / Casual",
        fit: "Slim",
        careInstructions: "Machine wash cold. Tumble dry low.",
        madeIn: "India",
        tags: ["chambray", "shirt", "office", "blue"],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- WOMEN ---
      {
        title: "Banarasi Silk Saree — Maroon & Gold",
        slug: "banarasi-silk-saree-maroon-gold",
        description: "A luxurious Banarasi silk saree with intricate gold zari work. Handwoven by master artisans. Perfect for weddings and celebrations.",
        shortDescription: "Handwoven Banarasi silk with gold zari",
        categoryId: womenSarees?._id,
        gender: "women",
        images: [img("Banarasi Saree", "800020", "ffd700"), img("Saree Border", "6b0f1a", "ffd700")],
        basePrice: 899900,
        compareAtPrice: 1199900,
        hasVariants: false,
        variants: [],
        stock: 4,
        fabric: "Pure Silk",
        weave: "Banarasi Jacquard",
        color: "Maroon & Gold",
        pattern: "Floral Jaal",
        occasion: "Wedding / Festive",
        fit: "Free Size (5.5m with blouse piece)",
        careInstructions: "Dry clean only. Store in muslin cloth. Avoid direct sunlight.",
        madeIn: "India",
        tags: ["silk", "banarasi", "saree", "wedding", "zari"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Cotton Jamdani Saree — White & Blue",
        slug: "cotton-jamdani-saree-white-blue",
        description: "A featherlight jamdani saree in white cotton with blue motifs woven directly into the fabric. Elegant for summer events.",
        shortDescription: "Lightweight jamdani cotton saree",
        categoryId: womenSarees?._id,
        gender: "women",
        images: [img("Jamdani Saree", "f0f8ff", "4169e1")],
        basePrice: 459900,
        hasVariants: false,
        variants: [],
        stock: 6,
        fabric: "Fine Cotton",
        weave: "Jamdani",
        color: "White & Blue",
        pattern: "Geometric Motifs",
        occasion: "Festive / Daily Elegant",
        fit: "Free Size (6.3m with blouse piece)",
        careInstructions: "Hand wash cold separately. Dry in shade.",
        madeIn: "India",
        tags: ["jamdani", "cotton", "saree", "summer", "elegant"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },
      {
        title: "Block Print Kurta — Mustard",
        slug: "block-print-kurta-mustard",
        description: "A hand block-printed kurta in vibrant mustard with traditional motifs. Made from soft mulmul cotton for all-day comfort.",
        shortDescription: "Hand block-printed mulmul cotton kurta",
        categoryId: womenKurtas?._id,
        gender: "women",
        images: [img("Block Print Kurta", "f4a460", "4a2c0a"), img("Kurta Detail", "e8963d", "4a2c0a")],
        basePrice: 189900,
        compareAtPrice: 239900,
        hasVariants: true,
        variants: [
          { sku: "BPK-XS", options: { size: "XS" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "BPK-S", options: { size: "S" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "BPK-M", options: { size: "M" }, priceDelta: 0, stock: 8, isActive: true },
          { sku: "BPK-L", options: { size: "L" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "BPK-XL", options: { size: "XL" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Mulmul Cotton",
        weave: "Plain Weave",
        color: "Mustard",
        pattern: "Block Print Floral",
        occasion: "Casual / Festive",
        fit: "Relaxed",
        careInstructions: "Hand wash cold. Dry in shade. Colors may bleed on first wash.",
        madeIn: "India",
        tags: ["block-print", "kurta", "cotton", "mustard", "women"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Chanderi Dupatta — Peach & Gold",
        slug: "chanderi-dupatta-peach-gold",
        description: "A delicate Chanderi silk-cotton dupatta with gold zari border. Adds instant elegance to any outfit.",
        shortDescription: "Chanderi silk-cotton dupatta with zari border",
        categoryId: womenDupattas?._id,
        gender: "women",
        images: [img("Chanderi Dupatta", "ffdab9", "cd853f")],
        basePrice: 129900,
        hasVariants: false,
        variants: [],
        stock: 12,
        fabric: "Chanderi (Silk-Cotton)",
        weave: "Chanderi",
        color: "Peach & Gold",
        pattern: "Zari Border",
        occasion: "Festive / Office",
        fit: "Free Size (2.5m)",
        careInstructions: "Dry clean recommended. Can hand wash gently.",
        madeIn: "India",
        tags: ["chanderi", "dupatta", "silk", "zari", "peach"],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Linen A-Line Dress — Sage Green",
        slug: "linen-a-line-dress-sage-green",
        description: "A minimal A-line dress in handloom linen. Effortlessly stylish with side pockets and a relaxed silhouette.",
        shortDescription: "Handloom linen A-line dress with pockets",
        categoryId: womenDresses?._id,
        gender: "women",
        images: [img("Linen Dress", "8fbc8f", "2f4f4f"), img("Dress Side", "7cad7c", "2f4f4f")],
        basePrice: 279900,
        compareAtPrice: 349900,
        hasVariants: true,
        variants: [
          { sku: "LD-XS", options: { size: "XS" }, priceDelta: 0, stock: 2, isActive: true },
          { sku: "LD-S", options: { size: "S" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "LD-M", options: { size: "M" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "LD-L", options: { size: "L" }, priceDelta: 0, stock: 4, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Sage Green",
        pattern: "Solid",
        occasion: "Casual / Office",
        fit: "A-Line Relaxed",
        careInstructions: "Machine wash cold. Line dry. Iron medium.",
        madeIn: "India",
        tags: ["linen", "dress", "sage", "minimal", "pockets"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },
      {
        title: "Kalamkari Wrap Dress — Terracotta",
        slug: "kalamkari-wrap-dress-terracotta",
        description: "A flowing wrap dress with hand-painted kalamkari detailing. Each piece is one-of-a-kind with natural dyes.",
        shortDescription: "Hand-painted kalamkari wrap dress",
        categoryId: womenDresses?._id,
        gender: "women",
        images: [img("Kalamkari Dress", "cd5c5c", "fff8dc")],
        basePrice: 329900,
        hasVariants: true,
        variants: [
          { sku: "KD-S", options: { size: "S" }, priceDelta: 0, stock: 2, isActive: true },
          { sku: "KD-M", options: { size: "M" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "KD-L", options: { size: "L" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Cotton",
        weave: "Plain Weave",
        color: "Terracotta",
        pattern: "Kalamkari Hand-painted",
        occasion: "Festive / Evening",
        fit: "Wrap / Adjustable",
        careInstructions: "Hand wash cold only. No bleach. Dry in shade.",
        madeIn: "India",
        tags: ["kalamkari", "dress", "wrap", "terracotta", "handpainted"],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },
      {
        title: "Tussar Silk Kurta Set — Beige",
        slug: "tussar-silk-kurta-set-beige",
        description: "An elegant tussar silk kurta with matching palazzo pants. The natural gold sheen of tussar makes it perfect for celebrations.",
        shortDescription: "Tussar silk kurta with palazzo set",
        categoryId: womenKurtas?._id,
        gender: "women",
        images: [img("Tussar Kurta Set", "f5deb3", "8b7355"), img("Set Detail", "ede0c8", "8b7355")],
        basePrice: 399900,
        hasVariants: true,
        variants: [
          { sku: "TKS-S", options: { size: "S" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "TKS-M", options: { size: "M" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "TKS-L", options: { size: "L" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "TKS-XL", options: { size: "XL" }, priceDelta: 0, stock: 0, isActive: true },
        ],
        stock: 0,
        fabric: "Tussar Silk",
        weave: "Handloom",
        color: "Natural Beige",
        pattern: "Solid with Zari trim",
        occasion: "Festive / Wedding Guest",
        fit: "Relaxed",
        careInstructions: "Dry clean only.",
        madeIn: "India",
        tags: ["tussar", "silk", "kurta", "set", "festive", "beige"],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
    ];

    await Product.insertMany(dummyProducts);
    console.log(`✅ ${dummyProducts.length} dummy products seeded`);
  } else {
    console.log(`⏭️  Products already exist (${existingProducts} found), skipping dummy seed`);
  }

  await mongoose.disconnect();
  console.log("🌱 Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
