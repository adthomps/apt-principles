---
title: Testing Validation Runner Skill
version: v1
last_updated: 2026-05-31
owner: APT
status: stable
---

\# Testing Validation Runner

<!-- Canonical source: .github/skills/testing-validation-runner/SKILL.md — sync when updating -->



\## Purpose



Validate repo changes using the project's existing scripts.



\## Required steps



1\. Inspect `package.json`.

2\. Identify package manager.

3\. Run relevant validation commands.

4\. Fix small obvious failures.

5\. Do not hide failures.

6\. Report results clearly.



\## Preferred commands



```bash

pnpm typecheck

pnpm lint

pnpm test

pnpm build



For UI:



pnpm test:e2e



For Cloudflare:



pnpm wrangler deploy --dry-run

Rules

Do not claim success if checks failed.

Do not claim checks were run if they were not.

Do not add snapshot churn unless necessary.

Add regression tests for bug fixes when practical.

Final report

Command	Result	Notes



Then list:



Fixes applied

Remaining failures

Remaining risk

