# ⚡ AuditDrop

**Turn any business URL into a professional website audit report. Share it on WhatsApp and convert cold leads into paying clients.**

AuditDrop is a SaaS tool built for Indian freelancers, web agencies, and digital marketers. Paste a URL → get a branded audit report with performance scores, SEO checks, revenue impact estimates, and a one-click CTA. Share it on WhatsApp to close deals faster.

---

## Features

### Core Audit Engine
- **Google PageSpeed Insights** — Mobile + Desktop scores with retry/backoff
- **Custom Checks** — Click-to-call, HTTPS, analytics, viewport, contact form
- **SEO Health** — Meta description, H1 tags, structured data, canonical URL, Open Graph
- **Google Business Profile** — Rating, reviews, photos, hours, profile completeness (via Places API)
- **Competitor Comparison** — Audit up to 2 competitor URLs side-by-side

### Revenue Impact Engine
- Category-aware ₹ estimates (dental, restaurant, salon, real estate, etc.)
- Lost leads + lost revenue calculated from audit issues
- Indian numbering format (L/Cr)

### Pipeline CRM
- Prospect status tracking (New → Contacted → Interested → Won/Lost)
- Private notes + phone numbers (Firestore private sub-collection)
- View count tracking with uncontacted highlight

### WhatsApp Integration
- One-click WhatsApp sharing with pre-filled audit message
- Direct wa.me links with prospect's phone number

### Embeddable Widget
- Paste an `<iframe>` on any website to capture audit leads
- Public API with IP-based rate limiting + per-owner daily quota (50/day)
- Leads appear in your dashboard automatically

### Design System
- Custom design tokens (Tailwind v4 `@theme` directive)
- Reusable components: Button, Badge, Card, Toast, Skeleton
- Animated ScoreDial with null-score support
- Dark mode, glassmorphism, micro-animations

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 14 (App Router)             |
| Language   | TypeScript (strict)                 |
| Styling    | Tailwind CSS v4                     |
| Auth       | Firebase Authentication (Google)    |
| Database   | Cloud Firestore                     |
| Hosting    | Vercel                              |
| Font       | Inter (Google Fonts, next/font)     |
| Validation | Zod                                 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore + Auth enabled
- (Optional) ScreenshotOne API key
- (Optional) Google Places API key

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/auditdrop.git
cd auditdrop

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your Firebase credentials and optional API keys

# Run dev server
npm run dev
```

### Environment Variables

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | ✅ | Firebase client SDK config |
| `FIREBASE_ADMIN_*` | ✅ | Firebase Admin SDK credentials |
| `SCREENSHOTONE_API_KEY` | ❌ | Screenshot thumbnails |
| `PSI_API_KEY` | ❌ | Higher PSI quota |
| `GOOGLE_PLACES_API_KEY` | ❌ | Google Business Profile audit |

### Deploy Firestore Rules

```bash
npx firebase-tools deploy --only firestore:rules
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page (Google OAuth)
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard with pipeline CRM
│   │       ├── new/page.tsx    # New audit form
│   │       └── settings/page.tsx # Settings + embed widget
│   ├── api/
│   │   ├── audit/route.ts     # Authenticated audit API
│   │   ├── audit/public/route.ts # Public embed audit API
│   │   └── report/[reportId]/view/ # View tracking
│   ├── embed/[userId]/        # Embeddable widget page
│   ├── r/[reportId]/          # Public report page (SSR)
│   └── layout.tsx             # Root layout + ToastProvider
├── components/
│   ├── ui/                    # Design system components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   ├── AuditForm.tsx          # Audit submission form
│   ├── IssueCard.tsx          # Individual issue display
│   ├── ReportCard.tsx         # Dashboard report card
│   ├── ReportPage.tsx         # Public report renderer
│   └── ScoreDial.tsx          # Animated score ring
├── hooks/
│   ├── useAuth.ts             # Firebase auth hook
│   └── useReports.ts          # Firestore reports + private data
├── lib/
│   ├── apiError.ts            # Safe error handler (no stack leaks)
│   ├── authFetch.ts           # Auto-refreshing auth fetch wrapper
│   ├── env.ts                 # Environment validation
│   ├── firebase-admin.ts      # Server-side Firebase Admin
│   ├── firebase.ts            # Client-side Firebase
│   ├── gbp.ts                 # Google Business Profile audit
│   ├── psi.ts                 # PageSpeed Insights with retry
│   ├── rateLimit.ts           # Sliding window rate limiter
│   ├── reportUtils.ts         # Revenue impact + issue generation
│   ├── scraper.ts             # HTML scraper + entity decoder
│   ├── types.ts               # Shared TypeScript types
│   └── validation.ts          # Zod schemas + SSRF protection
└── styles/
    └── tokens.ts              # Design token definitions
```

---

## Security

- **SSRF protection** — URL validation blocks internal/private IPs
- **Input validation** — All API inputs validated with Zod
- **Rate limiting** — Sliding window per-user and per-IP
- **Safe errors** — Stack traces never exposed to clients in production
- **Auth tokens** — Auto-refreshed with `authFetch()` wrapper
- **Security headers** — CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Private data** — Prospect phone/notes in Firestore private sub-collection (owner-only rules)
- **Embed quotas** — 3 req/hr/IP + 50 audits/day per embed owner

---

## License

MIT

---

Built with ❤️ for Indian freelancers who close deals on WhatsApp.
