import { getCategoriesForGender } from "@/services/category.service";
import type { NavItem } from "@/components/layout/navbar";

/**
 * Build the storefront nav from live categories so removed
 * categories never leave dead links behind.
 */
export async function buildMainNav(): Promise<NavItem[]> {
  const [menCats, womenCats] = await Promise.all([
    getCategoriesForGender("men"),
    getCategoriesForGender("women"),
  ]);

  const toChildren = (
    cats: Awaited<ReturnType<typeof getCategoriesForGender>>,
    gender: "men" | "women",
  ) => [
    ...cats.map((c) => ({
      label: c.name,
      href: `/${gender}/${c.slug.replace(`${gender}-`, "")}`,
    })),
    { label: gender === "men" ? "All Men" : "All Women", href: `/${gender}` },
  ];

  return [
    { label: "Men", href: "/men", children: toChildren(menCats, "men") },
    { label: "Women", href: "/women", children: toChildren(womenCats, "women") },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "About", href: "/about" },
  ];
}
