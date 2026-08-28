import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buildMainNav } from "@/lib/build-nav";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const navItems = await buildMainNav();

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer navItems={navItems} />
      <MobileNav />
    </>
  );
}
