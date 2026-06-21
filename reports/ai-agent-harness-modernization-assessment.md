---
title: AI Agent Harness Modernization Assessment
version: v1
last_updated: 2026-06-21
owner: APT
status: draft
---

# AI Agent Harness Modernization Assessment

## Purpose

This assessment records the modernization plan and evidence for extending `apt-principles` into the canonical source of truth for agent harness design, AI orchestration, model routing, token efficiency, verification workflows, security governance, repository lifecycle management, human approval workflows, and local-first AI systems.

This report is planning evidence. Canonical doctrine remains in root doctrine files, especially `ai-agent-framework.md`. Enforceable AI-era rules live in `standards/ai/`. Implementation behavior belongs outside this repository.

## Current-State Assessment

`apt-principles` already has strong foundations:

- Root doctrine covers APT lifecycle, AI participation, security, validation, release, operations, and knowledge.
- `ai-agent-framework.md` defines agent contracts, canonical sources, tool boundaries, fallback behavior, approvals, and the ownership split with `apt-agent-standards`.
- `checklists/ai-agent-review-checklist.md` already covers prompt contracts, tool boundaries, evaluation cases, fallback behavior, and protected actions.
- `references/agent-standards-contract.json` already prevents installer, profile, path-mapping, and managed-file ownership from moving into `apt-principles`.
- Existing validation passes and protects frontmatter, section contracts, links, and required artifacts.

The main limitation was that AI-era guidance was scattered. Harness lifecycle, model routing, token efficiency, local-first execution, and repository lifecycle management were implicit rather than named as standards.

`apt-agent-standards` now acts as the APT Agent implementation repository in this workspace. Its implementation evidence includes harness agents, routing docs, context packs, profile manifests, lifecycle scripts, model-routing files, `.agent-repo/` manifest support, and operator catalogs. Those artifacts should be reviewed against APT Principles, not copied into this repository.

## Gap Analysis

| Theme | Existing Coverage | Gap Closed |
|---|---|---|
| Agent harnesses | Agent contracts and approvals existed. | Added explicit `Discover -> Classify -> Validate -> Remediate -> Verify -> Approve` standard. |
| AI orchestration | Scoped agents existed for repo work. | Added accountable delegation, shared context, handoff, and verification rules. |
| Model routing | Fallback and escalation existed. | Added capability-based, local-first, cost-aware, model-name-neutral routing. |
| Token efficiency | Knowledge reuse and prompt reuse existed. | Added context packs, source maps, excerpting, and context-minimization rules. |
| Security harness design | Security and validation docs existed. | Added detect, validate, remediate, verify, approve pattern for security and governance-sensitive work. |
| Repository lifecycle | Project adoption and agent-standards ownership existed. | Added install, scan, drift detect, repair, synchronize, upgrade, verify lifecycle. |
| Verification | Quality and testing existed. | Added AI-specific verification evidence and residual-risk rules. |
| Local-first AI | Local validation was implied. | Added local-first execution and controlled escalation standard. |
| APT Agent implementation conformance | Ownership contract existed. | Added crosswalk guidance so implementation artifacts can prove standards alignment without becoming doctrine. |

## APT Agent Implementation Crosswalk

| APT Agent layer | Implementation evidence in `apt-agent-standards` | APT Principles standard | Validation evidence | Owning repo | Boundary note |
|---|---|---|---|---|---|
| Orchestration layer | `docs/HARNESS-ARCHITECTURE.md`, `agents/apt-router.md` | `standards/ai/agent-harness-standard.md`, `standards/ai/ai-orchestration-standard.md` | Task packet, stage gates, approval gates | `apt-agent-standards` | `apt-principles` defines stages and evidence only. |
| Role router | `docs/AGENT-CATALOG.md`, `agents/` | `standards/ai/ai-orchestration-standard.md` | Role boundary and handoff review | `apt-agent-standards` | Do not duplicate catalogs in doctrine. |
| Skill router | `docs/SKILL-CATALOG.md`, `codex/skills/`, `github-copilot/prompts/` | `ai-agent-framework.md`, `standards/ai/ai-orchestration-standard.md` | Cross-tool parity and selected skill evidence | `apt-agent-standards` | Tool-native distribution stays implementation-owned. |
| Model router | `routing/model-routing.md`, `routing/model-registry.json`, `scripts/validate-model-routing.mjs` | `standards/ai/model-routing-standard.md`, `standards/ai/local-first-ai-standard.md` | Routing validation and escalation rules | `apt-agent-standards` | Model names are implementation config, not doctrine. |
| Cost controller | `agents/apt-cost-controller.md`, `routing/token-budgeting.md`, `context/` | `standards/ai/token-efficiency-standard.md` | Context-pack and token-budget evidence | `apt-agent-standards` | Doctrine defines sufficient-context rules. |
| Verification layer | `agents/apt-verifier.md`, validation scripts and reports | `standards/ai/verification-standard.md` | Check output, residual risk, approval status | `apt-agent-standards` | Runners and reports stay outside doctrine. |
| Security harness | `agents/apt-security-reviewer.md` | `standards/ai/security-harness-standard.md`, `security.md` | Prompt injection, secret handling, and approval review | `apt-agent-standards` | Security standards stay canonical in `apt-principles`. |
| Install, scan, repair, sync | lifecycle scripts, `.agent-repo/` reports, `agent-repo.manifest.json` | `standards/ai/repository-lifecycle-standard.md` | Dry-run install, scan report, repair plan, sync report | `apt-agent-standards` | Runtime manifests and scripts do not move to doctrine. |

## Updated Principles Map

