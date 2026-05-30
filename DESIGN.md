---
name: ParaLearn
description: School management and assessment platform for Nigerian K-12 schools and universities.
colors:
  violet-ink: "#641bc4"
  violet-vivid: "#9747ff"
  violet-tint: "#f0e5ff"
  lavender-muted: "#ad8ed6"
  chalk-white: "#fdfdff"
  midnight-slate: "#0f172a"
  slate-mid: "#64748b"
  border-fine: "#e2e8f0"
  surface-muted: "#f1f5f9"
  emerald-signal: "#10b981"
  emerald-tint: "#dff9d8"
  amber-signal: "#f28c1f"
  amber-tint: "#ffe9cc"
  crimson-signal: "#e60023"
  crimson-tint: "#fddada"
  cobalt-signal: "#2a64f6"
  cobalt-tint: "#dbe9ff"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.violet-ink}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#7b22e8"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
  badge-published:
    backgroundColor: "{colors.emerald-tint}"
    textColor: "#065f46"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-pending:
    backgroundColor: "{colors.amber-tint}"
    textColor: "#92400e"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-error:
    backgroundColor: "{colors.crimson-tint}"
    textColor: "#991b1b"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-draft:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.slate-mid}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  input-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.midnight-slate}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
---

# Design System: ParaLearn

## 1. Overview

**Creative North Star: "The Clear Register"**

A school register in Nigeria is a sacred object: attendance, scores, and official standing recorded with ink and precision. Every teacher knows it. Every student fears and respects it. ParaLearn is that register made digital. The design language inherits the register's qualities: structured, legible at a glance, authoritative without being cold. Information density is intentional. Whitespace is earned. Nothing decorates; everything communicates.

The reference point is Linear applied to daylight. Linear's precision, weight contrast, and respect for the user's time, but running in a bright room where admins process 300 report cards before lunch. The product must function as a trusted instrument, not a showcase. It recedes so the data can lead.

This system rejects the generic SaaS purple-gradient reflex: no glowing button shadows, no blurred glassmorphism panels, no gradient text headings. It equally rejects the bloated admin template: no 40-link sidebars, no card overuse, no inconsistent grey toolbars. The interface should feel like a well-maintained institution, not a startup pitch.

**Key Characteristics:**
- Light background (bright daylight context); dark accents carry authority
- Manrope throughout: tight tracking at large sizes, readable at small sizes
- Violet Ink (`#641bc4`) used at ≤10% of any screen surface; rarity is its power
- Semantic color only for status; never decoration
- Flat-by-default surfaces; subtle shadow only for interactive lift states
- Border radius 8px (md) for interactive elements; 12px (lg) for containers; no `rounded-3xl` in product UI
- Spacing rhythm: 8px base unit with deliberate variation, not uniform repetition

## 2. Colors: The Register Palette

Color is functional. The palette has one voice (Violet Ink), one canvas (Chalk White), four semantic signals (Emerald, Amber, Crimson, Cobalt), and supporting neutrals. Nothing else.

### Primary
- **Violet Ink** (`#641bc4`): The singular brand accent. Appears on primary buttons, active navigation states, focus rings, key links, and the scrollbar. Used sparingly so each appearance carries weight. Never used as a large background. OKLCH canonical: `oklch(38% 0.21 297)`.
- **Violet Vivid** (`#9747ff`): Hover state only for interactive violet elements. Never a standalone color; always a state variant of Violet Ink. OKLCH: `oklch(55% 0.25 296)`.
- **Violet Tint** (`#f0e5ff`): Sidebar hover backgrounds, selected row highlights, tag backgrounds when violet meaning is intended. Very low saturation use — the whisper before the voice.
- **Lavender Muted** (`#ad8ed6`): Disabled states for violet UI; secondary indicators. Never prominent.

### Neutral
- **Chalk White** (`#fdfdff`): The primary surface. Barely off-white, tinted toward violet at chroma 0.003. Never pure `#ffffff` for backgrounds — it reads as printed paper, not a blank screen. OKLCH: `oklch(99.4% 0.003 297)`.
- **Midnight Slate** (`#0f172a`): All body text, page headings, table data. Full authority weight. Never `#000000`. OKLCH: `oklch(14% 0.025 260)`.
- **Slate Mid** (`#64748b`): Secondary text, captions, empty-state copy, placeholder text. 3:1 contrast on white — use only for large text or decorative/supplemental copy.
- **Border Fine** (`#e2e8f0`): All dividers, table borders, input strokes, card outlines. Barely visible; just enough to separate.
- **Surface Muted** (`#f1f5f9`): Alternating table rows, ghost button hover backgrounds, disabled inputs, sidebar at rest. Never a large section background.

