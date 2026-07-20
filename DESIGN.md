---
name: Rafeeq
description: A calm, warm-minimal Muslim companion app — all worship, one calm place.
colors:
  warm-earth: "#795547"
  ink: "#212529"
  surface-light: "#ffffff"
  border-light: "#e9ecef"
  surface-dark: "#121212"
  border-dark: "#282828"
typography:
  headline:
    fontFamily: "Thmanyah Serif Display, Thmanyah Sans, serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "Thmanyah Serif Display, Thmanyah Sans, serif"
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
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Thmanyah Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  quran:
    fontFamily: "Kitab, Thmanyah Sans, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 400
    lineHeight: 2
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  pill: "50rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.warm-earth}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "#6a4b3e"
  button-outline-primary:
    backgroundColor: "transparent"
    textColor: "{colors.warm-earth}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  tab-pill:
    backgroundColor: "transparent"
    textColor: "#6c757d"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  tab-pill-active:
    backgroundColor: "#79554720"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  toggle-active:
    backgroundColor: "{colors.warm-earth}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.6rem"
---

# Design System: Rafeeq

## 1. Overview

**Creative North Star: "The Pocket Companion"**

Rafeeq (رفيق) is designed as a companion you carry, not a destination you visit: light, ever-ready, personal, built around small moments of worship on the road. The system is warm minimalism — modern, clean surfaces carried by a single warm earth tone, generous Arabic typography, and quiet, flat-leaning components. Warmth comes from type, spacing, and the brown hue itself, never from ornament. The whole interface is Arabic and RTL-first; layout, alignment, and iconography read right-to-left by default.

The system explicitly rejects the anti-references in PRODUCT.md: cluttered Islamic apps drowning content in decoration, sterile SaaS-dashboard chrome, gamified dopamine mechanics, and skeuomorphic mushaf textures. Screens hold one primary task, reachable one-handed in a 30-second session.

**Key Characteristics:**
- One warm accent (Warm Earth) on calm neutral surfaces, both runtime-themeable by the user
- Thmanyah Sans for UI text, Thmanyah Serif Display for headings; Kitab exclusively for Quran text
- Flat, border-defined surfaces with soft ambient shadow allowed sparingly
- Refined and restrained components: quiet outlines, gentle tint fills, nothing shouting
- RTL-first, rem-based sizing so the user's font-scale setting scales everything

## 2. Colors

A restrained palette: one warm brown voice over neutral surfaces, with full light/dark parity.

