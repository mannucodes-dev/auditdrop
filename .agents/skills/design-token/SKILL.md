---
name: design-token
description: >-
  Adds and uses Tailwind v4 @theme design tokens correctly. Ensures all visual
  values flow through src/styles/tokens.ts and the globals.css @theme block.
  Use when adding colors, spacing, typography, or any visual styling.
---

# Design Token Management

## Overview

AuditDrop has a strict design token system. Every visual value — colors, radii,
shadows, fonts — is defined in TWO places that must stay in sync:

1. **`src/styles/tokens.ts`** — TypeScript constants used in JS/TSX logic
2. **`src/app/globals.css` `@theme` block** — CSS custom properties for Tailwind utilities

Never hardcode hex values, pixel sizes, or color names directly in components.

## Brand Identity

| Element | Value | Token |
|---------|-------|-------|
| Primary | `#7C3AED` (violet) | `brand.primary` / `--color-brand-primary` |
| Primary Hover | `#6D28D9` | `brand.primaryHover` / `--color-brand-primary-hover` |
| Secondary | `#A855F7` | `brand.secondary` / `--color-brand-secondary` |
| Background | `#0A0A0F` | `bg.primary` / `--color-bg-primary` |
| Card BG | `#111118` | `bg.secondary` / `--color-bg-secondary` |
| Text | `#F1F5F9` | `text.primary` / `--color-text-primary` |
| Muted Text | `#94A3B8` | `text.secondary` / `--color-text-secondary` |

## Status Colors (Score-Based)

| Range | Color | Token |
|-------|-------|-------|
| 90-100 | Cyan `#06B6D4` | `status.excellent` |
| 75-89 | Green `#10B981` | `status.good` |
| 50-74 | Amber `#F59E0B` | `status.warning` |
| 0-49 | Red `#EF4444` | `status.critical` |

## Workflow: Adding a New Token

1. **Define in `src/styles/tokens.ts`** under the appropriate namespace:
   ```typescript
   export const tokens = {
     colors: {
       accent: {
         info: '#3B82F6',   // descriptive comment
       },
     },
   };
   ```
2. **Mirror in `src/app/globals.css`** inside the `@theme` block:
   ```css
   @theme {
     --color-accent-info: #3B82F6;
   }
   ```
3. **Use via Tailwind utility** in components:
   ```tsx
   <div className="text-accent-info bg-accent-info/10">
   ```
4. **Document** the token with a JSDoc comment in tokens.ts.

## Premium Visual Patterns Available

These CSS classes are already defined in `globals.css` and should be used where
appropriate instead of creating one-off styles:

- `glass` / `glass-card` / `glass-nav` — Glassmorphism with backdrop-filter
- `gradient-border` — Animated rotating conic gradient border
- `shimmer-btn` — CTA button with sliding light shimmer
- `grid-bg` — Subtle grid background overlay
- `noise-bg` — Noise texture overlay for depth
- `hero-gradient` — Radial gradient hero section background
- `underline-grow` — Animated underline on hover for nav links
- Score glows: `score-glow-green`, `score-glow-amber`, `score-glow-red`

## Design Philosophy

AuditDrop is NOT a generic dark SaaS template. It is a **branded tool for freelancers**.
Design choices should feel:
- **Professional** — like a premium analytics platform
- **Feature-rich** — dense with data but not cluttered
- **Branded** — violet accent creates identity; not interchangeable with any other dark app
- **Alive** — micro-interactions (hover effects, score animations, shimmer effects) make it feel responsive

## Common Mistakes

- Using `bg-slate-950` or `text-white` directly instead of `bg-bg-primary` / `text-text-primary`.
- Adding a color in tokens.ts but forgetting to add the CSS custom property in globals.css.
- Creating inline styles or one-off CSS classes when a token should be added.
