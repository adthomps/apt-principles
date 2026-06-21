---
title: Repository Drift Repair Flow
version: v1
last_updated: 2026-06-21
owner: APT
status: draft
---

# Repository Drift Repair Flow

## Context

A target repository has APT-aligned AI tool files, but its local context, installed standards, and validation evidence may have drifted from current doctrine. The maintainer needs a repair plan that respects the ownership split between `apt-principles`, `apt-agent-standards`, and the target repo.

## Problem

Repository repair becomes risky when every mismatch is treated as a doctrine issue or when sync tools overwrite local project context. Drift must be classified before remediation.

## APT Principles Applied

- Knowledge: one canonical source per topic prevents drift.
- AI: tool-native files point back to doctrine and do not become doctrine.
- Execution: repair work is scoped and validated.
- Quality: dry-run and validation evidence are required.
- Repository lifecycle: install, scan, drift detection, repair, synchronization, upgrade, and verification are separate steps.

## Solution

Use the repository lifecycle flow:

```text
Install:
Confirm whether apt-agent-standards manages any files.

Scan:
Read README.md, AGENTS.md, .agent-standards.json, docs/project-context.md, and tool-native files when present.

Detect Drift:
Classify each mismatch as doctrine, distribution, or target-owned context.

Repair:
Update doctrine in apt-principles, managed files through apt-agent-standards, or local docs in the target repo.

Synchronize:
Use dry-run install/sync before managed-file changes.

Upgrade:
Record profile or standard changes and any local exceptions.

Verify:
Run target validation and apt-principles validation when doctrine changed.
```

## Example Structure

```text
Intent:
Repair repository standards drift without overwriting local context.

Owner:
Target repo maintainer with APT standards maintainer support.

Inputs:
Target repo docs, .agent-standards.json, apt-principles doctrine, apt-agent-standards dry-run output.

Flow:
Install -> Scan -> Detect Drift -> Repair -> Synchronize -> Upgrade -> Verify.

Artifacts:
Drift findings, ownership classification, repair plan, dry-run output, validation evidence.

Validation:
Target repo checks, apt-agent-standards dry-run checks, npm run validate in apt-principles if doctrine changed.

Risks:
Overwriting local context, duplicating doctrine, repairing through the wrong owner.

Related APT docs:
standards/ai/repository-lifecycle-standard.md.
```

## Tradeoffs

Classification adds a step before repair, but it prevents accidental doctrine forks and protects local project context. It also makes future APT Agent automation safer because the agent can recommend the right owner instead of blindly editing whichever file looks stale.

## Common Mistakes

- Editing installed tool-native files as if they are canonical doctrine.
- Moving installer or profile-detection logic into `apt-principles`.
- Treating profile detection as authoritative when local scope contradicts it.
- Running sync without a dry run.
- Overwriting target-owned `docs/project-context.md`.
- Closing a drift repair without validation evidence.

## Implementation Notes

APT Agent can later automate scan, classification, dry-run orchestration, and evidence collection. It should not make `apt-principles` responsible for installer behavior or target-repo local decisions.

## Related Documents

- `../../ai-agent-framework.md`
- `../../knowledge-system.md`
- `../../standards/ai/repository-lifecycle-standard.md`
- `../../prompts/repository-lifecycle-review-prompt.md`
- `../../references/agent-standards-contract.json`
