import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isBlocked } = await request.json();

    await connectDB();
    const customer = await Customer.findByIdAndUpdate(id, { isBlocked }, { new: true });
    
    if (!customer) {
      return Response.json({ ok: false, error: "Customer not found" }, { status: 404 });
    }

    return Response.json({ ok: true, data: customer });
  } catch {
    return Response.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // Only super admin can delete customers
    if (!session || session.user.role !== "admin") {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const customer = await Customer.findByIdAndDelete(id);
    
    if (!customer) {
      return Response.json({ ok: false, error: "Customer not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
