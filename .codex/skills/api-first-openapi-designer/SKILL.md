---
title: API-First OpenAPI Designer Skill
version: v1
last_updated: 2026-05-31
owner: APT
status: stable
---

\# API-First OpenAPI Designer

<!-- Canonical source: .github/skills/api-first-openapi-designer/SKILL.md — sync when updating -->



\## Purpose



Design clear REST API contracts before implementation.



\## Required steps



1\. Inspect existing API routes and docs.

2\. Identify current naming conventions.

3\. Define request and response contracts.

4\. Define error behavior.

5\. Define auth requirements.

6\. Define pagination/filtering/sorting when relevant.

7\. Update OpenAPI or docs if present.

8\. Add or update tests if implementation changes.



\## API rules



\- Prefer resource-oriented REST.

\- Use plural nouns.

\- Use stable IDs.

\- Use ISO 8601 timestamps.

\- Use consistent JSON response shapes.

\- Use structured error responses.

\- Use idempotency for webhooks, imports, and payment-like operations.

\- Avoid breaking changes unless explicitly requested.



\## Output for design-only tasks



Return:



1\. Summary

2\. Endpoint table

3\. Request schema

4\. Response schema

5\. Error schema

6\. Auth model

7\. Test plan

8\. Implementation plan



\## Output for implementation tasks



Return:



1\. Files changed

2\. Contract implemented

3\. Tests added

4\. Validation run

5\. Known limitations

