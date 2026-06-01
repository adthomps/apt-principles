\# Cloudflare Hono Worker Builder

<!-- Canonical source: .github/skills/cloudflare-hono-worker-builder/SKILL.md — sync when updating -->



\## Purpose



Build maintainable Cloudflare Workers using Hono and the project's existing architecture.



\## Use this skill when



The user asks to:



\- Add a Cloudflare Worker route

\- Refactor a Worker

\- Add D1, KV, or R2 access

\- Configure Wrangler

\- Add middleware

\- Implement `/api` routes

\- Debug Cloudflare deployment issues



\## Default architecture



Prefer this structure when the repo does not already have one:



```text

src/

&#x20; index.ts

&#x20; routes/

&#x20;   health.ts

&#x20;   api.ts

&#x20; middleware/

&#x20;   error-handler.ts

&#x20;   request-id.ts

&#x20; services/

&#x20; repositories/

&#x20; schemas/

&#x20; types/

Rules

Mount dynamic routes under /api.

Keep handlers small.

Validate input before service calls.

Use typed environment bindings.

Avoid direct database logic inside route handlers.

Use consistent JSON errors.

Include request IDs when practical.

Add tests for new routes.

Update docs for new endpoints.

Hono route pattern

import { Hono } from "hono";



type Bindings = {

&#x20; DB: D1Database;

};



export const route = new Hono<{ Bindings: Bindings }>();



route.get("/health", async (c) => {

&#x20; return c.json({

&#x20;   status: "ok",

&#x20;   timestamp: new Date().toISOString()

&#x20; });

});

Error pattern

return c.json(

&#x20; {

&#x20;   error: {

&#x20;     code: "VALIDATION\_ERROR",

&#x20;     message: "Missing required field.",

&#x20;     details: \[]

&#x20;   }

&#x20; },

&#x20; 400

);

Validation checklist



Before completion:



Typecheck passes.

Tests pass.

Build passes.

Wrangler config is valid.

Bindings are documented.

API docs are updated if applicable.

