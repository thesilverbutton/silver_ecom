/**
 * Seed script — idempotent.
 * Creates: admin user, core categories, settings singleton, dummy products.
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
    { name: "Linen Shirts", slug: "men-linen-shirts", position: 0 },
    { name: "Linen Pants", slug: "men-linen-pants", position: 1 },
    { name: "Calligraphed Linen Shirts", slug: "men-calligraphed-linen-shirts", position: 2 },
    { name: "Silver Button Shirts", slug: "men-silver-button-shirts", position: 3 },
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
    { name: "Linen Shirts", slug: "women-linen-shirts", position: 0 },
    { name: "Linen Pants", slug: "women-linen-pants", position: 1 },
    { name: "Calligraphed Linen Shirts", slug: "women-calligraphed-linen-shirts", position: 2 },
    { name: "Silver Button Shirts", slug: "women-silver-button-shirts", position: 3 },
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
    const menLinenShirts = await Category.findOne({ slug: "men-linen-shirts" });
    const menLinenPants = await Category.findOne({ slug: "men-linen-pants" });
    const menCalligraphed = await Category.findOne({ slug: "men-calligraphed-linen-shirts" });
    const menSilverButton = await Category.findOne({ slug: "men-silver-button-shirts" });
    const womenLinenShirts = await Category.findOne({ slug: "women-linen-shirts" });
    const womenLinenPants = await Category.findOne({ slug: "women-linen-pants" });
    const womenCalligraphed = await Category.findOne({ slug: "women-calligraphed-linen-shirts" });
    const womenSilverButton = await Category.findOne({ slug: "women-silver-button-shirts" });

    // Image helper — uses real uploaded images from /public/product_Images/
    const productImg = (path: string, alt: string, position = 0) => ({
      url: `/product_Images/${path}`,
      publicId: path.replace(/\.\w+$/, ""),
      alt,
      width: 800,
      height: 1067,
      position,
    });

    const dummyProducts = [
      // --- MEN: Linen Shirts ---
      {
        title: "Classic Linen Shirt — Off White",
        slug: "classic-linen-shirt-off-white-men",
        description: "A timeless off-white linen shirt crafted from handloom linen. Breathable, lightweight, and perfect for warm weather. The natural slub texture adds character to every piece.",
        shortDescription: "Handloom linen shirt in off-white",
        categoryId: menLinenShirts?._id,
        gender: "men",
        images: [productImg("linen_shit_men_front.png", "Classic Linen Shirt — Front", 0), productImg("linen_shit_men_back.png", "Classic Linen Shirt — Back", 1)],
        basePrice: 279900,
        hasVariants: true,
        variants: [
          { sku: "MLS-OW-S", options: { size: "S" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "MLS-OW-M", options: { size: "M" }, priceDelta: 0, stock: 8, isActive: true },
          { sku: "MLS-OW-L", options: { size: "L" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "MLS-OW-XL", options: { size: "XL" }, priceDelta: 0, stock: 4, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Off White",
        pattern: "Solid",
        occasion: "Casual / Smart Casual",
        fit: "Regular",
        careInstructions: "Machine wash cold. Line dry. Iron while slightly damp.",
        madeIn: "India",
        tags: ["linen", "shirt", "handloom", "off-white"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Indigo Linen Shirt",
        slug: "indigo-linen-shirt-men",
        description: "A breezy linen shirt dyed in natural indigo. The deep blue hue mellows beautifully over time, developing a personal patina.",
        shortDescription: "Natural indigo dyed linen shirt",
        categoryId: menLinenShirts?._id,
        gender: "men",
        images: [productImg("linen_shit_men_front.png", "Indigo Linen Shirt — Front", 0), productImg("linen_shit_men_back.png", "Indigo Linen Shirt — Back", 1)],
        basePrice: 299900,
        compareAtPrice: 359900,
        hasVariants: true,
        variants: [
          { sku: "MLS-IN-S", options: { size: "S" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "MLS-IN-M", options: { size: "M" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "MLS-IN-L", options: { size: "L" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "MLS-IN-XL", options: { size: "XL" }, priceDelta: 0, stock: 3, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Indigo",
        pattern: "Solid",
        occasion: "Casual",
        fit: "Regular",
        careInstructions: "Hand wash cold. Dry in shade. Iron medium.",
        madeIn: "India",
        tags: ["linen", "shirt", "indigo", "handloom"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- MEN: Linen Pants ---
      {
        title: "Handloom Linen Pants — Olive",
        slug: "handloom-linen-pants-olive-men",
        description: "Relaxed-fit linen pants in earthy olive. Handloom woven with a soft drape that breathes in summer heat. Elastic waistband with drawstring for comfort.",
        shortDescription: "Relaxed-fit handloom linen pants",
        categoryId: menLinenPants?._id,
        gender: "men",
        images: [productImg("Linen_paints_men_front.png", "Linen Pants Olive — Front", 0), productImg("Linen_paints_men_back.png", "Linen Pants Olive — Back", 1)],
        basePrice: 249900,
        hasVariants: true,
        variants: [
          { sku: "MLP-OL-30", options: { size: "30" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "MLP-OL-32", options: { size: "32" }, priceDelta: 0, stock: 9, isActive: true },
          { sku: "MLP-OL-34", options: { size: "34" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "MLP-OL-36", options: { size: "36" }, priceDelta: 0, stock: 4, isActive: true },
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
        tags: ["linen", "pants", "olive", "handloom"],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Handloom Linen Pants — Natural Beige",
        slug: "handloom-linen-pants-beige-men",
        description: "Natural beige linen pants with a tailored relaxed fit. The undyed linen showcases the raw beauty of handloom fabric.",
        shortDescription: "Undyed handloom linen pants",
        categoryId: menLinenPants?._id,
        gender: "men",
        images: [productImg("Linen_paints_men_front.png", "Linen Pants Beige — Front", 0), productImg("Linen_paints_men_back.png", "Linen Pants Beige — Back", 1)],
        basePrice: 249900,
        hasVariants: true,
        variants: [
          { sku: "MLP-BG-30", options: { size: "30" }, priceDelta: 0, stock: 5, isActive: true },
          { sku: "MLP-BG-32", options: { size: "32" }, priceDelta: 0, stock: 8, isActive: true },
          { sku: "MLP-BG-34", options: { size: "34" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "MLP-BG-36", options: { size: "36" }, priceDelta: 0, stock: 3, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Natural Beige",
        pattern: "Solid",
        occasion: "Casual",
        fit: "Relaxed",
        careInstructions: "Machine wash cold. Line dry.",
        madeIn: "India",
        tags: ["linen", "pants", "beige", "handloom", "undyed"],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- MEN: Calligraphed Linen Shirts ---
      {
        title: "Calligraphed Linen Shirt — Persian Script",
        slug: "calligraphed-linen-shirt-persian-men",
        description: "A handloom linen shirt featuring intricate Persian calligraphy hand-embroidered across the chest and back. A wearable art piece that merges heritage script with modern fashion.",
        shortDescription: "Hand-embroidered Persian calligraphy linen shirt",
        categoryId: menCalligraphed?._id,
        gender: "men",
        images: [productImg("Calligraphed_Linen_Shirts_men_front.png", "Calligraphed Shirt — Front", 0), productImg("Calligraphed_Linen_Shirts_men_back.png", "Calligraphed Shirt — Back", 1)],
        basePrice: 499900,
        compareAtPrice: 599900,
        hasVariants: true,
        variants: [
          { sku: "MCL-PS-M", options: { size: "M" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "MCL-PS-L", options: { size: "L" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "MCL-PS-XL", options: { size: "XL" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Natural",
        pattern: "Calligraphic Embroidery",
        occasion: "Evening / Statement",
        fit: "Regular",
        careInstructions: "Dry clean only. Store flat.",
        madeIn: "India",
        tags: ["calligraphy", "linen", "shirt", "embroidery", "persian", "art"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- MEN: Silver Button Shirts ---
      {
        title: "Linen Shirt with Silver Buttons — Ivory",
        slug: "linen-shirt-silver-buttons-ivory-men",
        description: "Premium handloom linen shirt finished with handcrafted sterling silver buttons. Each button is uniquely cast by artisan silversmiths, making every shirt one of a kind.",
        shortDescription: "Handloom linen with handcrafted silver buttons",
        categoryId: menSilverButton?._id,
        gender: "men",
        images: [productImg("silver_button_linen.png", "Silver Button Linen Shirt", 0), productImg("Silver_button_calligraphed_line_men_shirt.png", "Silver Button Detail", 1)],
        basePrice: 699900,
        hasVariants: true,
        variants: [
          { sku: "MSB-IV-S", options: { size: "S" }, priceDelta: 0, stock: 2, isActive: true },
          { sku: "MSB-IV-M", options: { size: "M" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "MSB-IV-L", options: { size: "L" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "MSB-IV-XL", options: { size: "XL" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Ivory",
        pattern: "Solid",
        occasion: "Premium / Evening",
        fit: "Tailored",
        careInstructions: "Dry clean recommended. Silver buttons: polish gently with soft cloth.",
        madeIn: "India",
        tags: ["silver-button", "linen", "shirt", "luxury", "artisan"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },
      {
        title: "Calligraphed Silver Button Shirt — Charcoal",
        slug: "calligraphed-silver-button-shirt-charcoal-men",
        description: "The ultimate statement piece — a charcoal linen shirt combining calligraphic embroidery with sterling silver buttons. Wearable art at its finest.",
        shortDescription: "Calligraphed linen shirt with silver buttons",
        categoryId: menSilverButton?._id,
        gender: "men",
        images: [productImg("Silver_button_calligraphed_line_men_shirt.png", "Calligraphed Silver Button Shirt", 0), productImg("Customized_Designed_Linen_shirts_with_silver_buttons_men.png", "Customized Silver Button Shirt", 1)],
        basePrice: 899900,
        hasVariants: true,
        variants: [
          { sku: "MCSB-CH-M", options: { size: "M" }, priceDelta: 0, stock: 2, isActive: true },
          { sku: "MCSB-CH-L", options: { size: "L" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "MCSB-CH-XL", options: { size: "XL" }, priceDelta: 0, stock: 1, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Charcoal",
        pattern: "Calligraphic Embroidery",
        occasion: "Evening / Luxury",
        fit: "Tailored",
        careInstructions: "Dry clean only.",
        madeIn: "India",
        tags: ["silver-button", "calligraphy", "linen", "shirt", "luxury", "charcoal"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- WOMEN: Linen Shirts ---
      {
        title: "Classic Linen Shirt — Soft White",
        slug: "classic-linen-shirt-soft-white-women",
        description: "A relaxed-fit handloom linen shirt for women. The soft white fabric and slightly oversized silhouette make it a versatile wardrobe staple.",
        shortDescription: "Relaxed handloom linen shirt",
        categoryId: womenLinenShirts?._id,
        gender: "women",
        images: [productImg("linen_shit_women_front.png", "Classic Linen Shirt Women — Front", 0), productImg("linen_shit_women_back.png", "Classic Linen Shirt Women — Back", 1)],
        basePrice: 269900,
        hasVariants: true,
        variants: [
          { sku: "WLS-SW-XS", options: { size: "XS" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "WLS-SW-S", options: { size: "S" }, priceDelta: 0, stock: 6, isActive: true },
          { sku: "WLS-SW-M", options: { size: "M" }, priceDelta: 0, stock: 8, isActive: true },
          { sku: "WLS-SW-L", options: { size: "L" }, priceDelta: 0, stock: 5, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Soft White",
        pattern: "Solid",
        occasion: "Casual / Office",
        fit: "Relaxed",
        careInstructions: "Machine wash cold. Line dry. Iron while slightly damp.",
        madeIn: "India",
        tags: ["linen", "shirt", "white", "women", "handloom"],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },

      // --- WOMEN: Linen Pants ---
      {
        title: "Handloom Linen Pants — Sage Green",
        slug: "handloom-linen-pants-sage-women",
        description: "Wide-leg linen pants in calming sage green. Handloom woven with a flowy drape, paired with an elastic waist for effortless comfort.",
        shortDescription: "Wide-leg handloom linen pants",
        categoryId: womenLinenPants?._id,
        gender: "women",
        images: [productImg("Linen_paints_women_front.jpg", "Linen Pants Women — Front", 0), productImg("Linen_paints_women_back.jpg", "Linen Pants Women — Back", 1)],
        basePrice: 239900,
        hasVariants: true,
        variants: [
          { sku: "WLP-SG-XS", options: { size: "XS" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "WLP-SG-S", options: { size: "S" }, priceDelta: 0, stock: 7, isActive: true },
          { sku: "WLP-SG-M", options: { size: "M" }, priceDelta: 0, stock: 9, isActive: true },
          { sku: "WLP-SG-L", options: { size: "L" }, priceDelta: 0, stock: 5, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Sage Green",
        pattern: "Solid",
        occasion: "Casual",
        fit: "Wide Leg Relaxed",
        careInstructions: "Machine wash cold. Hang dry.",
        madeIn: "India",
        tags: ["linen", "pants", "sage", "women", "handloom"],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        status: "active",
      },

      // --- WOMEN: Calligraphed Linen Shirts ---
      {
        title: "Calligraphed Linen Shirt — Devanagari Script",
        slug: "calligraphed-linen-shirt-devanagari-women",
        description: "A statement linen shirt with hand-embroidered Devanagari script flowing along the neckline and sleeve. Each piece is uniquely lettered by artisan embroiderers.",
        shortDescription: "Hand-embroidered Devanagari calligraphy shirt",
        categoryId: womenCalligraphed?._id,
        gender: "women",
        images: [productImg("Calligraphed_Linen_Shirts_women_front.png", "Calligraphed Shirt Women — Front", 0), productImg("Calligraphed_Linen_Shirts_women_back.png", "Calligraphed Shirt Women — Back", 1)],
        basePrice: 479900,
        compareAtPrice: 579900,
        hasVariants: true,
        variants: [
          { sku: "WCL-DV-S", options: { size: "S" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "WCL-DV-M", options: { size: "M" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "WCL-DV-L", options: { size: "L" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Natural",
        pattern: "Calligraphic Embroidery",
        occasion: "Evening / Statement",
        fit: "Regular",
        careInstructions: "Dry clean only. Store flat.",
        madeIn: "India",
        tags: ["calligraphy", "linen", "shirt", "embroidery", "devanagari", "women"],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        status: "active",
      },

      // --- WOMEN: Silver Button Shirts ---
      {
        title: "Linen Shirt with Silver Buttons — Blush",
        slug: "linen-shirt-silver-buttons-blush-women",
        description: "Soft blush-toned handloom linen shirt adorned with artisanal sterling silver buttons. Feminine, luxurious, and one of a kind.",
        shortDescription: "Blush linen with handcrafted silver buttons",
        categoryId: womenSilverButton?._id,
        gender: "women",
        images: [productImg("silver_button_linen_women_shirt.png", "Silver Button Shirt Women", 0), productImg("Shilver_button_calligraphed_linen_shirts_women.png", "Silver Button Calligraphed Women", 1)],
        basePrice: 679900,
        hasVariants: true,
        variants: [
          { sku: "WSB-BL-XS", options: { size: "XS" }, priceDelta: 0, stock: 2, isActive: true },
          { sku: "WSB-BL-S", options: { size: "S" }, priceDelta: 0, stock: 4, isActive: true },
          { sku: "WSB-BL-M", options: { size: "M" }, priceDelta: 0, stock: 3, isActive: true },
          { sku: "WSB-BL-L", options: { size: "L" }, priceDelta: 0, stock: 2, isActive: true },
        ],
        stock: 0,
        fabric: "Handloom Linen",
        weave: "Plain Weave",
        color: "Blush",
        pattern: "Solid",
        occasion: "Premium / Evening",
        fit: "Tailored",
        careInstructions: "Dry clean recommended. Silver buttons: polish gently with soft cloth.",
        madeIn: "India",
        tags: ["silver-button", "linen", "shirt", "luxury", "women", "blush"],
        isFeatured: true,
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
