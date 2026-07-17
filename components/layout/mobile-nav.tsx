"use client";

import Link from "next/link";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  cartCount?: number;
  className?: string;
}

function MobileNav({ cartCount = 0, className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden",
        className,
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around px-4">
        <MobileNavLink href="/" icon={<Home className="h-5 w-5" />} label="Home" />
        <MobileNavLink href="/shop" icon={<Search className="h-5 w-5" />} label="Shop" />
        <MobileNavLink href="/account/wishlist" icon={<Heart className="h-5 w-5" />} label="Wishlist" />
        <MobileNavLink href="/cart" icon={
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>
        } label="Cart" />
        <MobileNavLink href="/account" icon={<User className="h-5 w-5" />} label="Account" />
      </div>
    </nav>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export { MobileNav };
