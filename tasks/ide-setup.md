# AuditDrop — Antigravity IDE Configuration Plan

> **Scope:** Config-only. ZERO changes to `/src` application code.
> **Project root:** `/Users/manishyadav/Downloads/Audit Drop/auditdrop/`

---

## User Review Required

> [!IMPORTANT]
> **Next.js Version Discrepancy:** Your request says "Next.js 14" but `package.json` shows **Next.js 16.2.6** and `GEMINI.md` says "Next.js 16 (App Router)". I will use **Next.js 16** as the source of truth (matching what's actually installed). Please confirm.

> [!WARNING]
> **Stale Config Files:** The parent directory has two outdated files:
> - `GEMINI_PROJECT.md` — references Supabase/pnpm/Next.js 14 (all wrong for current project)
> - `GEMINI_GLOBAL.md` — still useful as global architect context
>
> Should I leave these untouched, or clean up `GEMINI_PROJECT.md` to match reality?

> [!IMPORTANT]
> **AGENTS.md Strategy:** An `AGENTS.md` already exists with auto-generated Next.js agent rules (6 lines). I will **preserve the Next.js rules block** and append the full operating philosophy below it, so both coexist.

> [!IMPORTANT]
> **`styles/tokens.ts` Reference:** Your request mentions "design tokens from `styles/tokens.ts` — never hardcode colors." I confirmed this file exists at `src/styles/tokens.ts`. The design-token skill will reference it.

---

## Open Questions

> [!IMPORTANT]
> **GitHub MCP Server:** The old `@modelcontextprotocol/server-github` npm package is **deprecated** (April 2025). Two current options:
> 1. **Remote hosted server** — `https://api.githubcopilot.com/mcp/` (OAuth-based, no token management, recommended by GitHub)
> 2. **Local Go binary** — download from [github/github-mcp-server](https://github.com/github/github-mcp-server) releases, requires a PAT
>
> **Which do you prefer?** I'll default to **Option 2 (local binary)** since it works offline and gives you full control. You'd need to download the binary and provide a GitHub PAT.

> [!IMPORTANT]
> **Context7 API Key:** Free tier works without a key (rate-limited). A free key from [context7.com/dashboard](https://context7.com/dashboard) removes limits. Do you want to use it keyless for now, or provide a key?

---

## Proposed Changes

### Part A: MCP Servers

#### What each server gives you:

| # | Server | One-Line Value |
|---|--------|---------------|
| 1 | **Context7** | Live, version-pinned docs for Next.js, Tailwind v4, Firebase, Zod — eliminates hallucinated/outdated API calls |
| 2 | **Playwright MCP** | Browser automation: agent can open your running app, click through flows, screenshot, and verify changes visually |
| 3 | **Firecrawl MCP** | Web scraping/research: agent can crawl competitor sites, extract audit report data, pull reference content |
| 4 | **GitHub MCP** | Read/write GitHub issues, PRs, branches, code search directly from agent conversations |
| 5 | **Filesystem MCP** | Scoped file read/write/search within project directory — structured file operations beyond basic editor access |
| 6 | **Sequential Thinking** | Structured multi-step reasoning tool — agent can break complex problems into explicit thought chains |

#### [MODIFY] [mcp_config.json](file:///Users/manishyadav/.gemini/config/mcp_config.json)

Currently empty. Will be populated with all 6 servers. The format is:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "<<ASK_USER>>"
      }
    },
    "github": {
      "command": "/usr/local/bin/github-mcp-server",
      "args": ["stdio"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<<ASK_USER>>"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/manishyadav/Downloads/Audit Drop/auditdrop"
      ],
      "env": {}
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    }
  }
}
```

**Notes:**
- Antigravity reads MCP config from `~/.gemini/config/mcp_config.json` (global, shared across IDE/CLI/Desktop)
- Format verified: `mcpServers` → `{ command, args, env }` for stdio servers
- For remote HTTP servers Antigravity uses `serverUrl` key, but all 6 above are stdio
- GitHub MCP requires downloading the Go binary first (see verification section)
- Filesystem is scoped to project directory only — no access outside `auditdrop/`

---

### Part B: AGENTS.md

#### [MODIFY] [AGENTS.md](file:///Users/manishyadav/Downloads/Audit%20Drop/auditdrop/AGENTS.md)

Preserve the existing Next.js agent rules block. Append comprehensive operating philosophy below it, organized into these sections:

1. **Workflow Orchestration** — Plan mode default, verification-before-done, self-improvement loop, demand elegance, autonomous bug fixing
2. **Task Management** — Plan → Track → Document → Capture Lessons workflow
3. **Core Principles** — Simplicity first, no laziness, minimal impact
4. **Project-Specific Guardrails (AuditDrop)** — Stack truth, hard invariants (SSRF validation, Zod schemas, rate limiting, safeError(), security headers, embed quotas, Firestore rules), authFetch() requirement, design tokens, audit engine backward compatibility
5. **Verification Protocol** — `npx tsc --noEmit` must stay zero errors, dev server smoke test, Playwright click-through when relevant
6. **File References** — Points to `tasks/todo.md`, `tasks/lessons.md`

**Key adaptation from CLAUDE.md philosophy → Antigravity conventions:**
- References Antigravity's native plan mode and subagent capabilities
- Uses `tasks/todo.md` and `tasks/lessons.md` (not Antigravity's built-in artifact paths)
- Integrates with MCP servers (e.g., "use Playwright MCP to verify" instead of generic "check visually")

---

### Part C: Project Skills

#### [NEW] `.agents/skills/` directory structure

```
auditdrop/.agents/
└── skills/
    ├── audit-feature/
    │   └── SKILL.md
    ├── design-token/
    │   └── SKILL.md
    └── ship-check/
        └── SKILL.md