### Primary
- **Warm Earth** (#795547): The single brand voice — buttons, active states, links, progress, focus rings, and the PWA theme color. Applied at low opacities for fills: 12% tint for active pills, 15% for subtle backgrounds, 25% for focus shadows. Hover/active states derive by mixing toward black (88% / 78% via `color-mix`), never by introducing a second hue.

### Neutral
- **Ink** (#212529): Body text in light mode (Bootstrap body color).
- **Surface Light** (#ffffff): Light-mode body background; secondary/tertiary surfaces derive from Bootstrap's layering.
- **Border Light** (#e9ecef): Hairline borders that define cards, pills, and toggles in light mode — a step quieter than the Bootstrap default.
- **Surface Dark** (#121212): Dark-mode body — true near-black, not tinted navy.
- **Border Dark** (#282828): Dark-mode hairlines; the primary depth cue in dark mode.

### Named Rules
**The Runtime Theme Rule.** Colors are never hardcoded in components. Everything flows through Bootstrap CSS variables (`--bs-primary`, `--bs-body-bg`, …) and `color-mix()` derivations, because the user can change both the primary color and the background at runtime. A hex value in a component is a bug.

**The One Warm Voice Rule.** Warm Earth is the only accent. It appears on a small fraction of any screen — a filled button, an active state, a highlight. Its restraint is what keeps the interface calm.

## 3. Typography

**Body Font:** Thmanyah Sans (with system-ui fallback), weights 300–900 self-hosted
**Heading Font:** Thmanyah Serif Display (with Thmanyah Sans fallback), weights 300–900 self-hosted
**Quran Font:** Kitab (with Thmanyah Sans fallback), regular and bold

**Character:** Thmanyah Sans carries the interface — contemporary, legible Arabic UI type. Headings step up to Thmanyah Serif Display for a quieter literary voice. Kitab is reserved for the sacred text itself, giving Quran verses a distinct, traditional voice without skeuomorphism.

### Hierarchy
- **Headline** (500, 2.5rem, 1.2): Page titles via the shared `Heading` component.
- **Title** (500, 1.25rem, 1.3): Section titles, card headers, and the `lead` subtitle (300 weight variant).
- **Body** (400, 1rem, 1.6): Default reading text — the taller line-height gives vocalized Arabic room to breathe.
- **Label** (500, 0.85rem, 1.4): Pills, toggles, and metadata.
- **Caption** (400, 0.75rem, 1.4): The smallest step — tab-bar labels, badges, stat captions, fine print.
- **Quran** (Kitab 400, ~1.4rem, 2.0): Quran verses only, via `.font-quran`. Generous line-height for vocalized Arabic script. The reader view deliberately steps up (1.625rem ayat, 2rem basmallah) — sacred text leads the screen.

### Named Rules
**The Kitab Rule.** Kitab renders Quran text and nothing else. UI text never uses Kitab; Quran text never uses Thmanyah.

**The Rem Rule.** All type and spacing sizes in `rem`. The user's font-scale setting (80–130%) works by changing the root font-size; hardcoded pixel type breaks it.

## 4. Elevation

The system is flat by default: surfaces are defined by 1px hairline borders and subtle background tints, not shadows. Soft ambient shadows are allowed sparingly — a gentle lift on cards where warmth helps — and true overlays (bottom sheets, dropdowns, toasts) carry real shadows to separate from the page. In dark mode, borders (#282828) and tonal layering do all the depth work.

### Shadow Vocabulary
- **Focus ring** (`box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25)`): Form controls and interactive focus states, tinted by the runtime primary.
- **Overlay** (Bootstrap sheet/dropdown shadows): Bottom sheets, dropdown menus, toasts only.

### Named Rules
**The Borders-First Rule.** If a border or a background tint can create the separation, it does. A shadow is the exception that must justify itself.

## 5. Components

Refined and restrained: quiet outlines, gentle tint fills, nothing shouting. All interactive states transition in 150–200ms, and every animation collapses to near-instant under `prefers-reduced-motion: reduce` (global rule in `base.scss`).

**The Radius Rule.** Corner rounding always comes from the shared scale via CSS variables — `--bs-border-radius-sm` (0.5rem) for compact controls, `--bs-border-radius` (0.75rem) for buttons/inputs/pills, `--bs-border-radius-lg` (1rem) for cards and content surfaces, `--bs-border-radius-xl` (1.5rem) for dialogs, `--bs-border-radius-pill` for pills and count badges. A hardcoded radius in a component is a bug (exception: `border-radius: 50%` for true circles, and the isolated `ZekrImage` export renderer).

### Buttons
- **Shape:** Softly rounded (0.75rem), touch-first padding (0.5rem 1rem, ~44px tall), 500 weight labels
- **Primary:** Warm Earth fill, white text (`--bs-primary` driven so runtime theming holds)
- **Hover / Focus:** Darkens by mixing 12% black into the primary; focus ring is the 25% primary tint
- **Outline:** Transparent with Warm Earth text and border; fills solid on hover
- **Flat (`.btn-flat`):** Borderless, shadowless utility button for icon actions (share, close)

### Chips (Tab Pills)
- **Style:** Transparent with hairline border, secondary text, 0.85rem/500, icon + label, horizontally scrollable row with hidden scrollbar
- **State:** Hover gets a 10% secondary tint; active gets a 12% Warm Earth tint with the border removed

### Cards / Containers
- **Corner Style:** 1rem (`--bs-border-radius-lg`)
- **Background:** Body/secondary surface layers
- **Shadow Strategy:** Flat with hairline border; soft ambient lift allowed sparingly (see Elevation)
- **Border:** 1px `--bs-border-color`, synced to runtime theme
- **Internal Padding:** 1.25rem default (`$card-spacer`), 1–1.5rem range

### Inputs / Fields
- **Style:** Bootstrap form controls, hairline border, 0.75rem radius, touch-first padding
- **Focus:** Border mixes 35% toward white from primary; 0.25rem primary-tinted ring
- **States:** Standard Bootstrap invalid/disabled treatments

### Navigation
- **Navbar:** 70px (85px ≥768px), height exposed as `--navbar-height` so full-height screens compute against it
- **TabBar:** Mobile bottom tab bar for primary sections — the one-handed entry point
- **Bottom sheets:** Action rows (`.bottom-sheet-item`) at 1rem with icon, full-width, tint on hover; the desktop dialog variant rounds at 1.5rem (`--bs-border-radius-xl`)

### Segmented Toggle (`.btn-group-toggle`)
Equal-width bordered segments, 0.75rem radius; the active segment fills solid Warm Earth with white text. Used for binary/ternary settings like theme mode.

### Utility States (signature)
Shared `LoadingState`, `ErrorState`, `OfflineState`, and `EmptyState` components give every feature the same calm fallback voice — centered icon, short Arabic message, single recovery action. New features must use them rather than inventing their own.

## 6. Do's and Don'ts

### Do:
- **Do** drive every color through `--bs-primary` / `--bs-body-bg` variables and `color-mix()` derivations — the user can retheme both at runtime.
- **Do** size everything in `rem` so the 80–130% font-scale setting scales the whole interface.
- **Do** keep Warm Earth (#795547) rare: filled CTAs, active states, and highlights only.
- **Do** use `.font-quran` (Kitab) for Quran text and generous line-height (≥2) for vocalized script.
- **Do** design RTL-first with logical properties (`margin-inline`, `text-align: start`); LTR is the derived case.
- **Do** reuse the shared Loading/Error/Offline/Empty state components for every async surface.

### Don't:
- **Don't** build cluttered screens where decoration buries content — PRODUCT.md's "cluttered Islamic apps" anti-reference.
- **Don't** reach for stat tiles, card grids, or corporate dashboard chrome — the "generic SaaS dashboard" anti-reference.
- **Don't** add streaks, badges, or dopamine mechanics — the "over-gamified apps" anti-reference; worship is not a game.
- **Don't** use faux leather, paper textures, or literal book metaphors — the "heavy skeuomorphic mushaf" anti-reference.
- **Don't** hardcode hex colors in components; the Runtime Theme Rule forbids it.
- **Don't** introduce a second accent hue; hover and active states derive from Warm Earth by mixing toward black.
- **Don't** stack heavy shadows on resting surfaces; borders and tints first, shadows for overlays and rare ambient lift.
