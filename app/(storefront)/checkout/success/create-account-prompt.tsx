"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";

interface CreateAccountPromptProps {
  email: string;
  name: string;
  phone?: string;
}

export function CreateAccountPrompt({ email, name, phone }: CreateAccountPromptProps) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await res.json();

        if (!data.ok) {
          setError(data.error?.message || "Could not create account");
          return;
        }

        // Auto-login after registration
        const loginResult = await signIn("customer", {
          email,
          password,
          redirect: false,
        });

        if (loginResult?.error) {
          setCreated(true); // Account created but auto-login failed
          return;
        }

        // Redirect to orders page
        window.location.href = "/account/orders";
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  if (created) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-left">
        <h3 className="font-semibold text-green-800">Account created!</h3>
        <p className="mt-1 text-sm text-green-700">
          You can now{" "}
          <a href="/login?next=/account/orders" className="font-medium underline">log in</a>
          {" "}to view your orders.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/40 p-6 text-left shadow-sm">
      <div className="flex items-center gap-3 text-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-base font-semibold">Save your details for next time</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        Set a password to instantly track this order, save addresses, and check out faster in the future.
      </p>

      <form onSubmit={handleCreate} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">Set a Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
