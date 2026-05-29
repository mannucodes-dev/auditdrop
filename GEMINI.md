# PROJECT CONTEXT — AUDIT DROP

> **Scope:** This project only — supplements `~/GEMINI.md` (global rules still apply).

---

## PROJECT IDENTITY

| Field | Value |
|---|---|
| **Project** | AuditDrop |
| **Owner** | Mannu (Solo) |
| **Stage** | Active build |
| **Goal** | Turn any business URL into a branded, shareable website audit report for freelancer cold outreach. |

---

## TECH STACK (SOURCE OF TRUTH)

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Turbopack disabled — too RAM-heavy on 8GB machines |
| **Language** | TypeScript — `strict: true` | Target: ES2017, module: esnext |
| **Styling** | Tailwind CSS v4 | Uses `@import "tailwindcss"` syntax, `@tailwindcss/postcss` |
| **Auth** | Firebase Authentication (Google Sign-In only) | Client: `firebase/auth`, Server: `firebase-admin/auth` |
| **Database** | Firebase Firestore | Client: `firebase/firestore`, Server: `firebase-admin/firestore` |
| **Audit API** | Google PageSpeed Insights API (free tier) | 25,000 req/day without key |
| **Screenshots** | ScreenshotOne API | Free tier: 100/month. Falls back to empty string if no key. |
| **PDF** | html2canvas + jsPDF | Client-side generation |
| **Package manager** | npm | `package-lock.json` is the lockfile |
| **Deployment** | Vercel (target) | `serverExternalPackages: ['firebase-admin']` in next.config.ts |
| **Font** | Inter (Google Fonts) | CSS variable: `--font-inter` |

### RAM Constraints
- Dev script: `NODE_OPTIONS='--max-old-space-size=1536'`
- Build script: `NODE_OPTIONS='--max-old-space-size=2048'`
- Do NOT enable Turbopack or `reactCompiler` — they cause system freezes on 8GB RAM.

---

## PROJECT STRUCTURE (SOURCE OF TRUTH)

```
auditdrop/
├── src/
│   ├── app/                       ← Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     ← Google sign-in page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         ← Protected layout (auth guard)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       ← Dashboard home (report list)
│   │   │       ├── new/page.tsx   ← New audit form
│   │   │       └── settings/page.tsx ← Account settings
│   │   ├── r/
│   │   │   └── [reportId]/page.tsx ← Public report page (no auth)
│   │   ├── api/
│   │   │   ├── audit/route.ts     ← POST: run audit
│   │   │   └── report/[reportId]/ ← Report-related API routes
│   │   ├── layout.tsx             ← Root layout (Inter font, dark bg)
│   │   ├── page.tsx               ← Landing page (public)
│   │   └── globals.css            ← Global styles + custom animations
│   ├── components/                ← Flat — all components here
│   │   ├── AuditForm.tsx
│   │   ├── IssueCard.tsx
│   │   ├── PDFReport.tsx
│   │   ├── ReportCard.tsx
│   │   ├── ReportPage.tsx
│   │   └── ScoreDial.tsx
│   ├── hooks/
│   │   ├── useAuth.ts             ← Firebase auth state hook
│   │   └── useReports.ts          ← Firestore real-time reports listener
│   └── lib/
│       ├── firebase.ts            ← Client-side Firebase init (app, auth, db)
│       ├── firebase-admin.ts      ← Server-side Firebase Admin (lazy Proxy pattern)
│       ├── psi.ts                 ← PageSpeed Insights API wrapper
│       ├── scraper.ts             ← Custom HTML checks + SEO checks
│       ├── reportUtils.ts         ← Issue copy, score helpers, verdict generator
│       └── types.ts               ← Shared TypeScript interfaces
├── firestore.rules                ← Firestore security rules
├── firestore.indexes.json         ← Composite index: userId + createdAt
├── .env.example                   ← Environment variable template
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

**Do not create new top-level directories under `src/` without explicit approval.**

---

## CONVENTIONS

### Exports
- **Page and layout components:** `export default` (Next.js App Router requirement).
- **Everything else:** Named exports only. Never default exports on lib, hooks, components, or utilities.

### File Patterns
- **Client components:** Start with `'use client';` directive.
- **Server components:** No directive (default in App Router).
- **API routes:** Export named async functions (`GET`, `POST`, etc.) from `route.ts`.
- **Hooks:** Prefixed with `use`, camelCase (`useAuth`, `useReports`). Always `'use client'`.

### Firebase
- **Client-side:** Import from `@/lib/firebase` → `app`, `auth`, `db`.
- **Server-side (API routes only):** Import from `@/lib/firebase-admin` → `adminDb`, `adminAuth`.
- **Never import `firebase-admin` in client components** — it uses native Node modules (gRPC) that crash the browser bundler.
- Admin SDK uses lazy Proxy pattern — no eager initialization.

### Auth Pattern
- Bearer token in `Authorization` header for API routes.
- Verify with `adminAuth.verifyIdToken(token)` server-side.
- Client-side auth state via `useAuth()` hook.

### Error Handling
- API routes: catch-all try/catch. Return `{ error: string }` with appropriate HTTP status.
- PSI/scraper: graceful fallback to null/empty on failure. Only throw if ALL strategies fail.
- AbortController + timeout on every external fetch (PSI: 45s, scraper: 10s).

### Styling
- Dark mode first. Background: `bg-slate-950` (#020617). Text: `text-white` / `text-slate-400`.
- Accent color: Violet (`violet-400` through `violet-600`). Gradient: `from-violet-400 via-purple-400 to-violet-300`.
- No inline styles. All styling through Tailwind utility classes.
- Custom animations defined in `globals.css`: `shimmer`, `float`, `pulse-glow`, `score-fill`.

### Environment Variables
- Never hardcode. Always `process.env.VARIABLE_NAME`.
- Client-exposed vars prefixed with `NEXT_PUBLIC_`.
- Server-only vars: `FIREBASE_ADMIN_*`, `SCREENSHOTONE_API_KEY`, `PSI_API_KEY`.
- Every env var must have an entry in `.env.example`.
- Guard against placeholder values (`'REPLACE_ME'`, empty strings) before using keys.

### Component Naming
- PascalCase for components (`AuditForm`, `ScoreDial`).
- camelCase for hooks (`useAuth`, `useReports`).
- camelCase for lib modules (`psi.ts`, `scraper.ts`, `reportUtils.ts`).

---

## DATA MODEL (FIRESTORE)

### Collection: `reports`
```
Document: {reportId}  ← 8-char random alphanumeric
  userId: string          ← Firebase UID (owner)
  businessUrl: string
  businessName: string
  screenshotUrl: string
  mobileScore: number
  desktopScore: number | null
  metrics: { fcp, lcp, tbt, cls }  ← display strings from PSI
  checks: { hasPhone, hasClickToCall, hasHttps, hasAnalytics, hasViewport, hasContactForm }
  seoChecks?: { hasMetaTitle, hasMetaDescription, hasH1, hasCanonical, hasStructuredData, hasOpenGraph, titleLength, titleTooLong, titleTooShort }
  competitors?: Array<{ url, businessName, mobileScore, desktopScore, checks, seoChecks }>
  viewCount: number
  lastViewedAt: Timestamp | null
  createdAt: Timestamp
