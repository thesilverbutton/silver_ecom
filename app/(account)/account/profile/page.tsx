import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";
import { ProfileForm } from "./profile-form";
import { AddressSection } from "./address-section";
import { SignOutSection } from "./sign-out-section";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;

  await connectDB();
  const customer = await Customer.findOne({ email: session.user.email })
    .select("name email phone addresses")
    .lean();

  const addresses = (customer?.addresses || []).map((a) => ({
    _id: String(a._id),
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: a.isDefault,
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account details</p>

      <ProfileForm
        initialName={customer?.name || session.user.name || ""}
        initialPhone={customer?.phone || ""}
        email={session.user.email}
      />

      <AddressSection addresses={addresses} />

      <SignOutSection />
    </div>
  );
}
