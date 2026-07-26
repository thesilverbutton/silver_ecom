import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { message: "Invalid input" } },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if customer already exists
    const existing = await Customer.findOne({ email: parsed.data.email });
    if (existing) {
      return Response.json(
        { ok: false, error: { message: "An account with this email already exists" } },
        { status: 409 },
      );
    }

    // Create customer
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await Customer.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "customer",
      isBlocked: false,
      addresses: [],
      wishlist: [],
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: { message: "Registration failed" } },
      { status: 500 },
    );
  }
}