```

### Collection: `users`
```
Document: {uid}
  displayName: string
  ctaUrl: string
  ctaLabel: string
  createdAt: Timestamp
```

### Collection: `reportViews`
```
Document: {auto-id}
  reportId: string
  viewedAt: Timestamp
  userAgent: string
  country: string
```

### Security Rules Summary
- **reports:** Public read (shareable links). Authenticated owner CRUD.
- **users:** Owner-only read/write.
- **reportViews:** Server-side only (admin SDK). Client read/write blocked.

### Composite Index
- `reports`: `userId` ASC + `createdAt` DESC (for dashboard query).

---

## API ROUTES

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/audit` | Required (Bearer token) | Run PSI + scraper + save report to Firestore |
| `GET` | `/api/report/[reportId]/view` | None | Record view event + return report data |

### API Route Conventions
- `maxDuration = 120` on audit route (PSI can be slow).
- Input normalization: auto-prepend `https://` if no protocol.
- URL validation via `new URL()`.
- Competitor URLs: max 2, validated and normalized independently.

---

## KEY ARCHITECTURAL DECISIONS

1. **Firebase Admin lazy Proxy** — `firebase-admin` is never eagerly initialized. `adminDb` and `adminAuth` are Proxy objects that initialize on first property access. This avoids cold-start crashes when env vars aren't loaded yet.

2. **PSI parallel fetch** — Mobile and desktop audits run via `Promise.all`. If one fails, the other still returns data. Only throws if BOTH fail.

3. **Scraper graceful degradation** — All custom checks and SEO checks return `null`/`false` defaults on network failure. Never blocks report creation.

4. **Report IDs** — 8-character random alphanumeric string (not UUID). Non-guessable, URL-friendly.

5. **`serverExternalPackages`** — `firebase-admin` is excluded from client bundle via `next.config.ts`. Without this, the bundler tries to polyfill 200+ Node.js built-ins.

---

## WHAT THIS FILE DOES NOT COVER

Architecture rules, quality gates, communication protocol, debug loop, and global skills are all in `~/GEMINI.md`. This file only carries what is specific to AuditDrop. Do not duplicate global rules here.
