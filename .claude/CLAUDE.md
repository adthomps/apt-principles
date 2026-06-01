# CLAUDE.md

Refer to:

- /AGENTS.md
- /design.md
- /architecture.md

These files define repository standards and must be followed.

## Repo type

This is the canonical APT (Applied Practical Thinking) **documentation and doctrine repository**.

It contains no application code, no Cloudflare Workers, no React frontend, and no pnpm workspace.

## Package manager

npm (not pnpm). Run scripts with `npm run <script>`.

## Key validation commands

```
npm run validate              # Structure, frontmatter, and contract checks
npm run run-all-checks        # Full check suite including sibling repo sweeps
npm run sweep:project-profiles # Validate all workspace project profiles
npm run graphify:check        # Verify Graphify CLI and repo readiness
npm run graphify:apt          # Build APT knowledge graph
npm run graphify:gaps         # Query graph and write gap report
```

## Working rules

1. Read AGENTS.md before making changes — it defines agent routing and working rules.
2. Prefer small, focused changes. Do not rewrite working files unless the task requires it.
3. Do not remove files unless the reason is clearly documented.
4. Preserve required frontmatter on all docs: title, version, last_updated, owner, status.
5. Link to canonical sources; do not duplicate doctrine text.
6. Run `npm run validate` after any structural or frontmatter changes.

## Active agents for this repo

The doctrine-maintenance agents in `.github/agents/` are the active agents for this repo:

- APT Read-Only Auditor — gap analysis and coverage audits
- APT Principles Maintainer — synchronized cross-framework changes
- APT Checklist Synchronizer — checklist-only synchronization
- APT Prompt Curator — prompt quality and alignment
- APT Docs Maintainer — docs/, governance/, templates/, examples/
- APT Security Reviewer — security doctrine and checklist
- APT API Architect — API standards doctrine and checklist
- APT Frontend Implementer — design doctrine and tokens
- APT Test Engineer — quality/testing doctrine and checklist

## Template configurations (not active for this repo)

`.claude/agents/` and `.claude/skills/` contain **product-repo template configurations** for downstream projects that use Claude Code. These are meant to be copied into downstream repos and adapted — they are not active configurations for apt-principles itself.

See `templates/ARCHITECTURE.md` for the full downstream project template layout.
