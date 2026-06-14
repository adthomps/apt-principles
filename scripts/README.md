---
title: APT Principles Validation Scripts
version: v1
last_updated: 2026-04-24
owner: APT
status: draft
---

# APT Principles Validation Scripts

This folder contains lightweight, dependency-free validation for an APT doctrine and build-kit folder.

## Local Usage

From the workspace root:

```bash
npm --prefix apt-principles run validate
```

From inside `apt-principles`:

```bash
npm run validate
npm run run-all-checks
```

`run-all-checks` runs canonical validation, the project-profile sweep, and selected sibling repo quality commands (`lint`, `typecheck`, `test`) before printing a compact pass/fail summary.

Graphify workspace commands:

```bash
npm run graphify:check
npm run graphify:apt
npm run graphify:gaps
```

See `reports/GRAPHIFY_RUNBOOK.md` for setup, privacy boundaries, and output policy.

## CLI Options

```bash
node scripts/validate-apt-principles.mjs --root .
node scripts/validate-apt-principles.mjs --json
node scripts/validate-apt-principles.mjs --report reports/apt-principles-validation.md
```

## Portable Project Pattern

To use this in another APT project such as `apt-coach` or `apt-dream-to-reality`:

1. Copy `scripts/validate-apt-principles.mjs` into that project.
2. Adjust the configuration constants at the top of the script:
   - required top-level Markdown docs
   - required folders
   - required reference files
   - section contracts
3. Add a package script:

```json
{
  "scripts": {
    "validate:principles": "node scripts/validate-apt-principles.mjs --root docs/principles"
  }
}
```

## AI Readiness Validation

`validate-ai-readiness.mjs` checks whether a project has the files and configuration needed for AI-assisted work. It scores the repo 0-4 against the APT AI Agent Readiness dimension and can scaffold GitHub-oriented files from apt-principles templates.

The script lives in `apt-principles` and is **always run from `apt-principles`**. Use `--repo-root` to point at a downstream project.

```bash
# Validate this repo (run from apt-principles)
npm run validate:ai

# Validate a downstream project (run from apt-principles, target with --repo-root)
node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach

# JSON output
node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach --json

# Write Markdown report to the target repo's docs/apt/reports/
node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach --report

# Scaffold GitHub-oriented readiness files into the target repo from apt-principles templates
node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach --fix
```

If you are already inside a downstream repo and do not want to change directories:

```bash
# From inside apt-coach (Windows):
node ..\apt-principles\scripts\validate-ai-readiness.mjs --repo-root .
node ..\apt-principles\scripts\validate-ai-readiness.mjs --repo-root . --fix
```

Scores:

| Score | Label | What's required |
|-------|-------|----------------|
| 0 | None | Nothing AI-related found |
| 1 | Minimal | AGENTS.md with content |
| 2 | Configured | + copilot-instructions.md + .github/agents/ with ≥1 agent |
| 3 | Active | + at least 3 domain agents, skills, prompts, and APT adoption context |
| 4 | Optimizing | + valid agent frontmatter and an agent standards contract or manifest |

`--fix` copies GitHub-oriented templates from apt-principles into the target project. It never overwrites existing files. Requires `--repo-root` (refuses to scaffold into apt-principles itself). Use the sibling `apt-agent-standards` repo for Claude, Codex, Copilot, `.agent-standards.json`, and `docs/project-context.md` distribution.

## Validation Scope

The validator ignores an optional `archive/` folder if one is temporarily reintroduced. Historical files are not active doctrine and are currently kept outside this package.

Active `references/` files are parsed as JSON and are treated as portable governance contracts. Downstream projects may keep local copies under `docs/apt/references/` when they use copy or sync adoption modes.
