\# Testing Validation Runner

<!-- Canonical source: .github/skills/testing-validation-runner/SKILL.md — sync when updating -->



\## Purpose



Prove that changes work.



\## Use this skill when



The user asks to:



\- Validate a change

\- Run tests

\- Fix failing tests

\- Prepare a PR

\- Review whether work is complete

\- Confirm a repo builds



\## Command discovery



Before running commands:



1\. Inspect `package.json`.

2\. Identify package manager.

3\. Prefer existing scripts.

4\. Do not invent scripts.



\## Preferred validation order



```bash

pnpm typecheck

pnpm lint

pnpm test

pnpm build



For UI changes:



pnpm test:e2e



For Cloudflare changes:



pnpm wrangler deploy --dry-run

Reporting format



Return:



Check	Command	Result	Notes

Rules

Do not claim success unless commands passed.

If a command was not run, say so.

If a command fails, summarize the error and likely cause.

Apply small fixes when obvious.

Avoid large unrelated refactors.

Add regression tests for bug fixes when practical.

Completion language



Use clear language:



"Passed"

"Failed"

"Not run"

"Blocked"



Do not use vague phrases like "should work" unless validation could not be run.

