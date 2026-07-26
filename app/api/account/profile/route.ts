import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ ok: false, error: { message: "Unauthenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: { message: "Invalid input" } }, { status: 400 });
    }

    await connectDB();
    const customer = await Customer.findOne({ email: session.user.email });
    if (!customer) {
      return Response.json({ ok: false, error: { message: "Customer not found" } }, { status: 404 });
    }

    // Update name
    if (parsed.data.name) {
      customer.name = parsed.data.name;
    }

    // Update phone
    if (parsed.data.phone) {
      customer.phone = parsed.data.phone;
    }

    // Change password
    if (parsed.data.newPassword) {
      if (!parsed.data.currentPassword) {
        return Response.json({ ok: false, error: { message: "Current password required" } }, { status: 400 });
      }

      if (!customer.passwordHash) {
        return Response.json({ ok: false, error: { message: "No password set on this account" } }, { status: 400 });
      }

      const valid = await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash);
      if (!valid) {
        return Response.json({ ok: false, error: { message: "Current password is incorrect" } }, { status: 400 });
      }

      customer.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    }

    await customer.save();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { message: "Update failed" } }, { status: 500 });
  }
}
