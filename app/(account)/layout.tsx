import { Navbar } from "@/components/layout/navbar";
import { buildMainNav } from "@/lib/build-nav";

export default async function AccountGroupLayout({ children }: { children: React.ReactNode }) {
  const navItems = await buildMainNav();

  return (
    <>
      <Navbar navItems={navItems} />
      {children}
    </>
  );
}
