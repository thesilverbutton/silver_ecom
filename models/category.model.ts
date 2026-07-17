import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string; alt: string };
  parentId?: mongoose.Types.ObjectId;
  kind: "category" | "collection";
  position: number;
  isActive: boolean;
  seo?: { title?: string; description?: string };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    image: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String },
    },
    parentId: { type: Schema.Types.ObjectId, ref: "Category" },
    kind: { type: String, enum: ["category", "collection"], default: "category" },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      title: { type: String },
      description: { type: String },
    },
  },
  { timestamps: true },
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1, position: 1 });
CategorySchema.index({ isActive: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
