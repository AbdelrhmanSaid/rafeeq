---
name: Rafeeq
description: A warm, layered Muslim companion app, designed phone-first — all worship, one calm place.
colors:
  clay: "#a25a3c"
  clay-dark: "#cd8562"
  paper: "#f5f1ea"
  paper-card: "#fffdf9"
  ink: "#241d17"
  ink-dark: "#15110d"
  ink-dark-card: "#211b16"
  ink-dark-text: "#ece4d9"
typography:
  display:
    fontFamily: "Thmanyah Serif Display, Thmanyah Serif Text, serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.15
  headline:
    fontFamily: "Thmanyah Serif Text, Thmanyah Sans, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "Thmanyah Serif Text, Thmanyah Sans, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Thmanyah Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Thmanyah Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Thmanyah Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  quran:
    fontFamily: "Kitab, Thmanyah Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 2.1
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "#fff9f5"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.paper-card}"
    rounded: "{rounded.xl}"
    shadow: "soft two-layer warm"
  nav-active:
    backgroundColor: "12% clay wash"
    textColor: "{colors.clay}"
    rounded: "{rounded.pill}"
---

# Design System: Rafeeq

## 1. Overview

**Creative North Star: "The Pocket Companion"**

Rafeeq (رفيق) is a companion you carry, not a destination you visit. It is
opened many times a day for thirty seconds at a time, in Arabic, right-to-left,
almost always one-handed on a phone.

The system is **warm and layered**: tinted neutral surfaces rather than grey,
generous rounding, soft real elevation rather than hairline boxes, and a
confident type hierarchy that lets the content — prayer times, Quran, azkar —
lead every screen. Warmth comes from the surfaces and the type, never from
ornament.

**The phone is the design canvas.** Unprefixed styles are the phone; `sm:`,
`md:` and `lg:` only widen or reflow. A `max-*` utility written to undo a
desktop style is the signal that a screen was built backwards.

**Key Characteristics:**
- Warm paper in light, warm ink in dark; cards float on the page rather than
  being drawn onto it with a border
- One clay accent, user-themeable at runtime, used sparingly
- Thmanyah Sans for UI, Thmanyah Serif Text for headings, Thmanyah Serif Display
  for large display type; Kitab exclusively for Quran text
- RTL-first, rem-based sizing so the 80–130% font-scale setting scales
  everything

## 2. Colors

Every colour is a token in `src/shared/styles/main.css`. Components reach them
as Tailwind utilities (`bg-card`, `text-muted-foreground`, `bg-primary/10`).

### Light — warm paper
`--background` #f5f1ea · `--foreground` #241d17 · `--card` #fffdf9 ·
`--popover` #fffdf9 · `--primary` #a25a3c · `--primary-foreground` #fff9f5 ·
`--secondary` / `--muted` #efe9e0 · `--muted-foreground` #756759 ·
`--accent` #e8e0d4 · `--destructive` #c14434 · `--success` #1e7a52 ·
`--border` #e4dbcd · `--input` #d8ccbb

### Dark — warm ink
`--background` #15110d · `--foreground` #ece4d9 · `--card` #211b16 ·
`--popover` #272019 (a step above card, so menus separate from cards) ·
`--primary` #cd8562 · `--primary-foreground` #241a12 ·
`--secondary` / `--muted` #2a221c · `--muted-foreground` #a89887 ·
`--accent` #342a22 · `--destructive` #e5544a · `--success` #37a873 ·
`--border` #332a23 · `--input` #3d332b

Every text pair clears 4.5:1 in both modes.

### Named Rules

**The Runtime Theme Rule.** Colours are never hardcoded in components.
`src/shared/utils/css.js` rewrites `--primary`, `--primary-foreground`, `--ring`
and the surface tokens at runtime from the user's own choices, so a hex value in
a component is a bug.

**The Warm Foreground Rule.** In dark mode the semantic fills keep the *light*
hue and pair it with a warm-ink foreground — `--primary-foreground` is #241a12,
not white. Never assume a `*-foreground` token is white.

**The One Accent Rule.** Clay is the only accent. Derive hover and active states
from it by opacity or by mixing; never introduce a second hue.

## 3. Typography

**Body:** Thmanyah Sans · **Headings:** Thmanyah Serif Text ·
**Display:** Thmanyah Serif Display · **Quran:** Kitab

### Named Rules

