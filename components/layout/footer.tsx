import Link from "next/link";

function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/50 pt-20 pb-10">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-5 md:grid-cols-4 md:px-16">
        {/* Brand Column */}
        <div className="col-span-1 mb-6 md:mb-0">
          <span className="mb-6 block font-[family-name:var(--font-serif)] text-xl font-semibold text-foreground">
            The Silver Button
          </span>
          <p className="pr-4 text-sm text-muted-foreground">
            Crafting Heritage, Sustaining Artistry. Woven with purpose and made to last.
          </p>
        </div>

        {/* Men Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Men
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              href="/men/linen-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Linen Shirts
            </Link>
            <Link
              href="/men/linen-pants"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Linen Pants
            </Link>
            <Link
              href="/men/calligraphed-linen-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Calligraphed Linen Shirts
            </Link>
            <Link
              href="/men/silver-button-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Silver Button Shirts
            </Link>
          </div>
        </div>

        {/* Women Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Women
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              href="/women/linen-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Linen Shirts
            </Link>
            <Link
              href="/women/linen-pants"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Linen Pants
            </Link>
            <Link
              href="/women/calligraphed-linen-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Calligraphed Linen Shirts
            </Link>
            <Link
              href="/women/silver-button-shirts"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Silver Button Shirts
            </Link>
          </div>
        </div>

        {/* Company & Support Column */}
        <div className="col-span-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
            Company
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <Link
              href="/about"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Contact Us
            </Link>
            <Link
              href="/policies/shipping"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Shipping &amp; Returns
            </Link>
            <Link
              href="/policies/privacy"
              className="inline-block w-fit transition-all duration-200 hover:translate-x-1 hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-16 max-w-[1280px] px-5 md:px-16">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} The Silver Button. Crafting Heritage, Sustaining
          Artistry.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
