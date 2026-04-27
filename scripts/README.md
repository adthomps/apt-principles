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

## Validation Scope

The validator ignores an optional `archive/` folder if one is temporarily reintroduced. Historical files are not active doctrine and are currently kept outside this package.

Active `references/` files are parsed as JSON and are treated as portable governance contracts. Downstream projects may keep local copies under `docs/apt/references/` when they use copy or sync adoption modes.
