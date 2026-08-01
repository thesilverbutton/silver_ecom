/**
 * Cloudinary-hosted marketing imagery.
 *
 * Centralised so the CDN account can be changed in one place. Regenerate the URLs
 * with `npm run migrate:site-images -- --apply`.
 *
 * App chrome (logo, payment badges) intentionally stays in /public: those assets
 * are small, same-origin, and versioned with the deployment.
 */
export const siteImages = {
  heroCraftJourney:
    "https://res.cloudinary.com/jahr2pvz/image/upload/v1785580620/silver-button/site/hero-craft-journey.png",
  brandStoryLoom:
    "https://res.cloudinary.com/jahr2pvz/image/upload/v1785580621/silver-button/site/brand-story-loom.webp",
  silverButtonMacro:
    "https://res.cloudinary.com/jahr2pvz/image/upload/v1785580626/silver-button/site/silver-button-macro.png",
  aboutHero:
    "https://res.cloudinary.com/jahr2pvz/image/upload/v1785580628/silver-button/site/about-hero.png",
} as const;

/** Fallback shown when a product has no image. */
export const PRODUCT_PLACEHOLDER =
  "https://placehold.co/400x533/e5e7eb/4b5563?text=Product";
