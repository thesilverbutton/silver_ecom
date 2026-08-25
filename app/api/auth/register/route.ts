import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";
import { Order } from "@/models/order.model";
import { logger } from "@/lib/logger";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().optional(),
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
    const customer = await Customer.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.phone || undefined,
      role: "customer",
      isBlocked: false,
      addresses: [],
      wishlist: [],
    });

    // Link all existing guest orders with this email to the new customer
    const linkResult = await Order.updateMany(
      { email: parsed.data.email, isGuest: true, customerId: { $exists: false } },
      { $set: { customerId: customer._id, isGuest: false } },
    );

    if (linkResult.modifiedCount > 0) {
      logger.info("Linked guest orders to new customer", {
        customerId: String(customer._id),
        email: parsed.data.email,
        linkedCount: linkResult.modifiedCount,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: { message: "Registration failed" } },
      { status: 500 },
    );
  }
}
