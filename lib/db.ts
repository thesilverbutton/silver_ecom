import dns from "node:dns";
import mongoose from "mongoose";

/**
 * `mongodb+srv://` URIs need an SRV lookup through Node's own DNS client. On some
 * machines (local DNS proxies, VPNs) Node only sees a loopback resolver that refuses
 * SRV queries, which surfaces as `querySrv ECONNREFUSED`. When that is the only
 * resolver configured, fall back to public DNS. Machines with a normal resolver
 * (including production hosts) are left untouched.
 */
if (process.env.MONGODB_URI?.startsWith("mongodb+srv://")) {
  const servers = dns.getServers();
  const loopbackOnly =
    servers.length > 0 && servers.every((s) => s === "127.0.0.1" || s === "::1");
  if (loopbackOnly) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

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

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || "silver_button",
      bufferCommands: false,
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
