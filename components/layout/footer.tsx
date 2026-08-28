import Link from "next/link";
import Image from "next/image";
import type { NavItem } from "./navbar";
import { SocialLinks } from "./social-links";

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
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Men
          </h3>
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
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Women
          </h3>
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
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Company
          </h3>
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
        </div>
        <p className="order-last text-center text-xs text-muted-foreground sm:order-none">
          &copy; {new Date().getFullYear()} The Silver Button. All rights reserved.
        </p>
        <SocialLinks className="-mr-2 gap-1" />
      </div>
    </footer>
  );
}

export { Footer };
