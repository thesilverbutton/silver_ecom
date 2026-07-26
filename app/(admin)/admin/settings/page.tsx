import { connectDB } from "@/lib/db";
import { Settings } from "@/models/settings.model";
import { formatINR } from "@/lib/utils";

export default async function AdminSettingsPage() {
  await connectDB();
  const settings = await Settings.findOne({}).lean();

  if (!settings) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-4 text-muted-foreground">No settings found. Run the seed script.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">Store configuration</p>

      <div className="mt-6 max-w-2xl space-y-6">
        <SettingRow label="Store Name" value={settings.storeName} />
        <SettingRow label="Support Email" value={settings.supportEmail} />
        <SettingRow label="Support Phone" value={settings.supportPhone} />
        <SettingRow label="Currency" value={settings.currency} />
        <SettingRow label="GST Enabled" value={settings.gstEnabled ? "Yes" : "No"} />
        {settings.gstEnabled && <SettingRow label="GST %" value={`${settings.gstPercent}%`} />}
        <SettingRow label="Flat Shipping Rate" value={formatINR(settings.flatShippingRate)} />
        <SettingRow label="Free Shipping Threshold" value={settings.freeShippingThreshold ? formatINR(settings.freeShippingThreshold) : "—"} />
        <SettingRow label="COD Enabled" value={settings.codEnabled ? "Yes" : "No"} />
        <SettingRow label="Return Window" value={`${settings.returnWindowDays} days`} />
        <SettingRow label="Origin Pincode" value={settings.originPincode} />
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Settings editing UI coming soon. Contact developer to update.
      </p>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
