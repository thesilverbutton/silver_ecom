"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Heart, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", mobileLabel: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My Orders", mobileLabel: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", mobileLabel: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile & Addresses", mobileLabel: "Profile", icon: User },
];

export function AccountNavClient() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile: fixed bottom tab bar */}
      <nav className="flex items-center justify-around py-3 lg:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
                isActive(item.href, item.exact)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive(item.href, item.exact) && "text-primary")} />
              {item.mobileLabel}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden flex-col gap-1 lg:flex">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
