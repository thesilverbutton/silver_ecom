"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { href: "/shop", icon: LayoutGrid, label: "Shop", match: (p: string) => p.startsWith("/shop") || p.startsWith("/men") || p.startsWith("/women") || p.startsWith("/new-arrivals") },
    { href: "/account/wishlist", icon: Heart, label: "Wishlist", match: (p: string) => p.includes("/wishlist") },
    { href: "/account", icon: User, label: "Account", match: (p: string) => p === "/account" || p.startsWith("/account/orders") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex w-full flex-col items-center justify-center h-full border-t-2 pt-1 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className="mb-1 h-5 w-5"
                fill={isActive ? "currentColor" : "none"}
                strokeWidth={isActive ? 1.5 : 2}
              />
              <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileNav };
