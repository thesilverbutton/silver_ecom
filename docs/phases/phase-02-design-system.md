# Phase 02 — Design System

> Maps roadmap Phase 2. **Goal: reusable, token-driven components. No pages, no business logic, no data.**

## Objective
Implement design tokens and the full component library so later phases compose pages without inventing UI. Everything consumes tokens; every component handles all interaction states and is accessible.

## Scope
- Tokens in `globals.css` + `tailwind.config.ts` (colors, typography, spacing, radius, shadow) per `03-design-system.md`.
- shadcn/ui primitives installed and themed.
- Composite/feature components (presentational only, props-driven, mock data).
- Skeletons, empty states, toasts, loaders.
- A `/dev/components` (or Storybook-lite) preview route to visually QA every component and state — remove or guard before production.

Out of scope: fetching data, routing logic, real product/cart behavior.

## Tasks
1. **Tokens**: define CSS variables + Tailwind theme; wire fonts via `next/font`. Add `cn()` util.
2. **Primitives** (`components/ui`): Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Badge, Tag, Card, Separator, Tooltip, Dropdown, Popover, Dialog, Drawer/Sheet, Tabs, Accordion, Breadcrumbs, Pagination, Avatar, Alert, Toast (sonner), Skeleton, Spinner, Progress, RatingStars, QuantityStepper, PriceTag. Use `cva` for variants.
3. **Feature components** (presentational, mock props): ProductCard, ProductGallery (with zoom/fullscreen stub + mobile swipe), VariantSelector, CartDrawer/CartLine, Navbar, MobileNav, Footer, Section/Container, EmptyState, DataTable (admin), StatCard.
4. **States**: each component covers default/hover/focus-visible/active/disabled/loading/error/empty as applicable.
5. **Skeletons**: product grid, PDP, order list, table.
6. **Preview route**: render every component + variant + state for QA.
7. **A11y pass**: keyboard nav, focus rings, ARIA roles, focus trap in modal/drawer, `prefers-reduced-motion`.

## Acceptance Criteria
- [ ] Zero hardcoded hex/rgb or magic spacing in components; all via tokens/scale.
- [ ] Every primitive and feature component renders in the preview route across its states.
- [ ] Keyboard-only user can operate buttons, inputs, dropdowns, dialogs, drawer, tabs, accordion; focus is visible and trapped in overlays.
- [ ] Components are typed, `forwardRef` where DOM-bound, and use `cn()`.
- [ ] Mobile (375px) layout of Navbar/MobileNav/Footer/ProductCard is clean.
- [ ] `typecheck && lint && build` pass.

## Testing Checklist
- Contrast check on primary/accent/muted text (AA).
- Component render tests (vitest + testing-library) for Button, Input, Dialog, ProductCard.
- Reduced-motion disables non-essential animation.

## Definition of Done
A themed, accessible component kit ready to compose pages, with a visual preview proving every state.
