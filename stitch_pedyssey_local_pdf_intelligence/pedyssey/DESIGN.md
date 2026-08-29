---
name: Pedyssey
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1b'
  on-surface-variant: '#474837'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#787865'
  outline-variant: '#c8c8b1'
  surface-tint: '#5d6300'
  primary: '#5d6300'
  on-primary: '#ffffff'
  primary-container: '#dfe968'
  on-primary-container: '#616800'
  inverse-primary: '#c5ce51'
  secondary: '#815527'
  on-secondary: '#ffffff'
  secondary-container: '#ffc38b'
  on-secondary-container: '#7a4e21'
  tertiary: '#785460'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffd6e2'
  on-tertiary-container: '#7d5965'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1eb6a'
  primary-fixed-dim: '#c5ce51'
  on-primary-fixed: '#1b1d00'
  on-primary-fixed-variant: '#454a00'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#f6bb84'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#663e11'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#e8bbc8'
  on-tertiary-fixed: '#2d131d'
  on-tertiary-fixed-variant: '#5e3d49'
  background: '#fcf9f8'
  on-background: '#1b1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Yellowtail
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  wordmark-script:
    fontFamily: Yellowtail
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1'
  wordmark-sans:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1'
  headline-xl:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system for this local-first AI PDF platform is built on an "Editorial Playful" aesthetic. It balances the intellectual rigor of a document workspace with a warm, organic, and tactile personality. The design rejects the coldness of traditional enterprise software in favor of a "Moonwood-inspired" warmth.

The brand personality is **intelligent yet approachable**, characterized by:
- **Organic Geometry:** Replacing rigid boxes with irregular curves and scalloped edges to feel more human.
- **Editorial Polish:** High-contrast typography and generous negative space reminiscent of modern independent magazines.
- **Tactile Minimalism:** 1px ink borders and pill shapes that give the UI a "printed on paper" feel despite the high-tech AI core.
- **Local-First Privacy:** Expressed through a grounded color palette (Ink and Cream) that feels stable and reliable.

## Colors
The palette is warm and "sunny," designed to reduce the eye strain associated with long-form reading.

- **The Continuous Gradient:** The application background must use a linear gradient at a 135-degree angle: `#FBF1CF` (0%) → `#F6C8D6` (50%) → `#F3A878` (100%).
- **Ink (#1C1C1C):** Used for all text, borders (1px or 1.5px), and icons to maintain high legibility against the warm backgrounds.
- **Lime (#DFE968):** The "Intelligence" color. Use this for AI-generated highlights, active states, and "magic" features.
- **CTA Peach (#F6BB84):** Reserved for primary action buttons and urgent navigational elements.
- **Card Cream (#FBF6DF):** Used for floating panels and workspace containers to provide a subtle lift from the background gradient.

## Typography
Typography is the primary driver of the "Editorial" feel. 

- **The Wordmark:** Formed by combining "Ped" in Yellowtail and "yssey" in Poppins (Bold/800).
- **Sans-Serif (Poppins):** Used for all functional UI and PDF metadata. Weights should stick to 500 (Medium) for body and 700-800 for headers to ensure clarity.
- **Script (Yellowtail):** Use sparingly for decorative labels, emphasis in sidebar headers, or empty-state illustrations.
- **Hierarchy:** Maintain large margins between headers and body text. Use `label-caps` for technical metadata (e.g., File Size, Date Created) to differentiate it from content.

## Layout & Spacing
The layout relies on "Floating Panels" rather than a rigid full-screen grid.

- **The Workspace:** The central PDF viewer and AI chat panels should appear as "floating" cards with visible 1px ink borders.
- **Wavy Panels:** Sidebar dividers and the top header should utilize SVG paths to create subtle wavy or scalloped bottom edges, breaking the horizontal monotony.
- **Safe Areas:** Maintain a minimum of 40px margin on desktop to let the background gradient breathe around the workspace panels.
- **Responsive Reflow:** On mobile, panels stack vertically. The sidebar becomes a bottom-sheet with a scalloped top edge.

## Elevation & Depth
This design system avoids traditional shadows in favor of "Structural Depth":

- **Tonal Layering:** Depth is achieved by placing `Card Cream` panels over the `Continuous Gradient` background.
- **The Ink Border:** A consistent 1px or 1.5px border in `Ink` defines every interactive surface. This creates a flat, illustrative depth similar to a graphic novel or editorial layout.
- **Active State "Lift":** When an element is active or hovered, it does not glow; instead, it gains a subtle 4px offset "hard shadow" (a solid block of Ink color) to simulate a physical button being pressed or a card being raised.

## Shapes
The shape language is the most distinctive element of the design system.

- **Irregular Corners:** Use a default border-radius of `28px` for main containers. To enhance the organic feel, use CSS `border-radius: 28px 120px 28px 120px / 120px 28px 120px 28px;` for primary feature cards to create a subtle "blob" effect.
- **Pill Shapes:** All buttons and tags must use a full pill shape (border-radius: 9999px).
- **SVG Blobs:** Decorative elements should be generated as organic SVG blobs in `Blush` or `Lime` with low opacity (20-40%) to sit behind text without affecting legibility.
- **Scalloped Edges:** Use SVG masks or background-image patterns to create "wavy" separators between UI sections.

## Components
- **Buttons:** Pill-shaped with a 1.5px Ink border. Primary buttons use `CTA Peach` background. Secondary buttons use `Card Cream`. Hover state: 4px solid Ink shadow offset.
- **Input Fields:** Rounded (28px) with Ink borders. Use `Card Cream` for the background. Focus state: Border thickens to 2px and gains a `Lime` subtle outer glow.
- **AI Highlight:** Text selections or AI insights should use a `Lime` background with a slightly "messy" SVG underline or highlighter-stroke effect.
- **Cards (The Pedup Workspace):** Large containers with 28px irregular corners, 1.5px Ink border, and `Card Cream` background.
- **Chips/Tags:** Small pill-shaped containers in `Blush` or `Lime` with `Ink` text, used for PDF categories or AI-detected entities.
- **Icons:** Use a custom-curated set of monoline SVG icons. Line weight must match the UI border weight (1.5px) for visual harmony.