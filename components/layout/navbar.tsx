"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig } from "@/config/site";
import { SearchOverlay } from "@/components/search/search-overlay";

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
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
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
              <div className="flex justify-center gap-6">
                <a
                  href="https://www.instagram.com/silver_button.in"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61592903033118"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
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
