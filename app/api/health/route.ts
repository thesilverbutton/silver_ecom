import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "up" : "down";

    return Response.json({ ok: true, db: dbStatus });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503 });
  }
}
