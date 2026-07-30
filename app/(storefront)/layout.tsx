import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCartCount } from "@/actions/cart";
import { buildMainNav } from "@/lib/build-nav";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, navItems] = await Promise.all([getCartCount(), buildMainNav()]);

  return (
    <>
      <Navbar cartCount={cartCount} navItems={navItems} />
      <main className="min-h-screen pt-20 pb-16 md:pb-0">{children}</main>
      <Footer navItems={navItems} />
      <MobileNav />
    </>
  );
}
