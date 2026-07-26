"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutSection() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="mt-8 border-t pt-8">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Sign Out</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to sign out of your account?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white hover:bg-destructive/90"
              >
                Yes, Sign Out
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
