"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig } from "@/config/site";
import { useCartCount } from "@/hooks/use-cart-count";
import { SearchOverlay } from "@/components/search/search-overlay";
import { SocialLinks } from "./social-links";

export interface NavItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}

interface NavbarProps {
  cartCount?: number;
  className?: string;
  /** Optional dynamic nav (built from live categories). Falls back to static config. */
  navItems?: readonly NavItem[];
}

function Navbar({ cartCount = 0, className, navItems }: NavbarProps) {
  const mainNav: readonly NavItem[] = navItems && navItems.length > 0 ? navItems : navConfig.mainNav;
  const currentCartCount = useCartCount(cartCount);

  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300",
          className,
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-16">
          {/* Mobile: menu button (left) */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Left (desktop): Logo — /logo.png is the wordmark trimmed of its
              surrounding whitespace, so the height below is the actual text height. */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="The Silver Button"
              width={1000}
              height={141}
              className="h-5 w-auto sm:h-6 md:h-9 lg:h-10"
              sizes="(max-width: 768px) 170px, 284px"
              quality={100}
              priority
            />
          </Link>

          {/* Center: Nav links (desktop) */}
          <nav className="hidden md:flex md:items-center md:gap-8">
            {mainNav.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:text-foreground",
                    hoveredNav === item.label && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>

                {/* Dropdown */}
                {"children" in item && item.children && hoveredNav === item.label && (
                  <div className="absolute left-0 top-full z-50 w-48 pt-2">
                    <div className="rounded-md border bg-background p-2 shadow-md">
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
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            {/* Socials — desktop only; the mobile drawer carries its own row. */}
            <SocialLinks
              className="mr-1 hidden gap-0 border-r border-border pr-2 lg:flex"
              iconClassName="h-[18px] w-[18px]"
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:bg-secondary"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:bg-secondary md:inline-flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:bg-secondary"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {currentCartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {currentCartCount > 9 ? "9+" : currentCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <nav
            className="absolute inset-y-0 left-0 flex w-full max-w-[375px] flex-col bg-background shadow-2xl"
            aria-label="Mobile Navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-6">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="The Silver Button"
                  width={1000}
                  height={141}
                  className="h-6 w-auto"
                  sizes="200px"
                  quality={100}
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close Navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-2">
                {mainNav.map((item) => (
                  <li key={item.label} className="border-b border-border pb-2">
                    {"children" in item && item.children ? (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between py-4 text-sm font-semibold uppercase tracking-widest text-foreground"
                          onClick={() =>
                            setExpandedMobile(expandedMobile === item.label ? null : item.label)
                          }
                          aria-expanded={expandedMobile === item.label}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              expandedMobile === item.label && "rotate-180",
                            )}
                          />
                        </button>
                        {expandedMobile === item.label && (
                          <ul className="space-y-4 pb-4 pl-4 pt-2">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block text-muted-foreground transition-all hover:translate-x-1 hover:text-foreground"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-4 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Utility links */}
              <div className="mt-8 space-y-4">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              </div>
            </div>

            {/* Footer with social icons */}
            <div className="border-t border-border bg-secondary/50 p-5">
              <SocialLinks className="justify-center gap-3" />
            </div>
          </nav>
        </div>
      )}

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}

export { Navbar };
