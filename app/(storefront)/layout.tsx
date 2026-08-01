import { unstable_rethrow } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCartCount } from "@/actions/cart";
import { buildMainNav } from "@/lib/build-nav";
import { navConfig } from "@/config/site";
import type { NavItem } from "@/components/layout/navbar";

/**
 * Chrome for every storefront page.
 *
 * Both lookups hit MongoDB. An unhandled rejection here takes down the entire
 * storefront with an opaque "Server Components render" error, because a layout
 * failure fails every route beneath it. So each call degrades independently: the
 * nav falls back to the static config and the cart badge to zero, meaning a
 * database problem costs a stale nav rather than the whole site.
 *
 * unstable_rethrow is essential here. `cookies()` and `notFound()` work by
 * throwing framework-internal errors that Next.js must receive to drive dynamic
 * rendering; swallowing them silently breaks static/dynamic detection. It has to
 * be the first statement in each catch block.
 *
 * Real errors are logged so they appear in the platform's function logs, where a
 * production error digest is otherwise the only clue.
 */
export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let cartCount = 0;
  try {
    cartCount = await getCartCount();
  } catch (err) {
    unstable_rethrow(err);
    console.error("[storefront-layout] getCartCount failed:", err);
  }

  let navItems: readonly NavItem[] = navConfig.mainNav;
  try {
    const live = await buildMainNav();
    if (live.length > 0) navItems = live;
  } catch (err) {
    unstable_rethrow(err);
    console.error("[storefront-layout] buildMainNav failed, using static nav:", err);
  }

  return (
    <>
      <Navbar cartCount={cartCount} navItems={navItems} />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer navItems={navItems} />
      <MobileNav />
    </>
  );
}
