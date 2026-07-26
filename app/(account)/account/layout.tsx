import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountNavClient } from "./account-nav";
import { SignOutButton } from "./sign-out-button";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?next=/account");

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4" style={{ height: "calc(100vh - 80px)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{session.user.name}</h1>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      {/* Mobile: bottom tab bar for account nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md lg:hidden">
        <AccountNavClient />
      </div>

      {/* Nav + Content */}
      <div className="mt-0 grid min-h-0 flex-1 gap-0 lg:grid-cols-[220px_1px_1fr]">
        {/* Sidebar — desktop only */}
        <div className="hidden overflow-hidden py-6 lg:block">
          <AccountNavClient />
        </div>

        {/* Divider */}
        <div className="hidden lg:block bg-border" />

        {/* Content — scrollable */}
        <div className="overflow-y-auto scrollbar-hidden py-6 pb-24 lg:pb-6 lg:pl-8">{children}</div>
      </div>
    </div>
  );
}
