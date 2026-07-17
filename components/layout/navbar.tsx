"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import { Container } from "./section";
import { navConfig } from "@/config/site";

interface NavbarProps {
  cartCount?: number;
  className?: string;
}

function Navbar({ cartCount = 0, className }: NavbarProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className,
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Left: mobile menu + logo */}
            <div className="flex items-center gap-3">
              <IconButton
                label="Open menu"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </IconButton>
              <Link href="/" className="font-[family-name:var(--font-serif)] text-xl font-bold tracking-tight">
                The Silver Button
              </Link>
            </div>

            {/* Center: navigation (hidden on mobile) */}
            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              {navConfig.mainNav.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      hoveredNav === item.label && "text-foreground",
                    )}
                  >
                    {item.label}
                    {"children" in item && item.children && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {"children" in item && item.children && hoveredNav === item.label && (
                    <div className="absolute left-0 top-full z-50 mt-0 w-48 rounded-md border bg-background p-2 shadow-md">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right: icons */}
            <div className="flex items-center gap-1">
              <IconButton label="Search" size="sm">
                <Search className="h-5 w-5" />
              </IconButton>
              <IconButton label="Account" size="sm">
                <User className="h-5 w-5" />
              </IconButton>
              <IconButton label="Cart" size="sm" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </IconButton>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[280px] bg-background p-6 shadow-xl overflow-y-auto">
            {/* Close */}
            <div className="mb-6 flex items-center justify-between">
              <span className="font-[family-name:var(--font-serif)] text-lg font-bold">
                The Silver Button
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {navConfig.mainNav.map((item) => (
                <div key={item.label}>
                  {"children" in item && item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobile(expandedMobile === item.label ? null : item.label)
                        }
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedMobile === item.label && "rotate-180",
                          )}
                        />
                      </button>
                      {expandedMobile === item.label && (
                        <div className="ml-3 space-y-1 border-l pl-3">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom links */}
            <div className="mt-8 border-t pt-6 space-y-1">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                My Account
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { Navbar };
