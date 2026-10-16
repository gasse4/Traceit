---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#003211'
  on-tertiary: '#ffffff'
  tertiary-container: '#004b1d'
  on-tertiary-container: '#44c365'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an institutional yet deeply approachable civic utility for higher education ecosystems. It balances rigorous institutional reliability with the friction-free fluidity expected by modern students and university staff. The emotional tone shifts anxiety and disorientation into reassurance, transparency, and methodical recovery.

Drawing from modern institutional minimalism and crisp functional utility, the visual direction eliminates decorative noise in favor of data legibility, structured metadata grids, and explicit visual confirmation states. Layouts maintain generous breathing room, structured surfaces, and refined typography capable of seamless bidirectional execution (LTR and RTL). Surfaces rely on bright optical clarity, high-contrast structural data, and clear chromatic feedback to convey confidence, verified ownership, and rapid resolution across multi-campus operations.

## Colors

The palette leverages collegiate authority paired with purposeful operational signaling:

- **Primary Royal Anchor (`#1e3a8a`)**: Represents institutional authority, security, and verified records. Used for primary navigation bars, active structural frames, key headings, and high-priority actions.
- **Secondary Cobalt (`#2563eb`)**: Provides an accessible, dynamic interaction layer for interactive states, focused focus rings, active links, and visual search controls.
- **Tertiary Emerald (`#16a34a`)**: Reserved specifically for verified resolutions—positive Hamming similarity thresholds (>85%), confirmed returned items, approved claims, and active matches.
- **Warning Amber (`#f59e0b`)**: Applied to pending reviews, in-transit custody, unverified identity claims, and partial visual matches (50%–84%).
- **Neutral Canvas (`#f8fafc`) & Slate Textures (`#64748b`, `#1e293b`)**: Canvas backgrounds rely on crisp cool off-white (`#f8fafc`), with high-density text rendered in ink slate (`#1e293b`) and supportive operational metadata in slate gray (`#64748b`). Pure white (`#ffffff`) is strictly preserved for active content containers, cards, and elevate-level modal inputs.

## Typography

Typography prioritizes clarity, cross-linguistic proportion matching, and numeric precision.

- **Typeface Selection**: Inter is configured as the universal primary Latin face, pairing dynamically with systemic Naskh/modern geometric Arabic fallbacks (`Readex Pro` and `Cairo`) without vertical baseline drift.
- **Numeric Clarity**: Tabular numerals (`tnum`) must be enforced across all match percentages, dates, custody IDs, and similarity metrics to prevent visual shudder during progressive image filtering.
- **Hierarchical Discipline**: Display sizes are reserved strictly for high-impact landing utility and platform metrics. Dense catalog views rely on `title-md` and `body-sm` for immediate contextual scanning without overwhelming users looking for misplaced belongings.
- **Bilingual Bidirectionality**: In Arabic RTL context, tracking tokens are flattened to zero (`letterSpacing: 0`) across all label and display tiers to maintain natural Arabic cursive ligatures.

## Layout & Spacing

The layout model is anchored to a responsive 12-column grid system configured on an 8px base rhythm (with 4px micro-steps for tight badge and metadata alignment).

- **Breakpoints & Grids**:
  - **Desktop (≥1280px)**: 12-column fluid grid, 1280px maximum content constraint, `gutter: 1.5rem`, `margin-desktop: 3rem`.
  - **Tablet (768px – 1279px)**: 8-column fluid grid, `gutter: 1.25rem`, `margin: 2rem`.
  - **Mobile (<768px)**: 4-column fluid grid, `gutter-mobile: 1rem`, `margin-mobile: 1rem`.
- **Reflow Architecture**:
  - The dual-mode visual/text search unit sits full-width across 12 columns on desktop, transitioning to a vertical stacked input on mobile screens.
  - Item catalog cards arrange in a 3-column layout on desktop (4 cols each), 2-column layout on tablet, and single-column full-width cards on mobile.
- **RTL Fluidity**: All grid offsets, margin declarations, and lateral paddings utilize logical properties (`margin-inline-start`, `padding-inline-end`) ensuring instant inversion across English and Arabic interfaces.

## Elevation & Depth

This design system rejects deep skeumorphic shadows and muddy drops in favor of architectural surface containment, crisp low-contrast borders, and ambient light distribution:

