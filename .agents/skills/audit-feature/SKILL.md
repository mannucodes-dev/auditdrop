---
name: audit-feature
description: >-
  Scaffolds a new audit check end to end: type definition in types.ts, check logic
  in the appropriate lib module, rendering in ReportPage, and Zod validation schema.
  Use when adding a new audit check, metric, or analysis feature to the report.
---

# Audit Feature Scaffolding

## Overview

This skill guides the creation of a new audit check from type definition through
rendering, ensuring consistency with the existing AuditDrop architecture.

## Workflow

### Step 1 — Define the Type

1. Open `src/lib/types.ts`.
2. Add the new check interface or extend an existing one.
3. If adding to an existing interface (e.g., `SeoChecks`), make the field **optional**
   with `?` to maintain backward compatibility — existing reports without this field
   must still render.
4. Export the type via named export.

### Step 2 — Implement the Logic

1. Identify the correct module:
   - `src/lib/psi.ts` — for PageSpeed Insights / Lighthouse data
   - `src/lib/scraper.ts` — for custom HTML checks and SEO checks
   - `src/lib/gbp.ts` — for Google Business Profile checks (if exists)
   - `src/lib/reportUtils.ts` — for computed/derived values and display helpers
2. Add the check function with proper error handling:
   - Return `null` or `false` on failure (graceful degradation)
   - Use AbortController + timeout on any external fetch
   - Add JSDoc with `@param` and `@returns`
3. Wire the new check into the audit pipeline (in the API route or the calling module).

### Step 3 — Add Zod Validation

1. Create or extend the Zod schema for the new check data.
2. Schema must match the TypeScript interface exactly.
3. Use `z.optional()` for fields that may not exist on older reports.

### Step 4 — Render in ReportPage

1. Open `src/components/ReportPage.tsx`.
2. Add a section for the new check, following the existing card pattern.
3. Use design tokens from `src/styles/tokens.ts` — never hardcode colors.
4. Handle the `null` / `undefined` case gracefully (skip section or show placeholder).

### Step 5 — Verify

1. Run `npx tsc --noEmit` — must exit with zero errors.
2. Load a test report that **does not** have the new field → should render without crash.
3. Load a test report that **does** have the new field → should display correctly.

## Common Mistakes

- Making a new field required instead of optional — breaks backward compatibility.
- Hardcoding colors instead of using design tokens.
- Forgetting AbortController timeout on external fetches.
- Not adding Zod validation for the API route input.
