import mongoose from "mongoose";

/**
 * Global cached connection to prevent multiple connections during hot reload.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  // Read at call time, not module load. Throwing during module evaluation on a
  // serverless platform surfaces only as an opaque render digest with no clue
  // which variable is missing.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. On Vercel, add it under Project Settings → " +
        "Environment Variables for the Production environment, then redeploy. " +
        "Note that .env.production is gitignored and never reaches the platform.",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "silver_button",
        bufferCommands: false,
        serverSelectionTimeoutMS: 10_000,
      })
      .catch((err: Error) => {
        // A serverless function's egress IP is not fixed, so Atlas must allow
        // 0.0.0.0/0 (or use VPC peering). This is the most common cause of a
        // deployment that works locally but not in production.
        const hint = /ETIMEDOUT|ENOTFOUND|whitelist|not authorized|IP that isn't whitelisted/i.test(
          err.message,
        )
          ? " — check the MongoDB Atlas Network Access list allows 0.0.0.0/0, and that the credentials in MONGODB_URI are correct for this cluster."
          : "";
        throw new Error(`MongoDB connection failed: ${err.message}${hint}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
