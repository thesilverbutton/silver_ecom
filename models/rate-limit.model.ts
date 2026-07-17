import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRateLimit extends Document {
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true },
  count: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true },
});

// TTL index: MongoDB auto-deletes expired documents
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RateLimitSchema.index({ key: 1 }, { unique: true });

export const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