### Semantic Signals
Four signals for status and state. Each comes in a vivid (icon + text) and a tint (background) variant. Never swap them. Never use them decoratively.

- **Emerald Signal / Tint** (`#10b981` / `#dff9d8`): Published, present, passed, active, success.
- **Amber Signal / Tint** (`#f28c1f` / `#ffe9cc`): Pending, draft, in-progress, warning, needs attention.
- **Crimson Signal / Tint** (`#e60023` / `#fddada`): Error, failed, absent, rejected, destructive action.
- **Cobalt Signal / Tint** (`#2a64f6` / `#dbe9ff`): Informational only. Not brand. Not interactive. Info banners, help callouts.

### Named Rules
**The One Voice Rule.** Violet Ink appears on ≤10% of any given screen. Its rarity is the point. When everything is purple, nothing is.

**The Signal Purity Rule.** Semantic colors (Emerald, Amber, Crimson, Cobalt) are never used for decoration. A green badge means published. A red badge means error. Using Crimson Tint as a section background because it "looks warm" is prohibited.

**The No Gradient Rule.** No `linear-gradient` or `radial-gradient` involving brand colors on interactive elements, text, or content surfaces. Gradients are permitted only as ambient background decoration on the public landing page, nowhere in the product UI.

## 3. Typography

**Display / Headline / Body Font:** Manrope (`--font-manrope`), with `system-ui, sans-serif` fallback.
**Monospace:** Geist Mono (`--font-geist-mono`), used for score values, student IDs, numeric data tables, and code blocks.

**Character:** Manrope is geometric and warm — precise enough for instrument-grade UI, humanist enough to not feel cold. Its variable weight axis (400–800) delivers the scale contrast Linear is known for using a single typeface. At 800 weight with −0.03em tracking it reads as institutional authority. At 400 weight it disappears into readable prose.

### Hierarchy
- **Display** (800 weight, clamp 28–36px, line-height 1.1, −0.03em tracking): Page-level headings only. One per page. Dashboard title, exam title on the detail page, student name on report card.
- **Headline** (700 weight, 18px, line-height 1.3, −0.02em tracking): Section headings, dialog titles, card titles. The workhorse of hierarchy.
- **Title** (600 weight, 15px, line-height 1.4, −0.01em tracking): Table column headers, labeled groups, sidebar navigation items. Semi-bold contrast against body.
- **Body** (400 weight, 14px, line-height 1.6): All paragraph text, table cell values, form helper text. Max line length 65ch — enforce with `max-w-prose` or inline max-width on long-form content.
- **Label** (500 weight, 12px, line-height 1.4, +0.01em tracking): Input labels, status badge text, timestamp captions. Medium weight keeps legibility at small sizes.
- **Mono** (Geist Mono, 400 weight, 13px): Score numbers in tables, student admission numbers, assessment IDs, CBT question marks. `font-variant-numeric: tabular-nums` always active for data columns.

### Named Rules
**The Single Family Rule.** Manrope is used everywhere in the product. Inter is prohibited — Inter is the anti-reference. Outfit is permitted only on the public landing page hero. No font mixing inside the product shell.

**The Weight Contrast Rule.** Hierarchy is expressed through weight jumps of at least 200 (400→600, 600→800). Two consecutive levels must not share the same weight. A 14px/400 body next to a 14px/500 label is not a hierarchy.

**The Tabular Numbers Rule.** Any column of numbers in a table — scores, counts, percentages — uses `font-variant-numeric: tabular-nums` so digits align vertically. Proportional numerals in data tables are prohibited.

## 4. Elevation

ParaLearn is flat by default. Surfaces do not compete with data for depth. Elevation is a behavioral signal, not a decorative choice.

Three levels only:

- **Level 0 (Flush):** All page surfaces, sidebar, table rows, input backgrounds at rest. No shadow, no border glow. Separation is achieved through background color difference (Chalk White vs Surface Muted) or Border Fine.
- **Level 1 (Resting Card):** Container cards that group related content (class summary cards, dashboard stat blocks). Shadow: `0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)`. Barely visible at rest.
- **Level 2 (Interactive Lift):** The same card on hover. Shadow: `0 4px 16px rgba(15,23,42,0.08)`. Communicates "this is pressable." Combined with `translateY(-1px)` transition at 150ms ease-out.
- **Dialogs / Dropdowns:** `0 8px 32px rgba(15,23,42,0.12)` — enough to detach the surface from the page without theatrics.

### Named Rules
**The Flat-By-Default Rule.** Shadows appear only as a response to state (hover, dialog, dropdown). A shadow on a resting data table row is decoration, not elevation. Decoration is prohibited.

**The Tinted Shadow Rule.** When shadows are used, their color is tinted toward Midnight Slate, never pure black. `rgba(15,23,42,…)` not `rgba(0,0,0,…)`. This keeps the palette coherent.

