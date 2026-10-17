---
name: TraceIt — Warm Archival
colors:
  light:
    ink: '#10243b'
    ink-soft: '#1d3b5b'
    inverse: '#10243b'
    inverse-soft: '#1d3b5b'
    canvas: '#f1eee6'
    paper: '#f7f4ec'
    sand: '#e9e4d8'
    field: '#fffdf8'
    gold: '#d9b45c'
  dark:
    ink: '#e5e5e5'
    ink-soft: '#cfcfcf'
    inverse: '#3a3a3a'
    inverse-soft: '#4a4a4a'
    canvas: '#141414'
    paper: '#212121'
    sand: '#333333'
    field: '#1a1a1a'
    gold: '#c9a445'
typography:
  primary:
    fontFamily: Readex Pro, Cairo, Inter, system-ui, sans-serif
  mono:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, monospace
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
shadow:
  offset: 6px 6px 0 var(--color-gold)
  offset-lg: 9px 9px 0 var(--color-gold)
---

## Brand & Style

TraceIt is a lost-and-found utility for university campuses. Its visual identity blends **archival warmth** with **digital precision**: warm cream surfaces, deep navy ink, and a signature **gold offset shadow** that evokes a physical filing card on a desk. Arabic (RTL) is the primary language; English (LTR) is fully supported.

The design language deliberately avoids heavy border-radius and glossy gradients. Instead it relies on **sharp edges**, **solid offset shadows**, and **muted sand fills** to communicate structure and trust. Emerald signals "found" / high-confidence matches; amber signals "lost" / pending states. The dark mode inverts the warm palette into neutral greys while preserving the same structural hierarchy.

## Colors

The light palette is a warm, paper-inspired scale:

- **Ink (`#10243b`)**: Deep navy — primary text, borders, and structural lines. Never used as a large fill; use `inverse` for surfaces.
- **Inverse (`#10243b`)**: The dark surface token for buttons, active nav pills, and dark badges. Flips to `#3a3a3a` (dark grey) in dark mode.
- **Canvas (`#f1eee6`)**: Page background. Warm cream.
- **Paper (`#f7f4ec`)**: Card and panel surface. Slightly lighter than canvas.
- **Sand (`#e9e4d8`)**: Muted fills — icon tiles, placeholder zones, inactive tab backgrounds.
- **Field (`#fffdf8`)**: Form input backgrounds. The lightest surface.
- **Gold (`#d9b45c`)**: Accent color. Used exclusively for the offset box-shadow signature and subtle hover highlights.

Semantic Tailwind palettes used alongside the tokens:

- **Emerald**: "Found" status, high-confidence match badges (≥85%), success alerts.
- **Amber**: "Lost" status, warning disclaimers, medium-confidence badges (50–84%).
- **Slate**: Metadata text, borders, dividers, low-confidence badges.

### Dark Mode

A grey dark palette activates via a class toggle on `<html>`. All token values and the Tailwind slate / amber / emerald / red scales are overridden with dark equivalents so every utility auto-flips:

| Token | Light | Dark |
|-------|-------|------|
| ink | `#10243b` | `#e5e5e5` |
| inverse | `#10243b` | `#3a3a3a` |
| canvas | `#f1eee6` | `#141414` |
| paper | `#f7f4ec` | `#212121` |
| sand | `#e9e4d8` | `#333333` |
| field | `#fffdf8` | `#1a1a1a` |
| gold | `#d9b45c` | `#c9a445` |

The pre-mount inline script in `index.html` reads `localStorage["traceit-theme"]` and applies the `dark` class before React mounts, preventing a flash.

## Typography

- **Primary**: Readex Pro (Arabic-first variable font) with Cairo and Inter fallbacks. Loaded from Google Fonts; degrades gracefully offline to system Arabic fonts.
- **Monospace**: `ui-monospace` stack — used for IDs, hashes, tracking labels, and the TraceIt logo badge.
- **Numeric clarity**: Tabular numerals (`font-variant-numeric: tabular-nums`) are enforced on all match percentages, hamming distances, report IDs, and result counts via the `.tnum` utility class.
- **Bilingual**: Arabic RTL uses zero tracking; English LTR uses modest `tracking-widest` / `tracking-[0.16em]` on mono labels only.

## Layout & Spacing