**The Kitab Rule.** Kitab renders Quran text and nothing else. UI text never
uses Kitab; Quran text never uses Thmanyah. Reach it through `font-quran`.

**The Rem Rule.** All type and spacing in `rem`. The font-scale setting works by
changing the root font-size; hardcoded pixel type breaks it. The one documented
exception is `ZekrImage.vue`, a fixed 1080px export canvas.

## 4. Elevation

Depth comes from tone and shadow, not borders. The whole Tailwind `shadow-*`
scale is redefined as soft two-layer warm shadows (a tight contact shadow plus a
wide diffuse one) driven by `--shadow-color` and `--shadow-strength`, which flip
with the theme.

- resting card on `bg-card` → `shadow-sm`, no border
- raised / interactive → `shadow-md`
- overlays (sheets, menus, popovers) → `shadow-xl`

### Named Rules

**The Shadow Token Rule.** Never write a custom `box-shadow`. The shadow colour
must stay tied to those variables so it flips with the theme.

**The Card Lift Rule.** A card must read as lifted even when the user has
overridden the background — `applyBgColor` lifts `--card` and `--popover` off
the picked colour for exactly this reason, and cards always carry `shadow-sm`
rather than relying on `bg-card` alone.

## 5. Shape and rhythm

`--radius` is 1rem, and the scale is spaced so the shadcn and Tailwind names
agree: `rounded-sm` 0.5rem, `rounded-md` 0.75rem (controls), `rounded-lg` /
`rounded-2xl` 1rem (cards), `rounded-xl` / `rounded-3xl` 1.5rem (heroes and
bottom sheets), `rounded-full` for pills, counters and icon buttons.

4pt grid. On mobile: `px-4` page gutters, `gap-3` within a group, `space-y-6` to
`space-y-8` between sections.

## 6. Components

### Navigation
- **TabBar** — the primary mobile navigation: a floating pill inset from the
  screen edge, above the home indicator. Its true footprint is published as
  `--tabbar-offset`; anything docking above it measures against that token
  rather than re-deriving the geometry.
- **Navbar** — desktop only (`hidden md:block`), with the TabBar `md:hidden`.
- **Active nav language** — idle `text-muted-foreground`, hover
  `hover:bg-accent hover:text-accent-foreground`, active
  `bg-primary/12 text-primary`. Merge the active class with `cn()`, never plain
  concatenation, or Tailwind's emit order decides the winner.

### Surfaces
Cards are `bg-card rounded-2xl shadow-sm`, borderless. Long lists are a divided
list (`divide-y`) inside one rounded card rather than a grid of tiles.

### Modals
`BottomSheet` (wrapping shadcn `<Drawer>`) is the modal primitive on every
screen. Dialogs are not used on mobile.

### Utility States
Shared `LoadingState`, `ErrorState`, `OfflineState` and `EmptyState` give every
async surface the same calm voice. New features use them rather than inventing
their own.

### Custom utilities
`surface-hero` (card plus a radial accent wash, for a single hero surface),
`edge-fade-x` (masks the ends of a horizontal scroll strip), `pb-safe`,
`no-scrollbar`, `font-quran`, `container-page`, `no-tap-highlight`.

## 7. Do's and Don'ts

### Do:
- **Do** design at 390px first; add `sm:`/`md:`/`lg:` only to widen or reflow.
- **Do** keep every tap target at least 2.75rem in both dimensions.
- **Do** put a screen's primary action in the lower half, within thumb reach,
  and rare or destructive actions up top.
- **Do** drive every colour through the tokens — the user re-themes at runtime.
- **Do** size everything in `rem` so the 80–130% font-scale setting works.
- **Do** design RTL-first with logical utilities (`ms-*`/`me-*`, `ps-*`/`pe-*`,
  `start-*`/`end-*`, `text-start`); physical ones are not flipped for you, and a
  "next" chevron points **left**.
- **Do** pad anything pinned to the bottom with the safe-area inset.

### Don't:
- **Don't** build cluttered screens where decoration buries content.
- **Don't** reach for stat tiles or corporate dashboard chrome.
- **Don't** add streaks, badges, or dopamine mechanics; worship is not a game.
- **Don't** use faux leather, paper textures, or literal book metaphors.
- **Don't** hardcode hex colours, or size type and spacing in `px`.
- **Don't** introduce a second accent hue.
- **Don't** start a grid at more than one column.
