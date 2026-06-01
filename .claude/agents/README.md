# .claude/agents — Downstream Project Templates

These agent definition files are **templates for downstream product repos** that use Claude Code.

Copy them into `.claude/agents/` in a downstream project and adapt the scope and constraints for that project's stack and domain.

**These are not the active agents for apt-principles itself.** For agents that work within apt-principles, see `.github/agents/`.

## Template agents included

| File | Role in a downstream product repo |
|------|------------------------------------|
| `api-architect.md` | Designs and reviews API contracts and schemas |
| `apt-auditor-readonly.md` | Audits the repo structure without making changes |
| `frontend-implementer.md` | Builds React TypeScript UI pages and components |
| `test-engineer.md` | Runs validation, writes tests, prevents regressions |
