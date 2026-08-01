import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  gstEnabled: boolean;
  gstPercent?: number;
  freeShippingThreshold?: number;
  flatShippingRate: number;
  codEnabled: boolean;
  returnWindowDays: number;
  originPincode: string;
  socials: {
    instagram?: string;
    facebook?: string;
    x?: string;
    whatsapp?: string;
  };
  announcementBar?: {
    text: string;
    isActive: boolean;
  };
  policies: {
    shipping: string;
    returns: string;
    privacy: string;
    terms: string;
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, required: true },
    supportEmail: { type: String, required: true },
    supportPhone: { type: String, required: true },
    currency: { type: String, default: "INR" },
    gstEnabled: { type: Boolean, default: false },
    gstPercent: { type: Number },
    freeShippingThreshold: { type: Number },
    flatShippingRate: { type: Number, default: 0 },
    codEnabled: { type: Boolean, default: false },
    returnWindowDays: { type: Number, default: 7 },
    originPincode: { type: String, required: true },
    socials: {
      instagram: { type: String },
      facebook: { type: String },
      x: { type: String },
      whatsapp: { type: String },
    },
    announcementBar: {
      text: { type: String },
      isActive: { type: Boolean, default: false },
    },
    policies: {
      shipping: { type: String, default: "" },
      returns: { type: String, default: "" },
      privacy: { type: String, default: "" },
      terms: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
