import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IContactQuery extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

const ContactQuerySchema = new Schema<IContactQuery>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, default: "new", enum: ["new", "read", "replied"] },
  },
  { timestamps: true }
);

ContactQuerySchema.index({ createdAt: -1 });

export const ContactQuery: Model<IContactQuery> =
  mongoose.models.ContactQuery || mongoose.model<IContactQuery>("ContactQuery", ContactQuerySchema);
