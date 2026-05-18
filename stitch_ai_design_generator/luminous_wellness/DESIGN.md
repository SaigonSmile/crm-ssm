---
name: Luminous Wellness
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#574336'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#8a7263'
  outline-variant: '#dec1b0'
  surface-tint: '#964900'
  primary: '#964900'
  on-primary: '#ffffff'
  primary-container: '#ec7700'
  on-primary-container: '#4f2400'
  inverse-primary: '#ffb786'
  secondary: '#5a5f65'
  on-secondary: '#ffffff'
  secondary-container: '#dee3ea'
  on-secondary-container: '#60656b'
  tertiary: '#8f4e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#e27e02'
  on-tertiary-container: '#4c2600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#ffb786'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#dee3ea'
  secondary-fixed-dim: '#c2c7ce'
  on-secondary-fixed: '#171c21'
  on-secondary-fixed-variant: '#42474d'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77b'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  status-success: '#22C55E'
  status-warning: '#F59E0B'
  status-error: '#EF4444'
  status-info: '#3B82F6'
  glass-surface: rgba(255, 255, 255, 0.5)
  subtle-grey: '#F7F7F7'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '300'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '300'
    lineHeight: '1.4'
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '400'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is crafted for a high-end medical spa CRM, prioritizing a sense of clinical precision blended with premium hospitality. The brand personality is professional, inviting, and sophisticated, targeting high-net-worth clients and specialized medical staff.

The aesthetic follows a **Refined Glassmorphism** approach. By combining large amounts of whitespace (Minimalism) with soft, translucent layers and frosted glass effects, the interface feels airy and modern. This style mimics the clean, reflective surfaces found in luxury medical environments, ensuring the digital experience is as premium as the physical clinic.

## Colors

This design system utilizes a high-vibrancy primary orange to drive action and reflect the "Smile" energy of the brand. The primary palette is balanced by a sophisticated Slate Grey for text and icons, ensuring high legibility without the harshness of pure black.

- **Primary & CTA:** Used for the most critical path actions and brand identifiers.
- **Glassy Layers:** Applied to cards and overlays using the `glass-surface` token combined with a `12px` backdrop blur to create depth.
- **Status Colors:** Standardized for medical records, appointment statuses, and financial indicators.
- **Neutrality:** The background remains predominantly white to maintain a "clinical-clean" look.

## Typography

The typography system relies exclusively on **Inter** to project a systematic, utilitarian, yet modern image. 

The defining characteristic of this system is the **Light (300) weight** for primary headings. This creates an elegant, high-end editorial feel that differentiates the CRM from standard corporate tools. Body text is optimized at 14-15px with a generous 1.6 line-height to ensure readability during long periods of data entry and patient management.

## Layout & Spacing

The layout uses a **Fixed-Fluid Hybrid** model. The navigation is anchored by a fixed 260px sidebar on the left, finished in a minimalist white with a subtle right-hand border or soft shadow to separate it from the workspace.

- **Grid:** A 12-column grid is used for the main content area.
- **Rhythm:** Spacing follows an 8px scale, with 24px (3 units) being the standard gutter for card layouts.
- **Breakpoints:** 
  - Mobile (<768px): Sidebar collapses into a hamburger menu; margins reduce to 16px.
  - Desktop (>1024px): Sidebar is persistent; content area expands up to a 1440px max-width to maintain scanability.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Stacking** and **Glassmorphism** rather than heavy shadows.

1.  **Level 0 (Base):** The main background (`#FFFFFF`), representing the lowest floor.
2.  **Level 1 (Cards):** Surfaces use a 20px border radius and a very soft, diffused shadow (`0 10px 30px rgba(0,0,0,0.04)`).
3.  **Level 2 (Glass Overlays):** Modals and flyouts use the `glass-surface` token with a `backdrop-filter: blur(12px)`. This allows the UI to feel layered and deep without feeling cluttered.

## Shapes

The shape language is extremely soft and approachable. 
- **Cards:** Use a generous `20px` (extra-large) radius to evoke comfort.
- **Interactive Elements:** Buttons and inputs use a slightly tighter `12px` radius to maintain a sense of precision.
- **Indicators:** Badges and status chips are fully rounded (pill-shaped) to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Vibrant Orange (`#EC7700`) background with White text. 12px radius. High emphasis.
- **Secondary:** Transparent background with a thin Slate Grey border (`#54595F` at 20% opacity).
- **Size:** Standard height is 44px for touch-friendliness.

### Inputs
- **Style:** Underline-only style or a very light grey (`#F7F7F7`) filled background. No hard 4-sided borders. Focus state transitions the underline to Primary Orange.

### Cards
- **Construction:** 20px radius, white or glassy background, soft ambient shadow. Used for patient profiles, appointment details, and analytics.

### Badges & Chips
- **Design:** Fully rounded (pill). Use a 10% opacity version of the status color for the background and 100% opacity for the text (e.g., Status Green Badge: Background `rgba(34, 197, 94, 0.1)`, Text `#22C55E`).

### Sidebar
- **Visuals:** Minimalist white, 260px width. Active links are indicated by a vertical orange bar on the left and a subtle weight change in the Inter typeface.