- `apt-principles.md`: full APT lifecycle and outcome evidence loop.
- `ai-agent-framework.md`: canonical AI doctrine hub for harnesses, orchestration, routing, context, verification, approval, local-first AI, and repository lifecycle ownership.
- `security.md`: canonical security doctrine; extended by the security harness standard.
- `quality-testing.md`: canonical validation doctrine; extended by the AI verification standard.
- `knowledge-system.md`: canonical source-of-truth and drift doctrine; extended by token efficiency and repository lifecycle standards.
- `standards/ai/`: enforceable AI-specific rule sets.
- `checklists/ai-agent-review-checklist.md`: review gate for AI workflows, prompts, agent routing, and lifecycle work.
- `prompts/`: reusable review prompts for harness, routing, and repository lifecycle decisions.
- `examples/`: concrete adaptation patterns that do not redefine doctrine.
- `references/ai-harness-contract.json`: portable stage and ownership contract for future tooling.

## Recommended New Standards

The modernization adds these focused standards:

- `standards/ai/agent-harness-standard.md`
- `standards/ai/ai-orchestration-standard.md`
- `standards/ai/model-routing-standard.md`
- `standards/ai/token-efficiency-standard.md`
- `standards/ai/verification-standard.md`
- `standards/ai/local-first-ai-standard.md`
- `standards/ai/security-harness-standard.md`
- `standards/ai/repository-lifecycle-standard.md`

The standards are intentionally tool-neutral. They define what good looks like and leave implementation mapping to target repositories, APT Agent, and `apt-agent-standards`.

## Recommended Standard Updates

Completed modernization alignment:

- Expanded `ai-agent-framework.md` as the AI-era hub.
- Updated `standards/README.md` to include `standards/ai/`.
- Expanded the AI agent checklist with harness, routing, context, verification, orchestration, and repository lifecycle checks.
- Added review prompts for harness governance, model routing, and repository lifecycle review.
- Added examples for harness flow, routing decisions, context packs, and drift repair.
- Added `references/ai-harness-contract.json` for portable stage, routing, approval, and ownership metadata.
- Added conformance-review guidance for APT Agent implementation reviews.

Future updates should be source-backed and small:

- Add validator enforcement only after the new AI standards stabilize.
- Coordinate with `apt-agent-standards` only when installed files or cross-tool parity need updates.
- Add APT Agent implementation docs in the future implementation repo, not here.

## New Repository Structure

```text
standards/
  ai/
    agent-harness-standard.md
    ai-orchestration-standard.md
    model-routing-standard.md
    token-efficiency-standard.md
    verification-standard.md
    local-first-ai-standard.md
    security-harness-standard.md
    repository-lifecycle-standard.md

examples/
  ai-agent/
    agent-harness-flow-example.md
    apt-agent-standards-crosswalk-example.md
    model-routing-decision-example.md
    token-efficient-context-pack-example.md
  workflows/
    repository-drift-repair-flow.md

prompts/
  apt-agent-conformance-review-prompt.md
  agent-harness-review-prompt.md
  model-routing-review-prompt.md
  repository-lifecycle-review-prompt.md

references/
  ai-harness-contract.json
```

## Migration Roadmap

1. Stabilize doctrine and standards in `apt-principles`.
2. Run `npm run validate` after each change set.
3. Review whether `apt-agent-standards` needs updates to installed Copilot, Codex, Claude, or `AGENTS.md` surfaces.
4. Use dry-run install and sync from `apt-agent-standards` before modifying target repositories.
5. Add APT Agent implementation plans in the APT Agent repository, using these standards as requirements.
6. Revisit validator enforcement after teams have used the AI standards in at least one real repo lifecycle pass.

## Risks And Tradeoffs

- More standards can create perceived complexity. Mitigation: keep `ai-agent-framework.md` as the hub and standards as focused rule sets.
- Routing guidance can go stale if tied to model names. Mitigation: use capability tiers and local implementation mapping.
- Token efficiency can become under-contexting. Mitigation: require sufficient context and verification evidence.
- Repository lifecycle automation can overwrite local context. Mitigation: preserve the `apt-principles`, `apt-agent-standards`, and target-repo ownership split.
- Security harnesses can become ceremony for low-risk work. Mitigation: keep stages lightweight when risk is low and strict when risk is high.

## APT Agent Blueprint Guidance

APT Agent should consume these standards as implementation requirements. Recommended modules:

- discovery collector
- task and risk classifier
- context-pack loader
- model-routing policy engine
- local-first execution planner
- remediation planner
- verification runner
- approval gate
- orchestration handoff ledger
- repository lifecycle scanner
- drift repair planner

APT Agent should not redefine doctrine. It should read `apt-principles`, use `apt-agent-standards` for distribution workflows where appropriate, protect target-owned project context, and produce reviewable evidence for every lifecycle stage.

APT Agent conformance reviews should use a crosswalk rather than copied implementation docs. Required columns are implementation layer, implementation artifact, APT Principles standard, validation evidence, owning repository, and boundary notes. The portable field names live in `references/ai-harness-contract.json`.

## Validation

Acceptance criteria for this modernization:

- `npm run validate` passes.
- `ai-agent-framework.md` remains the canonical AI doctrine hub.
- New AI standards are linked from `standards/README.md`.
- Checklists, prompts, examples, and references link to standards without duplicating them as competing doctrine.
- Implementation guidance is blueprint-level and clearly outside `apt-principles` ownership.
- APT Agent implementation reviews can cite `prompts/apt-agent-conformance-review-prompt.md` and `examples/ai-agent/apt-agent-standards-crosswalk-example.md`.
