<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AuditDrop — Agent Operating Manual

> This file governs how AI agents operate on the AuditDrop codebase.
> It applies universally across IDEs (Antigravity, Claude, Cursor, etc.).
> For project-specific context (stack, data model, conventions), see `GEMINI.md`.

---

## Workflow Orchestration

### Plan Mode Default

Enter plan mode for **any non-trivial task** — defined as 3+ steps, architectural
decisions, or changes touching more than two files. Write a detailed spec to
`tasks/todo.md` with checkable items before writing any code.

If something goes sideways mid-execution, **STOP and re-plan** rather than pushing
through with patches. Update `tasks/todo.md` with the revised approach.

For simple, obvious fixes (typo, single-line bug, formatting) — just do it. Don't
over-plan trivial work.

### Verification Before Done

Never mark a task complete without proving it works:

1. **TypeScript gate:** Run `npx tsc --noEmit`. Must stay **ZERO errors**. This is
   the project's non-negotiable standard.
2. **Lint gate:** Run `npm run lint`. Zero warnings in modified files.
3. **Dev server gate:** Start with `npm run dev`, confirm it boots without crash.
4. **Visual gate (UI changes):** Use Playwright MCP to open the running app, navigate
   to affected pages, and confirm behavior visually.
5. **Diff check:** Compare behavior between main and your changes. Ask yourself:
   *"Would a senior FAANG engineer approve this?"*

If any gate fails, fix it before declaring completion.

### Self-Improvement Loop

After **any correction** from the user:
1. Understand what went wrong and why.
2. Append the lesson to `tasks/lessons.md` with the date, what happened, and a
   concrete rule that prevents repeating it.
3. Follow that rule going forward.

### Demand Elegance (Balanced)

For non-trivial changes, pause and ask: *"Is there a more elegant way to do this?"*
Consider readability, maintainability, and consistency with the existing codebase.

But for simple, obvious fixes — don't over-engineer. A one-line fix doesn't need a
new abstraction layer.

### Autonomous Bug Fixing

Given a bug report, just fix it. The workflow is:
1. Reproduce — point at logs, errors, failing tests.
2. Diagnose — identify root cause, not symptoms.
3. Fix — address the root cause.
4. Verify — run the ship-check skill (all gates).
5. Report — concise summary of what was wrong and what was fixed.

Zero hand-holding. Don't ask "should I fix this?" — fix it and show the result.

---

## Task Management

| Phase | Action | Where |
|-------|--------|-------|
| **Plan** | Write checkable task items | `tasks/todo.md` |
| **Track** | Mark items `[/]` in progress, `[x]` complete | `tasks/todo.md` |
| **Document** | Add a review section when sprint completes | `tasks/todo.md` |
| **Learn** | Append lessons after corrections | `tasks/lessons.md` |

---

## Core Principles

### Simplicity First
Every change should be as simple as possible. Prefer the solution with the smallest
blast radius. Don't introduce abstractions until there's a concrete need.

### No Laziness
Find root causes, not symptoms. No temporary patches, no "TODO: fix later" comments,
no copy-paste duplication. Apply senior-developer standards to every change.

### Minimal Impact
Changes touch only what's necessary. Never introduce regressions. **NEVER break the
running app** — this project is mid-build and actively deployed.

### No Source Code Changes Without Context
If a task is config-only, infrastructure-only, or documentation-only, do NOT touch
files under `/src` without explicit approval.

---

## Project-Specific Guardrails — AuditDrop

### Stack Truth (Source of Record)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript — `strict: true` |
| Styling | Tailwind CSS v4 — `@theme` tokens |
| Auth + DB | Firebase (Client + Admin SDK), Firestore |
| Animations | Framer Motion |
| Validation | Zod v4 on all API routes |
| Deployment | Vercel |
| Package Manager | npm |

### Hard Invariants — Do NOT Break

These systems are load-bearing. Any change that weakens them requires explicit user
approval with a documented rationale:

- **SSRF URL validation** — All user-provided URLs are validated via `new URL()` with
  protocol checks before any server-side fetch.
- **Zod input validation** — Every API route validates input with Zod. No unvalidated
  user input reaches business logic.
- **Sliding-window rate limiting** — Protects API routes from abuse. Do not remove or
  weaken rate limit checks.
- **`safeError()`** — Production error responses never leak stack traces. Always use
  the safe error wrapper.
- **Security headers** — Defined in `next.config.ts`. Do not remove CSP, HSTS, or
  other security headers.
- **Embed quota counters** — Track and enforce usage limits. Do not bypass.
- **Firestore security rules** — Owner-only access on private collections. Never
  weaken rules in `firestore.rules`.

### Mandatory Patterns

- **`authFetch()`** — Use for all authenticated client → API calls. Never use raw
  `fetch()` for authenticated endpoints.
- **Design tokens** — All visual values come from `src/styles/tokens.ts` and the
  `@theme` block in `globals.css`. Never hardcode hex colors, pixel values, or font
  names directly in components.
- **Audit engine backward compatibility** — The modules `psi.ts`, `scraper.ts`,
  `gbp.ts`, and `reportUtils.ts` must remain backward-compatible. New fields are
  always optional (`?`). Existing reports must render without the new fields.

### Design Philosophy

AuditDrop is a **branded professional tool**, not a generic dark SaaS template.
Every UI decision should reinforce this identity:

- **Professional** — like a premium analytics platform (think: Linear, Vercel Dashboard)
- **Feature-rich** — dense with actionable data, not sparse placeholder screens
- **Branded** — violet accent (#7C3AED) is the identity. The UI should not be
  interchangeable with any generic dark-mode app.
- **Alive** — micro-interactions make it feel responsive: hover effects, score
  animations, shimmer CTAs, smooth transitions via Framer Motion.
- **Premium effects** — use the existing CSS utilities: `glass-card`, `gradient-border`,
  `shimmer-btn`, `grid-bg`, `noise-bg`, `hero-gradient` where appropriate.

### RAM Constraints

This project runs on an 8GB machine:
- Dev: `NODE_OPTIONS='--max-old-space-size=1536'`
- Build: `NODE_OPTIONS='--max-old-space-size=2048'`
- **Never** enable Turbopack or `reactCompiler` — they cause system freezes.

---

## MCP Server Capabilities

These MCP servers are available and should be used when relevant:

| Server | Use For |
|--------|---------|
| **Context7** | Look up current, version-accurate docs for Next.js, Tailwind v4, Firebase, Zod |
| **Playwright** | Visual verification — open the running app, click through, screenshot |
| **Firecrawl** | Scrape competitor sites, pull reference data for audit features |
| **Filesystem** | Structured file operations scoped to project directory |
| **Sequential Thinking** | Break complex problems into explicit multi-step reasoning |
| **GitHub** | Read/write issues, PRs, branches, code search |

---

## File Map

| File | Purpose |
|------|---------|
| `GEMINI.md` | Project-specific context: stack, structure, conventions, data model |
| `AGENTS.md` | This file — agent operating manual |
| `tasks/todo.md` | Current sprint task tracker |
| `tasks/lessons.md` | Lessons learned from corrections |
| `tasks/ide-setup.md` | IDE configuration plan |
| `.agents/skills/` | Reusable skill instructions |
| `firestore.rules` | Firestore security rules (treat as critical) |
| `src/styles/tokens.ts` | Design token definitions |
| `src/app/globals.css` | CSS custom properties + premium effects |