- **Level 0 (Base Canvas)**: `#f8fafc` flat background, zero elevation, non-interactive.
- **Level 1 (Card & Content Surface)**: Solid `#ffffff` surface bound by a structural 1px border (`#e2e8f0`). Backed by a subtle diffuse ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Hover & Dropdowns)**: Applied to hovered item cards, contextual menus, and dropzone hover-active states: `0 10px 15px -3px rgba(30, 58, 138, 0.04), 0 4px 6px -4px rgba(30, 58, 138, 0.03)` with border tinting shifting towards `#cbd5e1`.
- **Level 3 (Modals & Claim Inspection Drawers)**: High-priority floating modals and image preview dialogs: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a semi-transparent slate wash (`rgba(15, 23, 42, 0.4)` with 4px backdrop blur).

## Shapes

The interface embraces a structured, balanced shape geometry (Level 2: Rounded) that strikes an optimal equilibrium between institutional software formality and contemporary consumer elegance.

- **Component Standard (`0.5rem` / `8px`)**: Applied to search input fields, primary action buttons, metadata badges, image upload dropzones, and standard input boxes.
- **Containers & Cards (`1rem` / `16px`)**: Applied to lost/found item cards, modal frames, and media preview wrappers.
- **Pill Geometry (`9999px`)**: Reserved exclusively for atomic tags, category chips, status pills, and the Hamming match percentage scores to create unmistakable visual distinction against rectilinear card architectures.

## Components

### 1. Dual Search Bar & Visual Dropzone
- **Search Header**: A single unified container featuring a split layout. The left (LTR) side hosts a text query input for keywords, serial numbers, and locations. The right side features a compact, dashed-border image dropzone.
- **Image Dropzone**: Visual cue supporting Drag & Drop with immediate miniature thumbnail generation upon file entry, integrated optical camera capture trigger, and clear state buttons.
- **Border States**: Defaults to 1px `#e2e8f0`. Shifts to 2px `#2563eb` with an outer halo of `rgba(37, 99, 235, 0.12)` when active or dragging an image over the target zone.

### 2. Item Cards (Lost / Found)
- **Container**: White `#ffffff` background, `rounded-lg` (16px), 1px solid border (`#e2e8f0`).
- **Media Header**: Fixed aspect ratio (4:3) with subtle object-cover styling. An absolute pill badge rests in the upper corner displaying the similarity match score.
- **Match Metric Badge (Hamming Distance Score)**:
  - **High Confidence (≥85%)**: Emerald background (`#dcfce7`), emerald text (`#15803d`), leading check-icon.
  - **Medium Confidence (50–84%)**: Amber background (`#fef3c7`), amber text (`#b45309`).
  - **Low/Raw Entry (<50% or Unscored)**: Slate background (`#f1f5f9`), slate text (`#475569`).
- **Card Body**:
  - Item Title: `title-md`, `#1e293b`, 1-line truncation.
  - Metadata Grid: 2-column or inline flex collection containing location (e.g., "Main Library - 2nd Fl"), date/time, and campus division using `body-sm` with slate iconography.

### 3. Status Tags & Category Chips
- **Status Pills**:
  - Found / Matched: Solid `#16a34a` dot icon, background `#f0fdf4`, text `#166534`.
  - Pending Review / In Custody: Solid `#f59e0b` dot icon, background `#fffbeb`, text `#92400e`.
  - Archived / Returned: Background `#f1f5f9`, text `#64748b`.
- **Category Chips**: Low-contrast interactive pills (`space-xs` padding vertical, `space-sm` horizontal), background `#f8fafc`, border 1px solid `#e2e8f0`, hover background `#f1f5f9`.

### 4. Interactive Buttons
- **Primary**: Deep Royal Blue (`#1e3a8a`), hover state (`#1e40af`), active state (`#172554`), white text, `label-lg`, 8px radius.
- **Secondary**: Crisp white background, 1px solid `#cbd5e1`, slate text (`#1e293b`), hover background (`#f8fafc`).
- **Accent Action**: Secondary Cobalt (`#2563eb`) used for verification queries, image uploads, and "Claim Item" flows.

### 5. Input Fields & Form Controls
- **Text Inputs**: Height 44px, internal padding `space-md`, border 1px solid `#cbd5e1`, typography `body-md`. Focus state adopts 2px ring in `#2563eb`.
- **Checkboxes & Radios**: 18px dimensions, 4px radius for checkboxes, full circle for radios. Checked state fills `#1e3a8a` with white tick mark.