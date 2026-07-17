import Link from "next/link";
import Image from "next/image";
import { Container } from "./section";

function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-[family-name:var(--font-serif)] text-lg font-bold">
              The Silver Button
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Handloom fashion for men and women, crafted with tradition and care.
            </p>
          </div>

          {/* Men */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Men</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/men/shirts" className="transition-colors hover:text-foreground">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/men/kurtas" className="transition-colors hover:text-foreground">
                  Kurtas
                </Link>
              </li>
              <li>
                <Link href="/men/trousers" className="transition-colors hover:text-foreground">
                  Trousers
                </Link>
              </li>
              <li>
                <Link href="/men/jackets" className="transition-colors hover:text-foreground">
                  Jackets
                </Link>
              </li>
              <li>
                <Link href="/men" className="transition-colors hover:text-foreground">
                  All Men
                </Link>
              </li>
            </ul>
          </div>

          {/* Women */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Women</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/women/sarees" className="transition-colors hover:text-foreground">
                  Sarees
                </Link>
              </li>
              <li>
                <Link href="/women/kurtas" className="transition-colors hover:text-foreground">
                  Kurtas
                </Link>
              </li>
              <li>
                <Link href="/women/dupattas" className="transition-colors hover:text-foreground">
                  Dupattas
                </Link>
              </li>
              <li>
                <Link href="/women/dresses" className="transition-colors hover:text-foreground">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/women" className="transition-colors hover:text-foreground">
                  All Women
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Policies */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="transition-colors hover:text-foreground">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="transition-colors hover:text-foreground">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="transition-colors hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Payment icons */}
            <div className="flex items-center gap-3">
              <Image src="/icons/visa-icon.png" alt="Visa" width={48} height={32} className="h-8 w-auto" style={{ width: "auto", height: "32px" }} />
              <Image src="/icons/master-card-icon.png" alt="Mastercard" width={48} height={32} className="h-8 w-auto" style={{ width: "auto", height: "32px" }} />
              <Image src="/icons/upi-payment-icon.png" alt="UPI" width={48} height={32} className="h-8 w-auto" style={{ width: "auto", height: "32px" }} />
              <Image src="/icons/razorpay-icon.png" alt="Razorpay" width={80} height={32} className="h-8 w-auto" style={{ width: "auto", height: "32px" }} />
            </div>

            {/* Copyright + credit */}
            <div className="text-center text-xs text-muted-foreground sm:text-left">
              <p>&copy; {new Date().getFullYear()} The Silver Button. All rights reserved.</p>
              <p className="mt-0.5">
                Built by{" "}
                <a
                  href="mailto:risawgc@gmail.com"
                  className="font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Rishab Chhetri
                </a>
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
