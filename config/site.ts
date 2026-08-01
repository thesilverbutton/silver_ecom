export const siteConfig = {
  name: "The Silver Button",
  description:
    "Luxury textile and design brand — handloom fashion, calligraphic embroideries, and silver button shirts for men and women.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currency: "INR" as const,
  locale: "en-IN" as const,
  contact: {
    email: "enquiry@silverbutton.in",
    phone: "+91 9315677209",
  },
  socials: {
    instagram: "https://www.instagram.com/silver_button.in",
    facebook: "https://www.facebook.com/profile.php?id=61592903033118",
    x: "https://x.com/silver_buttonin",
    whatsapp: "+91 9315677209",
  },
  shippingOriginPincode: "121001", // Faridabad
} as const;

/**
 * Primary navigation structure — collection-based split.
 */
export const navConfig = {
  mainNav: [
    {
      label: "Men",
      href: "/men",
      children: [
        { label: "Linen Shirt", href: "/men/linen-shirts" },
        { label: "Linen Pants", href: "/men/linen-pants" },
        { label: "Calligraphed Linen Shirt", href: "/men/calligraphed-linen-shirts" },
        { label: "All Men", href: "/men" },
      ],
    },
    {
      label: "Women",
      href: "/women",
      children: [
        { label: "Linen Shirt", href: "/women/linen-shirts" },
        { label: "Linen Pants", href: "/women/linen-pants" },
        { label: "Calligraphed Linen Shirt", href: "/women/calligraphed-linen-shirts" },
        { label: "All Women", href: "/women" },
      ],
    },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "About", href: "/about" },
  ],
} as const;
