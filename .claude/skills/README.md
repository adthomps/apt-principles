# .claude/skills — Downstream Project Templates

These skill definition files are **templates for downstream product repos** that use Claude Code.

Copy them into `.claude/skills/` in a downstream project and adapt as needed.

**Canonical source for each skill:** The authoritative version of these skills lives in `.github/skills/`. When updating skill content, sync the changes here and in `.codex/skills/`.

## Template skills included

| Skill | Purpose in a downstream product repo |
|-------|--------------------------------------|
| `api-first-openapi-designer/` | Design REST API contracts before implementation |
| `cloudflare-hono-worker-builder/` | Build Cloudflare Workers using Hono |
| `docs-kb-maintainer/` | Write and maintain developer documentation |
| `testing-validation-runner/` | Run validation commands and report results |

## Sync policy

When `.github/skills/<name>/SKILL.md` is updated, sync the change to:
- `.claude/skills/<name>/SKILL.md`
- `.codex/skills/<name>/SKILL.md`

Run `npm run sync:check` to detect drift between namespace copies.