- **Container**: `max-w-7xl` centered, `px-4 sm:px-6`.
- **Grid system**: CSS Grid — stats use `grid-cols-2 md:grid-cols-4`; action cards use `grid-cols-1 sm:grid-cols-3`; report cards use `grid-cols-1 md:grid-cols-3`.
- **Spacing rhythm**: Tailwind default scale. Section gaps are `space-y-10` (2.5rem) on Home; component gaps are `gap-5` / `gap-6`.
- **RTL/LTR**: Tailwind logical properties (`ms-auto`, `start-*`, `end-*`, `border-s`, `border-e`) flip automatically with `<html dir>`. Hardcoded `left` / `right` are used only inside `dir="ltr"` containers (e.g., the hero sample card).

## Elevation & Depth

TraceIt uses a distinctive **solid offset shadow** instead of blurred elevation:

- **Standard**: `6px 6px 0 var(--color-gold)` — applied to stat cards, action cards, and report cards.
- **Hover (lift)**: `9px 9px 0 var(--color-gold)` — triggered on card hover for a tactile "pick up" feel.
- **Form panel**: `8px 8px 0 var(--color-gold)` — larger offset for the report form card.
- **Hero sample card**: `12px 12px 0 var(--color-gold)` — maximum offset for the hero illustration.
- **Hero section**: Soft ambient shadow `0 24px 60px rgba(15,23,42,0.18)` — the only blurred shadow in the app.

No blur-based elevation tiers. Depth is communicated purely through offset distance and the gold accent.

## Shapes

The interface is **predominantly sharp-cornered** (0px radius), reinforcing the archival / dossier aesthetic. Rounded corners are reserved for specific interactive elements:

- **Sharp (0px)**: Cards, stats, nav pills, buttons, inputs, image pickers, badges, footer.
- **Rounded-2xl (`1rem`)**: Report form submit button, hero section wrapper.
- **Full (`9999px`)**: Status badges (found/lost pills), match score pills, spinner.

## Components

### 1. Navigation
- **Bar**: Sticky, `bg-paper`, `border-b border-ink`.
- **Logo**: Mono `TraceIt` badge on `bg-inverse` with `text-amber-200`.
- **Links**: `NavLink` with active state `bg-inverse text-amber-200`, inactive `text-slate-600 hover:bg-sand hover:text-ink`.
- **Toggles**: Language and theme toggles sit at the end of the nav (`ms-auto`), styled as text buttons with icons.

### 2. Hero Section (Home)
- **Background**: `bg-inverse text-white`, `rounded-[2rem]`, soft ambient shadow.
- **Decorative corners**: Emerald/amber 1px L-brackets at opposite corners.
- **Banner badge**: Emerald-tinted inline pill with a green dot.
- **CTAs**: Primary `bg-amber-300 text-slate-950`; secondary ghost `border-white/30`.
- **Sample card**: A static "trace record" illustration inside a `dir="ltr"` container, showing how a match result looks. Uses `bg-paper text-slate-900` with the signature gold offset shadow.

### 3. Report Cards
- **Container**: `bg-paper`, `border border-slate-300 border-s-4`, gold offset shadow.
- **Accent border**: `border-s-emerald-600` (found) or `border-s-amber-500` (lost).
- **Status pill**: Rounded-full badge with icon — emerald for found, amber for lost.
- **Match score**: Rounded-full pill; color-coded by confidence (emerald ≥85%, amber 50–84%, slate <50%).
- **ID badge**: Mono `#NNN` on `bg-inverse text-amber-200`, anchored to the image corner.
- **Hamming bar**: Thin progress bar (`h-1.5`) with `bg-slate-200` track.

### 4. Buttons
- **Primary**: `bg-inverse text-amber-200`, hover `bg-inverse-soft`, active `scale-95`. Used for form submits and search actions.
- **Hero primary**: `bg-amber-300 text-slate-950`, hover `bg-amber-200`.
- **Ghost/secondary**: `border border-white/30` (on dark) or `border border-slate-300` (on light).
- **Disabled**: `opacity-60` or `bg-slate-400 text-white`.

### 5. Input Fields
- **Text inputs**: `border border-slate-300 bg-field`, `focus:border-ink focus:ring-2 focus:ring-amber-300`.
- **Image picker**: `border-2 border-dashed border-slate-300 bg-sand`, hover `border-ink`. Preview state: `border-emerald-300 bg-emerald-50`.

### 6. Alerts & Feedback
- **Success**: `bg-emerald-50 border-emerald-200 text-emerald-800`.
- **Error**: `bg-red-50 border-red-200 text-red-800`.
- **Disclaimer**: `border-amber-400 bg-paper` with amber warning icon.
- **Spinner**: `border-4 border-ink border-t-transparent` rounded-full.

### 7. Footer
- **Bar**: `bg-paper border-t border-slate-300`, single line with bold amber note prefix.