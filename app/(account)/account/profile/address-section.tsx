"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2 } from "lucide-react";

interface Address {
  _id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressSectionProps {
  addresses: Address[];
}

export function AddressSection({ addresses }: AddressSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setShowModal(false);
        setForm({ label: "", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
        router.refresh();
      } else {
        setError(data.error?.message || "Failed to add address");
      }
    });
  };

  const handleDelete = (addressId: string) => {
    startTransition(async () => {
      await fetch("/api/account/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });
      router.refresh();
    });
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Saved Addresses</h3>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No saved addresses</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="relative rounded-lg border p-4">
              {addr.label && (
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">{addr.label}</span>
              )}
              <p className="text-sm font-medium">{addr.fullName}</p>
              <p className="text-sm text-muted-foreground">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
              <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              {addr.isDefault && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(addr._id)}
                disabled={isPending}
                className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-destructive"
                aria-label="Delete address"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add address modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Add Address</h3>

            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}

            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Label (optional)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => updateField("label", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Home / Work"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Address Line 1 *</label>
                <input type="text" value={form.line1} onChange={(e) => updateField("line1", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Address Line 2</label>
                <input type="text" value={form.line2} onChange={(e) => updateField("line2", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">City *</label>
                  <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">State *</label>
                  <input type="text" value={form.state} onChange={(e) => updateField("state", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Pincode *</label>
                  <input type="text" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required minLength={6} />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Address"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
