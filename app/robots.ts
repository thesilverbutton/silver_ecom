import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thesilverbutton.com";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/shop",
        "/men/",
        "/women/",
        "/products/",
        "/about",
        "/contact",
        "/policies/",
        "/new-arrivals"
      ],
      disallow: [
        "/admin/",
        "/admin-login",
        "/account/",
        "/checkout/",
        "/cart",
        "/api/",
        "/track-order",
        "/webhook/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
