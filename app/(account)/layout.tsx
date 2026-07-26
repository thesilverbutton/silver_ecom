import { Navbar } from "@/components/layout/navbar";
import { getCartCount } from "@/actions/cart";

export default async function AccountGroupLayout({ children }: { children: React.ReactNode }) {
  const cartCount = await getCartCount();

  return (
    <>
      <Navbar cartCount={cartCount} />
      {children}
    </>
  );
}
