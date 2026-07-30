"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettingsAction, type SettingsInput } from "@/actions/settings";

interface Props {
  initial: SettingsInput;
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<SettingsInput>(initial);

  const update = (key: keyof SettingsInput, value: string | boolean | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await updateSettingsAction(form);
      if (result.ok) {
        setSuccess("Settings saved successfully");
        router.refresh();
      } else {
        setError(result.error || "Failed to save");
      }
    });
  };

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8 pb-12">
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {/* Store Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Store Information</h2>
        <div>
          <label className={labelClass}>Store Name</label>
          <input value={form.storeName} onChange={(e) => update("storeName", e.target.value)} className={inputClass} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Support Phone</label>
            <input value={form.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} className={inputClass} required />
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Flat Shipping Rate (₹)</label>
            <input
              type="number"
              value={form.flatShippingRate / 100}
              onChange={(e) => update("flatShippingRate", Math.round(parseFloat(e.target.value || "0") * 100))}
              className={inputClass}
              min={0}
            />
            <p className="mt-1 text-xs text-muted-foreground">Set to 0 for free shipping always</p>
          </div>
          <div>
            <label className={labelClass}>Free Shipping Above (₹)</label>
            <input
              type="number"
              value={form.freeShippingThreshold ? form.freeShippingThreshold / 100 : ""}
              onChange={(e) => update("freeShippingThreshold", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)}
              className={inputClass}
              min={0}
              placeholder="Leave empty for no threshold"
            />
          </div>
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.codEnabled}
            onChange={(e) => update("codEnabled", e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm font-medium">Enable Cash on Delivery (COD)</span>
        </label>
        <div className="max-w-xs">
          <label className={labelClass}>Origin Pincode</label>
          <input value={form.originPincode} onChange={(e) => update("originPincode", e.target.value)} className={inputClass} required />
        </div>
      </section>

      {/* Tax */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tax</h2>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.gstEnabled}
            onChange={(e) => update("gstEnabled", e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm font-medium">Enable GST</span>
        </label>
        {form.gstEnabled && (
          <div className="max-w-xs">
            <label className={labelClass}>GST Percentage (%)</label>
            <input
              type="number"
              value={form.gstPercent || ""}
              onChange={(e) => update("gstPercent", parseFloat(e.target.value) || undefined)}
              className={inputClass}
              min={0}
              max={100}
              placeholder="e.g. 18"
            />
          </div>
        )}
      </section>

      {/* Returns */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Returns</h2>
        <div className="max-w-xs">
          <label className={labelClass}>Return Window (days)</label>
          <input
            type="number"
            value={form.returnWindowDays}
            onChange={(e) => update("returnWindowDays", parseInt(e.target.value) || 7)}
            className={inputClass}
            min={0}
          />
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
