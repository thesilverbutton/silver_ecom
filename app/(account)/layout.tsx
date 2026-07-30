import { Navbar } from "@/components/layout/navbar";
import { getCartCount } from "@/actions/cart";
import { buildMainNav } from "@/lib/build-nav";

export default async function AccountGroupLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, navItems] = await Promise.all([getCartCount(), buildMainNav()]);

  return (
    <>
      <Navbar cartCount={cartCount} navItems={navItems} />
      {children}
    </>
  );
}
