export const siteConfig = {
  name: "The Silver Button",
  description:
    "Handloom fashion for men and women — shirts, sarees, kurtas, dupattas, and more, crafted with tradition.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currency: "INR" as const,
  locale: "en-IN" as const,
  contact: {
    email: "orders@thesilverbutton.com",
    phone: "+91 8130243850",
  },
  socials: {
    instagram: "",
    facebook: "",
    whatsapp: "",
  },
  shippingOriginPincode: "121001", // Faridabad
} as const;

/**
 * Primary navigation structure — gender-based top-level split.
 */
export const navConfig = {
  mainNav: [
    {
      label: "Men",
      href: "/men",
      children: [
        { label: "Shirts", href: "/men/shirts" },
        { label: "Kurtas", href: "/men/kurtas" },
        { label: "Trousers", href: "/men/trousers" },
        { label: "Jackets", href: "/men/jackets" },
        { label: "Accessories", href: "/men/accessories" },
        { label: "All Men", href: "/men" },
      ],
    },
    {
      label: "Women",
      href: "/women",
      children: [
        { label: "Sarees", href: "/women/sarees" },
        { label: "Kurtas", href: "/women/kurtas" },
        { label: "Dupattas", href: "/women/dupattas" },
        { label: "Dresses", href: "/women/dresses" },
        { label: "Accessories", href: "/women/accessories" },
        { label: "All Women", href: "/women" },
      ],
    },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "About", href: "/about" },
  ],
} as const;
