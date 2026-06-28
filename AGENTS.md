---
title: APT Agent Working Rules
version: v1
last_updated: 2026-06-22
owner: APT
status: stable
---

# AGENTS

Purpose: help coding agents work productively in this repository without duplicating doctrine.

## Scope Of This Repo

This repository is the canonical APT doctrine and build kit.

Read first:
- [README.md](README.md)
- [apt-principles.md](apt-principles.md)
- [ai-agent-framework.md](ai-agent-framework.md)

Canonical doctrine docs (root):
- [thinking.md](thinking.md)
- [design.md](design.md)
- [architecture.md](architecture.md)
- [system-standards.md](system-standards.md)
- [security.md](security.md)
- [execution.md](execution.md)
- [quality-testing.md](quality-testing.md)
- [release-change-management.md](release-change-management.md)
- [operations-support.md](operations-support.md)
- [knowledge-system.md](knowledge-system.md)

Build-kit folders:
- [checklists/](checklists/)
- [context-packs/](context-packs/)
- [prompts/](prompts/)
- [examples/](examples/)
- [templates/](templates/)
- [references/](references/)
- [scripts/README.md](scripts/README.md)
- [reports/README.md](reports/README.md)

## Source-Of-Truth Hierarchy

Use this order when sources appear to conflict:

1. Root canonical doctrine files, especially [apt-principles.md](apt-principles.md) and the relevant lifecycle doc.
2. Domain standards in [standards/](standards/).
3. Review gates in [checklists/](checklists/).
4. Machine-readable contracts in [references/](references/).
5. Examples and showcases in [examples/](examples/).
6. Reusable prompts in [prompts/](prompts/).
7. Context packs in [context-packs/](context-packs/) as source maps for what to read next.

Examples, prompts, and context packs guide application. They do not override canonical doctrine.

## Agent Working Rules

1. Link, do not duplicate.
Use canonical docs as source of truth and reference them rather than re-embedding large guidance blocks.

2. Keep root docs canonical.
Add new root markdown files only when introducing canonical framework domains or governance artifacts (see [README.md](README.md)).

3. Preserve APT structure contracts.
When editing principle docs, checklists, examples, or prompts, preserve required section structure and frontmatter patterns enforced by [scripts/validate-apt-principles.mjs](scripts/validate-apt-principles.mjs).

4. Synchronize related artifacts.
If principle intent or terminology changes, update related checklists/prompts/references/templates in the same change set when possible.

5. Prefer minimal, targeted edits.
Avoid broad stylistic rewrites when a focused change resolves the issue.

6. Use the right artifact for the job.
Use principles to understand intent, standards for enforceable rules, checklists for pass/fail review, showcases for applied patterns, prompts for repeatable agent workflows, and context packs for scoped source loading.

7. Read exact sources before final claims.
Context compression is allowed for discovery, planning, summarization, and cross-repo alignment. It is not sufficient for security, compliance, payment handling, authentication, authorization, final validation, or exact code edits.

8. Do not claim APT compliance without evidence.
Do not claim a repo follows APT standards unless you checked the relevant files against the relevant checklist and can name the evidence.

9. Keep agent distribution boundaries intact.
This repo defines doctrine, standards, examples, prompts, references, and source-pack guidance. The sibling `apt-agent-standards` repo owns installer behavior, profile detection, path mapping, tool-native distribution, and managed sync workflows.

## Repo Alignment Output

When asked to review or align another repo, return:

1. Summary.
2. Repo type classification.
3. Applicable APT packs and required checks.
4. Gap report ordered by severity with file/path evidence.
5. Mandatory fixes versus recommended improvements.
6. Validation commands run or still required.
7. Residual risks, assumptions, and follow-up owners when known.

Use [prompts/repo-alignment-review.md](prompts/repo-alignment-review.md) for gap reports and [prompts/apply-apt-principles.md](prompts/apply-apt-principles.md) for patch plans.

## Task Routing To Existing Custom Agents

Use these scoped agents when appropriate:
- [APT Read-Only Auditor](.github/agents/apt-auditor-readonly.agent.md): framework gap analysis, drift checks, coverage audits with no edits.
- [APT Principles Maintainer](.github/agents/apt-principles-maintainer.agent.md): synchronized cross-framework changes across doctrine/build-kit/reference assets.
- [APT Checklist Synchronizer](.github/agents/checklist-synchronizer.agent.md): checklist-only synchronization.
- [APT Prompt Curator](.github/agents/prompt-curator.agent.md): prompt-only quality and alignment updates.
- [APT Docs Maintainer](.github/agents/docs-maintainer.agent.md): docs/, governance/, templates/, and examples/ quality and structure.
- [APT Security Reviewer](.github/agents/security-reviewer.agent.md): security doctrine, checklist, and example coverage and alignment.
- [APT API Architect](.github/agents/api-architect.agent.md): API standards doctrine, checklist, examples, and architecture map references.
- [APT Frontend Implementer](.github/agents/frontend-implementer.agent.md): design doctrine, tokens, UI examples, and design checklist alignment.
- [APT Test Engineer](.github/agents/test-engineer.agent.md): quality/testing doctrine, standards, checklist, and examples alignment.

## Customization Shortcuts

Scoped instructions:
- [.github/instructions/doctrine-root.instructions.md](.github/instructions/doctrine-root.instructions.md)
- [.github/instructions/checklists-only.instructions.md](.github/instructions/checklists-only.instructions.md)

Reusable skill:
- [.github/skills/principle-change-sync/SKILL.md](.github/skills/principle-change-sync/SKILL.md)

Reusable prompt:
- [.github/prompts/standard-repo-audit.prompt.md](.github/prompts/standard-repo-audit.prompt.md)

## Validation Commands

Run from repo root:
- `npm run validate` (canonical structure and contract checks)
- `npm run run-all-checks` (validation + sweep + selected sibling repo quality checks)
- `npm run graphify:check` then `npm run graphify:apt` then `npm run graphify:gaps` for graph-based gap analysis (see [reports/GRAPHIFY_RUNBOOK.md](reports/GRAPHIFY_RUNBOOK.md))

## Common Pitfalls

- Duplicating doctrine text in prompts/checklists instead of linking to canonical docs.
- Updating one artifact type (for example only prompts) while leaving terminology drift in other linked artifacts.
- Claiming readiness without validation evidence from scripts and reports.
