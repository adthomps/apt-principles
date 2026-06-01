# Validate

Run project validation and report the results clearly.

## Instructions

1. Identify package manager.
2. Inspect available scripts.
3. Run the safest relevant validation commands.
4. Do not change code unless validation requires a small obvious fix.
5. If fixing, explain the fix.
6. Report failures honestly.

## Preferred command order

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build

For Cloudflare projects:

pnpm wrangler deploy --dry-run
Required output

Return:

Commands run
Pass/fail result for each
Errors found
Fixes applied
Remaining risks