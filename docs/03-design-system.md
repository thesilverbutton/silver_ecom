# 03 — Design System

> Tokens first, components second. Every component consumes tokens; no hardcoded colors, spacing, or font sizes in feature code.

## 1. Brand Direction

The Silver Button sells **silver jewelry** — the visual language is **calm, premium, and metallic-neutral**. Let product photography carry the color; keep the UI restrained. Generous whitespace, crisp typography, subtle motion.

## 2. Design Tokens

Tokens are defined once as CSS variables in `globals.css` and exposed to Tailwind via `tailwind.config.ts`. Reference tokens through Tailwind classes, never raw hex.

### 2.1 Color (HSL CSS variables, shadcn convention)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 220 13% 13%;        /* near-black ink */

  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;

  --card: 0 0% 100%;
  --card-foreground: 220 13% 13%;

  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 13% 40%;

  /* Brand: refined silver/graphite, not literal grey */
  --primary: 220 14% 20%;           /* graphite — CTAs, headers */
  --primary-foreground: 0 0% 100%;

  --secondary: 40 30% 96%;          /* warm off-white / champagne */
  --secondary-foreground: 220 13% 13%;

  --accent: 43 45% 55%;             /* muted gold — badges, highlights */
  --accent-foreground: 220 13% 13%;

  --silver: 210 12% 78%;            /* metallic silver accent */

  --success: 142 55% 38%;
  --warning: 38 92% 50%;
  --destructive: 0 72% 45%;
  --destructive-foreground: 0 0% 100%;

  --radius: 0.5rem;
}
```

> Provide a `.dark` block only if dark mode is in scope; default launch is light only. Do not build dark mode unless requested.

### 2.2 Typography

- **Display / headings:** a refined serif (e.g., `Fraunces` or `Playfair Display`) for hero and product titles — conveys jewelry elegance.
- **Body / UI:** a clean sans (e.g., `Inter`) for readability.
- Load via `next/font` (self-hosted, `display: swap`, subset `latin`).

Scale (rem, mobile-first; scale up at `md`):

| Token | Size / line-height | Use |
| --- | --- | --- |
| `text-display` | 2.5–3.5rem / 1.1 | Hero |
| `text-h1` | 2rem / 1.2 | Page title |
| `text-h2` | 1.5rem / 1.25 | Section |
| `text-h3` | 1.25rem / 1.3 | Card title |
| `text-body` | 1rem / 1.6 | Default |
| `text-sm` | 0.875rem / 1.5 | Meta |
| `text-xs` | 0.75rem / 1.4 | Labels, captions |

### 2.3 Spacing, Radius, Shadow

- Spacing scale: Tailwind default (4px base). Section vertical rhythm: `py-12 md:py-20`.
- Radius: `--radius` (8px) default; `rounded-full` for pills/badges.
- Shadows: soft and shallow only (`shadow-sm`, `shadow-md`). No heavy drop shadows.
- Container: max-width `1280px`, gutters `px-4 md:px-6 lg:px-8`.

### 2.4 Breakpoints

`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Design at 375px first.

### 2.5 Motion

- Durations: `150ms` (micro), `250ms` (default), `400ms` (drawer/modal).
- Easing: `ease-out` for enters, `ease-in` for exits.
- Respect `prefers-reduced-motion`; disable non-essential animation.

## 3. Component Inventory

Build in Phase 2 with **zero business logic**. All live under `components/ui` (primitives) or feature folders. Every component: typed props, `forwardRef` where DOM-bound, `cn()` for class merging, keyboard + ARIA support.

### 3.1 Primitives (`components/ui`)
Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Badge, Tag, Card, Separator, Tooltip, Dropdown, Popover, Dialog/Modal, Drawer/Sheet, Tabs, Accordion, Breadcrumbs, Pagination, Avatar, Alert, Toast (sonner), Skeleton, Spinner, Progress, RatingStars, QuantityStepper, PriceTag.

### 3.2 Composite / feature
- **ProductCard** — image, title, price, wishlist toggle, hover second image, out-of-stock state.
- **ProductGallery** — thumbnails + main image, zoom, fullscreen, mobile pinch/swipe.
- **VariantSelector** — size/finish pills with availability.
- **CartDrawer** / **CartLine** — quantity stepper, remove, subtotal.
- **Navbar** — logo, nav, search trigger, cart count, account.
- **MobileNav** — bottom bar or hamburger sheet.
- **Footer** — links, policies, socials, newsletter.
- **Section** / **Container** — layout rhythm wrappers.
- **EmptyState** — for empty cart, no results, no orders.
- **DataTable** (admin) — sortable, paginated, row actions.
- **StatCard** (admin) — KPI display.

### 3.3 States every component must handle
Default · hover · focus-visible · active · disabled · loading · error · empty. Ship **Skeletons** for every async surface (product grid, PDP, order list).

## 4. Jewelry-Specific UI (Phase 12 in roadmap; components stubbed in Phase 2)

- **Image zoom & fullscreen gallery** with pinch-zoom on mobile.
- **BIS Hallmark badge** and **Certification display** block.
- **Material details** table (metal, purity e.g. 925 sterling, weight, dimensions, stone).
- **Ring size guide** modal (with India size chart).
- **Care instructions** accordion.
- **Shipping promise** and **Return policy** blocks on PDP.
- **Wishlist** heart toggle; **Recently viewed** rail.

## 5. Iconography & Imagery

- Icons: `lucide-react`, `1.5px` stroke, sized in `em`.
- Product images: served via Cloudinary, `next/image`, `sizes` set correctly, AVIF/WebP, LQIP blur placeholder. Square (1:1) primary aspect for grid; allow 4:5 on PDP.

## 6. Accessibility Baseline (see `rules/accessibility.md`)

- WCAG 2.1 AA contrast (4.5:1 text). The muted-gold accent must be checked against its background.
- Every interactive element keyboard reachable with visible focus ring (`--ring`).
- Modals/drawers trap focus and restore on close; `Esc` closes.
- Images have meaningful `alt`; decorative images `alt=""`.

## 7. Rules

- No inline hex/rgb in components — use token classes.
- No magic spacing numbers — use the scale.
- Do not fork shadcn primitives per feature; extend via props/variants (`cva`).
- Compose pages from components; pages hold no styling primitives of their own beyond layout.
