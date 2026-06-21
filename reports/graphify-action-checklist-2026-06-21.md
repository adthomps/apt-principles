---
title: Graphify Action Checklist 2026-06-21
version: v1
last_updated: 2026-06-21
owner: APT
status: draft
source_report: reports/graphify-apt-gap-analysis-2026-06-21.md
---

# Graphify Action Checklist 2026-06-21

Source evidence: reports/graphify-apt-gap-analysis-2026-06-21.md

Use this checklist to track remediation without rerunning Graphify extraction.

## Global Governance

- [ ] Mark this run as provisional evidence because graph hygiene warning is present.
- [ ] Use project-profile-validation-sweep-2026-06-13.md as the primary action source for remediation intake.
- [ ] Keep doctrine updates in apt-principles source-backed only.
- [ ] After remediation changes, run deterministic validation and project-profile sweep before closure.

## applied-practical-thinking

- [ ] Update docs/apt/adoption.md and docs/apt/project-profile.md when architecture, validation flow, or maturity posture changes.
- [ ] Keep docs/apt/references/project-profile.json schema-compatible and validated in CI.
- [ ] Add a short AI adoption note covering prompt ownership, worker route boundaries, and human-review expectations.

## apt-dream-to-reality

- [ ] Create docs/apt/adoption.md with adoption mode, canonical source, validation commands, and local exceptions.
- [ ] Create docs/apt/project-profile.md describing Dream to Reality as an APT planning and spec workflow example.
- [ ] Resolve prompt canonicality by choosing one source of truth and aligning versions.

## apt-novel-reviewer

- [ ] Add a desktop release and operations note covering packaging, native dependency support, and Ollama runtime prerequisites.
- [ ] Add a small smoke or integration test layer for desktop UI and packaging-critical flows.
- [ ] Refresh the local audit after CI has hosted runs and packaging documentation is complete.

## apt-payment-rpc-api

- [ ] Create or update the local adoption and project-profile evidence layer.

## Execution Evidence

- [ ] Record links to merged remediation PRs.
- [ ] Record validation outputs for each affected repository.
- [ ] Record closure date and reviewer sign-off.