**The No Glassmorphism Rule.** `backdrop-filter: blur` and `bg-white/70` are prohibited on resting content surfaces. The `.glass-card` utility class is removed from product UI. If translucency is needed (sticky nav on scroll), it is limited to navigation only and applied with intent, not as a default card style.

## 5. Components

### Buttons

Tactile and confident. Buttons communicate "this works" through precision, not decoration.

- **Shape:** 8px radius (md). Not pill-shaped for action buttons. Pill is reserved for status badges only.
- **Primary:** Violet Ink background (`#641bc4`), white text, Manrope 600, 14px. Padding 10px 20px. No box-shadow at rest.
- **Primary hover:** Background shifts to `#7b22e8` (5% lighter in lightness), `translateY(-1px)` at 120ms ease-out.
- **Primary active:** `scale(0.97)` at 80ms. No shadow on press.
- **Ghost:** Transparent background, Midnight Slate text. Border: 1px solid Border Fine. Hover: Surface Muted background. Same radius and padding as Primary.
- **Destructive:** Crimson Signal background, white text. Only appears in delete confirmation contexts.
- **Disabled:** 40% opacity on any variant. `cursor: not-allowed`. No hover effects.
- **Icon button:** 36×36px, 8px radius, ghost treatment. Icon 16px. Touch target extended to 44px via padding.

**Banned:** `shadow-lg shadow-purple-500/20` on primary buttons. `rounded-2xl` or `rounded-3xl` for buttons. Gradient backgrounds on any button variant.

### Status Badges

The semantic signal system expressed as inline labels.

- **Shape:** Pill (`border-radius: 9999px`). Badges are the one place pill is correct.
- **Size:** 12px Manrope 500, 2px 10px padding. `min-width: none` — width follows content.
- **Variants:** Published (Emerald Tint / dark emerald text), Pending (Amber Tint / dark amber text), Error (Crimson Tint / dark crimson text), Draft (Surface Muted / Slate Mid text).
- **Icon + color always together.** A 14px icon precedes the badge text. The badge color is never the sole signal.

### Cards / Containers

- **Corner Style:** 12px radius (lg) for grouping containers; 8px (md) for inline elements within.
- **Background:** Chalk White (`#fdfdff`). Never Surface Muted as a card background.
- **Shadow:** Level 1 at rest (`0 1px 3px rgba(15,23,42,0.06)`). Level 2 on hover for interactive cards.
- **Border:** 1px solid Border Fine (`#e2e8f0`). Always present — even with shadow, the fine border defines the edge cleanly.
- **Internal padding:** 24px (lg) for dashboard cards; 16px (md) for compact table-adjacent cards.
- **Nested cards are always wrong.** A card inside a card doubles the chrome and halves the data legibility. Prohibited.

### Inputs / Fields

- **Style:** White background, 1px solid Border Fine stroke, 8px radius. Padding 9px 12px.
- **Label:** Always above the input, Manrope 500 12px, Midnight Slate color. Never placeholder-only.
- **Placeholder:** Slate Mid color. Never used as the label substitute.
- **Focus:** 2px Violet Ink ring at 2px offset (`box-shadow: 0 0 0 2px #641bc4`). Border shifts to Violet Ink.
- **Error:** Border shifts to Crimson Signal. Error message below in 12px Crimson Signal text with a warning icon.
- **Disabled:** Surface Muted background, Slate Mid text, `cursor: not-allowed`.
- **Select dropdowns:** Same shape and sizing as text inputs. Chevron icon in Slate Mid.

### Data Tables

Tables are the primary surface in the product. They deserve the most precision.

- **Header row:** Surface Muted background (`#f1f5f9`). Title weight (600, 12px, uppercase, +0.05em tracking). Midnight Slate text.
- **Body rows:** Chalk White background. 14px/400 body text. 52px row height minimum for touch.
- **Alternating rows:** Optional. If used, odd rows are Chalk White, even rows are `#f8fafc`. Never Surface Muted — too heavy.
- **Borders:** Bottom border only (`1px solid #e2e8f0`) between rows. No outer table border, no cell borders.
- **Hover state:** Row background shifts to Violet Tint (`#f0e5ff`) at 10% opacity — `#f7f3ff`. Smooth 100ms transition.
- **Numeric columns:** Right-aligned, Geist Mono, `font-variant-numeric: tabular-nums`.
- **Action column (last):** Contains icon buttons only. Right-aligned. Appears on row hover.
- **Empty state:** Centered illustration (single-color, 80px), 16px Manrope 600 heading, 14px secondary text, optional CTA button. Never just "No data."

### Navigation (Sidebar)

