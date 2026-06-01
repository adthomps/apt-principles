---
title: Cloudflare Hono Worker Builder Skill
version: v1
last_updated: 2026-05-31
owner: APT
status: stable
---

\# Cloudflare Hono Worker Builder

<!-- Canonical source: .github/skills/cloudflare-hono-worker-builder/SKILL.md — sync when updating -->



\## Purpose



Help Codex safely implement Cloudflare Worker changes using Hono and the repo's existing conventions.



\## Required steps



1\. Inspect existing Worker entrypoint.

2\. Inspect routing conventions.

3\. Inspect environment bindings.

4\. Identify whether the change requires D1, KV, R2, or external APIs.

5\. Implement the smallest safe change.

6\. Add or update tests.

7\. Update docs if behavior changes.

8\. Run validation.



\## Preferred structure



```text

src/

&#x20; index.ts

&#x20; routes/

&#x20; middleware/

&#x20; services/

&#x20; repositories/

&#x20; schemas/

&#x20; types/

Rules

Use /api for dynamic routes.

Do not put large business logic in route handlers.

Validate all inputs.

Return consistent JSON errors.

Use typed bindings.

Do not hardcode secrets.

Do not add dependencies unless justified.

Validation



Run available commands from package.json.



Preferred:



pnpm typecheck

pnpm test

pnpm build



Cloudflare:



pnpm wrangler deploy --dry-run

Completion report



Return:



What changed

Why it changed

Files changed

Tests added

Commands run

Remaining risks

