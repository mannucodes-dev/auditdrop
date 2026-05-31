# AuditDrop Brand Identity

> Version 2.0 — May 2026
> *"The self-selling sales weapon for Indian freelancers."*

---

## Brand Personality

AuditDrop is a **confident growth partner**. Not a developer tool. Not a startup toy. A money-making machine for hustlers who prospect local businesses on WhatsApp.

**We are:**
- Direct — we tell business owners their site is losing money, not that their "Core Web Vitals need optimization"
- Confident — we don't hedge with "might" or "could" — we show the numbers
- Trustworthy — we earn trust with accuracy, not scare tactics
- Warm — we're on the freelancer's side, helping them close deals
- Slightly bold — we use strong language about money lost, clients leaving, competitors winning

**We are NOT:**
- Technical — no jargon in prospect-facing content
- Generic — not "another SaaS dashboard"
- Apologetic — we don't water down the truth
- Corporate — we talk like a friend who knows business, not a consultant

---

## Voice & Tone

### Prospect-facing copy (reports, CTAs)
- Plain language a salon owner in Jaipur understands
- Money-first: lead with ₹, not metrics
- Specific: "₹15,000/month" not "significant revenue"
- Urgent but not alarmist: "You're losing customers" not "YOUR SITE IS BROKEN!!!"

### Examples

| ❌ Don't say | ✅ Say instead |
|:---|:---|
| Your LCP is 4.2s | Your site takes 4.2 seconds to load — 7 out of 10 visitors leave before seeing it |
| Eliminate render-blocking resources | Your site loads too slowly on phones |
| CLS score of 0.25 | Your page jumps around while loading — visitors get confused and leave |
| Missing canonical URL | (Don't mention this to prospects at all) |
| Consider implementing structured data | Your business doesn't show star ratings in Google Search |

### Freelancer-facing copy (dashboard, marketing)
- Confident and enabling: "Close more deals" not "Try our tool"
- Casual professional: "Your next client is one audit away"
- Money-focused: "₹ closed" > "reports generated"

---

## Color System

### Philosophy
Move away from the "generic dark-SaaS purple glow" toward a **trustworthy growth-tool identity**. Teal conveys trust and growth (banks, health, finance). Amber conveys energy and money. Together they say: "I'll help you make money."

### Primary Palette

| Token | Hex | Usage |
|:---|:---|:---|
| `brand.teal` | `#0F766E` | Primary CTA, nav accents, headings |
| `brand.tealHover` | `#0D9488` | Hover state for primary |
| `brand.tealLight` | `#14B8A6` | Secondary actions, links |
| `brand.tealGlow` | `rgba(15, 118, 110, 0.15)` | Glow effects, selection |
| `brand.amber` | `#F59E0B` | ₹ figures, warnings, attention |
| `brand.amberHover` | `#D97706` | Amber hover |
| `brand.amberLight` | `#FCD34D` | Subtle amber highlights |

### Background Palette (Dark Mode)

| Token | Hex | Usage |
|:---|:---|:---|
| `bg.deep` | `#0C1222` | Page background (deep navy) |
| `bg.card` | `#111827` | Card backgrounds |
| `bg.elevated` | `#1E293B` | Elevated cards, modals |
| `bg.border` | `#1E3A5F` | Borders (navy tint) |
| `bg.borderHover` | `#2563EB33` | Hover borders |

### Text Palette

| Token | Hex | Usage |
|:---|:---|:---|
| `text.primary` | `#F1F5F9` | Headings, primary content |
| `text.secondary` | `#94A3B8` | Body text, descriptions |
| `text.muted` | `#475569` | Captions, timestamps |

### Status Colors (unchanged — universal meaning)

| Token | Hex | Usage |
|:---|:---|:---|
| `status.critical` | `#EF4444` | Score 0–49, errors |
| `status.warning` | `#F59E0B` | Score 50–74, warnings |
| `status.good` | `#10B981` | Score 75–89, passing |
| `status.excellent` | `#06B6D4` | Score 90–100, excellent |

### Contextual Colors

| Token | Hex | Usage |
|:---|:---|:---|
| `whatsapp.green` | `#25D366` | WhatsApp UI elements only |
| `whatsapp.dark` | `#075E54` | WhatsApp header backgrounds |

---

## Typography

### Font Stack
- **Display (headings):** Space Grotesk — characterful, geometric, confident. Used for h1–h3, hero text, score numbers.
- **Body:** Inter — clean, readable, professional. Used for paragraphs, labels, UI text.

### Type Scale

| Token | Size | Weight | Usage |
|:---|:---|:---|:---|
| `display-xl` | 60px / 3.75rem | 700 | Hero headline |
| `display-lg` | 48px / 3rem | 700 | Section headlines |
| `display-md` | 36px / 2.25rem | 700 | Page titles |
| `display-sm` | 30px / 1.875rem | 600 | Sub-headlines |
| `heading-lg` | 24px / 1.5rem | 600 | Card titles |
| `heading-md` | 20px / 1.25rem | 600 | Section subtitles |
| `heading-sm` | 18px / 1.125rem | 600 | Label headings |
| `body-lg` | 18px / 1.125rem | 400 | Lead paragraphs |
| `body` | 16px / 1rem | 400 | Default body text |
| `body-sm` | 14px / 0.875rem | 400 | Secondary text |
| `caption` | 12px / 0.75rem | 500 | Labels, badges, timestamps |

---

## Signature Moment: "The Revenue Counter"

When a report page loads, the estimated monthly revenue loss counter **counts up from ₹0** to the calculated amount:

1. Number starts at ₹0 in green
2. Counts up with easing (2s animation)
3. Color transitions: green → amber → red as the number climbs
4. Lands on final number with a subtle "thud" scale animation (1.05x → 1.0x)
5. A brief pause, then the subtext fades in: "every month"

This is the moment that makes a clinic owner's stomach drop. It's the single most memorable interaction that makes AuditDrop reports unforgettable — and makes the prospect call the freelancer back.

### Implementation notes:
- Pure CSS + React state animation (no animation library required)
- `prefers-reduced-motion: reduce` → skip animation, show final state
- Uses `requestAnimationFrame` for smooth 60fps counting
- Color interpolation via HSL transition (120° green → 45° amber → 0° red)

---

## Design Principles

1. **Money first, metrics second** — Every screen should answer "how much is this costing me?" before "what's my score?"
2. **Mobile is the product** — Reports are viewed on phones via WhatsApp. Design mobile-first, always.
3. **Restraint over flash** — Glassmorphism and 3D effects are garnish, not the meal. One hero effect per page max.
4. **Confidence over caution** — Bold statements, bold colors, bold numbers. No wishy-washy hedging.
5. **Speed is non-negotiable** — No heavy animations that cause layout shift. Lazy-load everything decorative.
