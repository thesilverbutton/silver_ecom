import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";

const addSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1),
  phone: z.string().min(10),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ ok: false, error: { message: "Unauthenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: { message: "Invalid address" } }, { status: 400 });
    }

    await connectDB();
    const customer = await Customer.findOne({ email: session.user.email });
    if (!customer) {
      return Response.json({ ok: false, error: { message: "Customer not found" } }, { status: 404 });
    }

    const isFirst = customer.addresses.length === 0;
    customer.addresses.push({
      ...parsed.data,
      country: "India",
      isDefault: isFirst,
    } as typeof customer.addresses[0]);

    await customer.save();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { message: "Failed" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ ok: false, error: { message: "Unauthenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const { addressId } = body;
    if (!addressId) {
      return Response.json({ ok: false, error: { message: "Missing addressId" } }, { status: 400 });
    }

    await connectDB();
    await Customer.updateOne(
      { email: session.user.email },
      { $pull: { addresses: { _id: addressId } } },
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { message: "Failed" } }, { status: 500 });
  }
}
