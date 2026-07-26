"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  email: string;
}

export function ProfileForm({ initialName, initialPhone, email }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess("Profile updated successfully");
        router.refresh();
      } else {
        setError(data.error?.message || "Update failed");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordModal(false);
      } else {
        setError(data.error?.message || "Password change failed");
      }
    });
  };

  return (
    <>
      <div className="mt-6 max-w-md space-y-6">
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}
        {error && !showPasswordModal && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Personal info form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="10-digit mobile number"
            />
          </div>

          {/* Password field — read-only with change button */}
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="flex items-center gap-3">
              <input
                type="password"
                value="••••••••"
                disabled
                className="flex-1 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="shrink-0 rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Change
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Password change modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter your current and new password</p>

            {error && showPasswordModal && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? "Changing..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError("");
                  }}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
