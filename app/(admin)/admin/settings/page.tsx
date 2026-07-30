import { connectDB } from "@/lib/db";
import { Settings } from "@/models/settings.model";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  await connectDB();
  const settings = await Settings.findOne({}).lean();

  if (!settings) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-4 text-muted-foreground">No settings found. Run <code>pnpm seed</code> first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Store configuration — changes take effect immediately</p>

      <div className="mt-8">
        <SettingsForm
          initial={{
            storeName: settings.storeName,
            supportEmail: settings.supportEmail,
            supportPhone: settings.supportPhone,
            gstEnabled: settings.gstEnabled,
            gstPercent: settings.gstPercent,
            flatShippingRate: settings.flatShippingRate,
            freeShippingThreshold: settings.freeShippingThreshold,
            codEnabled: settings.codEnabled,
            returnWindowDays: settings.returnWindowDays,
            originPincode: settings.originPincode,
          }}
        />
      </div>
    </div>
  );
}
