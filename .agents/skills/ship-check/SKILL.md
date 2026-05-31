---
name: ship-check
description: >-
  Pre-ship verification gate. Runs tsc --noEmit, lint, dev-server smoke test,
  and Playwright click-through before declaring any task complete. Use this
  skill before marking ANY task as done.
---

# Ship Check — Pre-Completion Verification

## Overview

No task is complete until it passes ALL gates below. Run this checklist before
marking any task as ✅ COMPLETE.

## Gate 1 — TypeScript Compilation

```bash
npx tsc --noEmit
```

- **Must exit with zero errors.** This is the project's #1 invariant.
- If errors exist, fix them before proceeding. Do not skip or suppress.
- Note: the project uses `strict: true` with ES2017 target.

## Gate 2 — Lint

```bash
npm run lint
```

- Zero warnings in modified files.
- The project uses `eslint-config-next` with flat config (`eslint.config.mjs`).

## Gate 3 — Dev Server Smoke Test

```bash
npm run dev
```

- Server must start without crash.
- Wait for the "Ready" message.
- If it crashes on startup, investigate and fix before proceeding.
- Note: dev server uses `NODE_OPTIONS='--max-old-space-size=1536'` for 8GB RAM constraint.

## Gate 4 — Visual Verification (UI changes only)

If the task involved **any UI-facing changes** (components, styling, layout):

1. Use Playwright MCP to open `http://localhost:3000`.
2. Navigate to the affected page(s):
   - Landing page: `/`
   - Login: `/login`
   - Dashboard: `/dashboard`
   - New audit: `/dashboard/new`
   - Public report: `/r/[reportId]`
3. Verify:
   - Page renders without console errors
   - Layout is not broken
   - Interactive elements respond (buttons, links, forms)
   - Animations play correctly
4. Take a screenshot as proof.

## Gate 5 — Backward Compatibility

If the task modified:
- **Types:** Existing data must still parse correctly
- **API routes:** Existing clients must still work
- **Firestore schema:** Existing documents must still read correctly
- **Components:** Existing props must still be accepted

## Report Format

After running all gates, report results:

```
SHIP CHECK RESULTS
─────────────────────────────
✅ TypeScript   : 0 errors
✅ Lint         : 0 warnings
✅ Dev Server   : Ready in Xs
✅ Visual       : [screenshot or N/A]
✅ Compat       : No breaking changes
─────────────────────────────
VERDICT: SHIP IT ✅
```

Or if any gate fails:

```
SHIP CHECK RESULTS
─────────────────────────────
✅ TypeScript   : 0 errors
❌ Lint         : 2 warnings in AuditForm.tsx
⏸️ Dev Server   : Blocked on lint
⏸️ Visual       : Blocked
⏸️ Compat       : Blocked
─────────────────────────────
VERDICT: FIX REQUIRED ❌
BLOCKER: [description]
```

## Common Mistakes

- Skipping Gate 4 for "minor" CSS changes that actually break layout.
- Running tsc but ignoring the output.
- Not testing backward compatibility when adding optional fields.