- **Width:** 240px fixed. Not collapsible on desktop (no hamburger complexity in the admin tool).
- **Background:** Chalk White with 1px Border Fine on the right edge.
- **Logo area:** 64px height, Violet Ink brand mark + "ParaLearn" in Manrope 700.
- **Nav items:** 40px height, 16px horizontal padding, 12px vertical gap. Manrope 500 14px. Slate Mid at rest.
- **Active state:** Violet Tint background (`#f0e5ff`), Violet Ink text, 4px Violet Ink left inset bar (the one place a left stripe is intentional and structural, not decorative).
- **Hover state:** Surface Muted background, Midnight Slate text.
- **Section labels:** 11px Manrope 600, uppercase, +0.08em tracking, Slate Mid color. 24px top padding before each group.
- **Mobile:** Off-canvas at <768px, triggered by hamburger. Overlay with `backdrop-filter: none` — just a dark overlay at 40% opacity.

### Dialogs / Modals

- **Max width:** 480px (standard), 640px (wide, for forms with multiple columns).
- **Border radius:** 12px (lg).
- **Shadow:** `0 8px 32px rgba(15,23,42,0.12)`.
- **Header:** Dialog title in Headline weight. No decorative bars, no gradient headers.
- **Footer:** Right-aligned action buttons. Primary action on the right, ghost/cancel on the left.
- **Close button:** Top-right, 28×28px icon button. Never a large ✕ — small, unobtrusive.
- **Overlay:** `rgba(15,23,42,0.4)` — enough darkness to signal modal without being theatrical.

## 6. Do's and Don'ts

### Do:
- **Do** use Manrope exclusively inside the product shell. `font-family: Manrope, system-ui, sans-serif` on `body`.
- **Do** keep Violet Ink to ≤10% of any screen surface. One primary button, an active nav item, a focus ring — that's the budget.
- **Do** use `font-variant-numeric: tabular-nums` on every numeric data column. Scores, counts, and percentages must align vertically.
- **Do** pair every status color with an icon. The badge color and the icon together communicate state; the color alone does not.
- **Do** use 8px radius for all interactive elements (buttons, inputs, dropdowns). Use 12px only for grouping containers (cards, dialogs).
- **Do** use `translateY(-1px)` + shadow on interactive card hover, at 150ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Do** use `scale(0.97)` on button `:active` to simulate a physical press.
- **Do** place input labels above inputs, always visible, in Manrope 500 12px.
- **Do** design empty states for every list and table — illustration, heading, secondary text, optional CTA.
- **Do** use Border Fine (`#e2e8f0`) as the universal divider. One value, used everywhere, never adjusted per whim.
- **Do** use semantic signal colors as a matched pair: vivid for text/icon, tint for background. `#10b981` text on `#dff9d8` background — never vivid on vivid.
- **Do** test every design against the question "could a school admin process 300 records here in 30 minutes?" If the answer is no, the information density is wrong.

### Don't:
- **Don't** use Inter inside the product shell. Inter is the anti-reference — the exact generic SaaS choice ParaLearn is moving away from.
- **Don't** use gradient text (`background-clip: text` + gradient background) anywhere in the product. The `.text-hero` utility class is for the landing page only.
- **Don't** use glassmorphism on resting content surfaces. `backdrop-filter: blur` and `bg-white/70` are for the public landing page and sticky navigation only. The `.glass-card` class is prohibited in product UI.
- **Don't** use `rounded-2xl` (12px in Tailwind v3, but 20px+ as a named large radius) or `rounded-3xl` on buttons. Buttons are 8px radius. The oversized pill-button aesthetic is the generic SaaS anti-reference.
- **Don't** add `box-shadow` glow to primary buttons (e.g., `shadow-lg shadow-purple-500/20`). Violet Ink's rarity is its authority. Glowing it cheapens it.
- **Don't** use `--grad-primary` (the purple-to-violet gradient) on any UI element inside the product. Reserved for the public landing page hero section only.
- **Don't** use pure `#000000` or pure `#ffffff` for text or backgrounds. Use Midnight Slate for text and Chalk White for surfaces.
- **Don't** nest cards. A card inside a card is always a layout failure — restructure.
- **Don't** repeat identical card grids (icon + heading + text × 3). The admin portal is a data instrument, not a feature showcase.
- **Don't** use `border-left: 4px solid [accent]` as a decorative card stripe. The nav active state is the one structural exception.
- **Don't** animate layout properties (`height`, `width`, `padding`, `margin`). Animate `transform` and `opacity` only.
- **Don't** use AdminLTE-style patterns: no 40-link sidebar, no overshadowed card overuse, no inconsistent spacing, no grey-bar toolbars.
- **Don't** use consumer fintech aesthetics inside the product: no neon accents, no dark hero sections mid-app, no marketing-forward layouts in the product shell.
