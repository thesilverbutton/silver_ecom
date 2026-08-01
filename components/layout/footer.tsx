import Link from "next/link";
import Image from "next/image";
import type { NavItem } from "./navbar";

interface FooterProps {
  navItems?: readonly NavItem[];
}

function Footer({ navItems }: FooterProps) {
  const menLinks = navItems?.find((n) => n.label === "Men")?.children?.filter((l) => l.label !== "All Men") || [];
  const womenLinks = navItems?.find((n) => n.label === "Women")?.children?.filter((l) => l.label !== "All Women") || [];

  // Bottom padding clears the fixed mobile tab bar (h-16) plus the device safe area,
  // so the copyright row is never hidden behind it on phones.
  return (
    <footer className="border-t border-border bg-secondary/50 pt-12 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] md:pt-20 md:pb-10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-5 md:grid-cols-4 md:px-16">
        {/* Brand Column */}
        <div className="col-span-2 md:col-span-1">
          <span className="mb-3 block font-[family-name:var(--font-serif)] text-lg font-semibold text-foreground md:mb-6 md:text-xl">
            The Silver Button
          </span>
          <p className="max-w-sm text-sm text-muted-foreground md:pr-4">
            Crafting Heritage, Sustaining Artistry. Woven with purpose and made to last.
          </p>
        </div>

        {/* Men Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Men
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            {menLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Women Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Women
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            {womenLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Company & Support Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Company
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link href="/about" className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground">
              Our Story
            </Link>
            <Link href="/contact" className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground">
              Contact Us
            </Link>
            <Link href="/policies/shipping" className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground">
              Shipping &amp; Returns
            </Link>
            <Link href="/policies/privacy" className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-12 flex max-w-[1280px] flex-col items-center justify-between gap-5 border-t border-border px-5 pt-8 sm:flex-row md:mt-16 md:px-16">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Image src="/icons/visa-icon.png" alt="Visa" width={48} height={32} style={{ width: "auto", height: "auto" }} />
          <Image src="/icons/master-card-icon.png" alt="Mastercard" width={48} height={32} style={{ width: "auto", height: "auto" }} />
          <Image src="/icons/upi-payment-icon.png" alt="UPI" width={48} height={32} style={{ width: "auto", height: "auto" }} />
          <Image src="/icons/razorpay-icon.png" alt="Razorpay" width={80} height={32} style={{ width: "auto", height: "auto" }} />
        </div>
        <p className="order-last text-center text-xs text-muted-foreground sm:order-none">
          &copy; {new Date().getFullYear()} The Silver Button. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <a href="https://www.instagram.com/silver_button.in" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61592903033118" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