```

#### [NEW] `audit-feature/SKILL.md`

**Trigger:** Scaffolding a new audit check end to end.

**What it does:**
1. Add the new check type to `src/lib/types.ts`
2. Implement check logic in the appropriate `src/lib/` module (psi.ts, scraper.ts, gbp.ts, or reportUtils.ts)
3. Add rendering in `src/components/ReportPage.tsx`
4. Add Zod validation schema for the new check data
5. Ensure backward compatibility — existing reports without the new field must still render

#### [NEW] `design-token/SKILL.md`

**Trigger:** Adding or using design tokens / colors / spacing.

**What it does:**
1. Defines tokens in `src/styles/tokens.ts` using the existing pattern
2. Registers as Tailwind v4 `@theme` tokens where applicable
3. Never hardcodes color values, spacing, or typography — always references tokens
4. Documents the token in the file's JSDoc

#### [NEW] `ship-check/SKILL.md`

**Trigger:** Before declaring any task complete.

**What it does:**
1. Run `npx tsc --noEmit` — must exit zero errors
2. Run `npm run lint` — must exit zero warnings in modified files
3. Start dev server, confirm it boots without crash
4. If UI-facing changes, use Playwright MCP to open `http://localhost:3000`, navigate to affected pages, and visually confirm behavior
5. Report results in structured format: ✅ / ❌ for each gate

---

## Verification Plan

### Automated Checks (post-execution)

| Step | Command / Action | Expected Result |
|------|-----------------|-----------------|
| 1 | `cat ~/.gemini/config/mcp_config.json \| python3 -m json.tool` | Valid JSON, 6 servers |
| 2 | `cat auditdrop/AGENTS.md \| wc -l` | >50 lines (was 6) |
| 3 | `ls auditdrop/.agents/skills/*/SKILL.md` | 3 SKILL.md files |
| 4 | `head -5 auditdrop/.agents/skills/audit-feature/SKILL.md` | Valid YAML frontmatter |
| 5 | Restart Antigravity IDE and check MCP panel | All 6 servers listed |

### Manual Verification (by you)

1. Open Antigravity IDE → Settings → MCP → verify servers appear
2. In a new conversation, type "list your skills" → should show audit-feature, design-token, ship-check
3. Replace `<<ASK_USER>>` placeholders with real keys and verify Firecrawl + GitHub connect

---

## Keys I Need From You

| Key | Where to Get It | Used By |
|-----|----------------|---------|
| `FIRECRAWL_API_KEY` | [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys) | Firecrawl MCP — web scraping |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | [GitHub Developer Settings](https://github.com/settings/tokens) — needs `repo`, `issues`, `pull_requests` scopes | GitHub MCP — repo operations |
| **GitHub MCP binary** | Download from [github/github-mcp-server releases](https://github.com/github/github-mcp-server/releases) → `darwin-arm64` build → place at `/usr/local/bin/github-mcp-server` | GitHub MCP server |
| `CONTEXT7_API_KEY` *(optional)* | [context7.com/dashboard](https://context7.com/dashboard) — free, removes rate limits | Context7 MCP — live docs |

---

## Execution Checklist

- [ ] Write `~/.gemini/config/mcp_config.json` with all 6 MCP servers
- [ ] Expand `auditdrop/AGENTS.md` with full operating philosophy (preserving Next.js rules)
- [ ] Create `auditdrop/.agents/skills/audit-feature/SKILL.md`
- [ ] Create `auditdrop/.agents/skills/design-token/SKILL.md`
- [ ] Create `auditdrop/.agents/skills/ship-check/SKILL.md`
- [ ] Create `auditdrop/tasks/lessons.md` (empty starter)
- [ ] Create `auditdrop/tasks/todo.md` (empty starter)
- [ ] Validate JSON syntax of mcp_config.json
- [ ] Validate YAML frontmatter of all 3 SKILL.md files
- [ ] Verify no `/src` files were touched
