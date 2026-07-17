# Rules — Accessibility

> Target **WCAG 2.1 AA**. Accessibility is a launch requirement (Lighthouse a11y > 95), not a nice-to-have. Full conformance requires manual testing with assistive tech and expert review; these rules are the enforceable baseline.

## 1. Semantics & Structure
- Use semantic HTML (`header`, `nav`, `main`, `footer`, `button`, `a`, `ul/li`) before ARIA. A `<button>` for actions, `<a>` for navigation — never a clickable `<div>`.
- One `<h1>` per page; headings in logical order (no skipping levels for style).
- Landmark regions present; skip-to-content link at top.
- Lists marked up as lists; tables use `<th>` with scope.

## 2. Keyboard
- Everything operable by keyboard alone: links, buttons, inputs, selects, dropdowns, tabs, accordions, dialogs, drawers, gallery, carousels.
- Logical tab order (DOM order matches visual order). No keyboard traps except intentional modal focus traps.
- Visible focus indicator on all focusable elements (use `--ring`; never `outline: none` without a replacement).
- Modals/drawers: focus moves in on open, is trapped while open, returns to trigger on close; `Esc` closes.

## 3. Contrast & Color
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text ≥ 24px/19px bold). UI components/focus indicators ≥ 3:1.
- Verify the muted-gold accent and silver tokens against their backgrounds.
- Never convey meaning by color alone (stock, errors, status) — add text/icon.

## 4. Forms
- Every control has a programmatically associated `<label>`. Placeholder is not a label.
- Required fields indicated in text, not color alone. Errors: `aria-invalid` + `aria-describedby` pointing to the message; announce on submit.
- Group related fields with `<fieldset>`/`<legend>` (e.g., address).
- Sufficient touch target size (≥ 44px) and spacing.

## 5. Images & Media
- Meaningful `alt` on informative images (product `alt` required in admin); `alt=""` for decorative.
- Icons that are the only content of a control need an accessible name (`aria-label`).
- No auto-playing media with sound.

## 6. Dynamic Content
- Announce async results (toasts, form errors, cart updates) via `aria-live` regions where a sighted user would see a change.
- Loading states communicated to AT (e.g., `aria-busy`); skeletons are decorative (`aria-hidden`).
- Route changes move focus appropriately (to main heading) in the SPA-like flows.

## 7. Motion & Preferences
- Respect `prefers-reduced-motion`: disable parallax, autoplay, large transitions.
- No content flashing more than 3×/second.

## 8. Zoom & Reflow
- Usable at 200% zoom and 320px width with no loss of content/function and no horizontal scroll.
- Text resizes without breaking layout; no fixed tiny font sizes.

## 9. Component-Specific
- **Gallery/zoom:** keyboard-operable thumbnails; zoom accessible; pinch on mobile has a non-gesture alternative.
- **Dropdown/Select/Combobox (search):** proper `role`, `aria-expanded`, `aria-activedescendant`, arrow-key navigation.
- **Tabs/Accordion:** correct roles and keyboard patterns (from Radix/shadcn — don't break them).
- **Pagination:** links with accessible names ("Go to page 2").

## 10. Testing Checklist (Phase 08)
- [ ] axe/Lighthouse automated scan clean on home, PDP, category, cart, checkout.
- [ ] Full keyboard-only walkthrough of the purchase flow.
- [ ] Screen-reader spot check (VoiceOver/NVDA) on PDP + checkout.
- [ ] Contrast verified on all token combinations.
- [ ] 200% zoom + 320px reflow check.
- [ ] Reduced-motion verified.

> Automated tools catch ~a third of issues. The keyboard + screen-reader manual passes are mandatory before launch.
