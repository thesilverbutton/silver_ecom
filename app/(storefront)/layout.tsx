import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCartCount } from "@/actions/cart";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const cartCount = await getCartCount();

  return (
    <>
      <Navbar cartCount={cartCount} />
      <main className="min-h-screen pt-20 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}
