import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";
import { Product } from "@/models/product.model";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  await connectDB();

  const menParent = await Category.findOne({ slug: "men" }).lean();
  const womenParent = await Category.findOne({ slug: "women" }).lean();

  const [menCats, womenCats] = await Promise.all([
    menParent ? Category.find({ parentId: menParent._id }).sort({ position: 1 }).lean() : [],
    womenParent ? Category.find({ parentId: womenParent._id }).sort({ position: 1 }).lean() : [],
  ]);

  // Count products per category
  const withCounts = async (cats: typeof menCats, gender: "men" | "women") =>
    Promise.all(
      cats.map(async (c) => ({
        _id: String(c._id),
        name: c.name,
        slug: c.slug,
        gender,
        productCount: await Product.countDocuments({ categoryId: c._id }),
      })),
    );

  const [menCategories, womenCategories] = await Promise.all([
    withCounts(menCats, "men"),
    withCounts(womenCats, "women"),
  ]);

  return <CategoriesClient menCategories={menCategories} womenCategories={womenCategories} />;
}
