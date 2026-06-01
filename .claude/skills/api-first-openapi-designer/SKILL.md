\# API-First OpenAPI Designer

<!-- Canonical source: .github/skills/api-first-openapi-designer/SKILL.md — sync when updating -->



\## Purpose



Design clear API contracts before implementation.



\## Use this skill when



The user asks to:



\- Create an API

\- Review an API

\- Update OpenAPI

\- Add pagination

\- Add filtering

\- Add sorting

\- Add error handling

\- Design webhook contracts

\- Create API examples



\## Design rules



\- Use resource-oriented REST unless told otherwise.

\- Use plural nouns for collections.

\- Keep path names consistent.

\- Use stable IDs.

\- Use ISO 8601 timestamps.

\- Use structured errors.

\- Use cursor pagination for large datasets.

\- Use idempotency keys for imports, payments, and webhook processing.

\- Include request and response examples.

\- Include error examples.

\- Do not create implementation before the contract is clear.



\## Standard response format



For a new API design, return:



1\. Summary

2\. Resource model

3\. Endpoint table

4\. Request schemas

5\. Response schemas

6\. Error model

7\. Auth and permissions

8\. Pagination/filtering/sorting

9\. Webhooks if relevant

10\. Database impact

11\. Tests required

12\. Implementation steps



\## Endpoint table format



| Method | Path | Purpose | Auth | Notes |

|---|---|---|---|---|



\## Error shape



```json

{

&#x20; "error": {

&#x20;   "code": "VALIDATION\_ERROR",

&#x20;   "message": "A readable message.",

&#x20;   "details": \[]

&#x20; },

&#x20; "requestId": "req\_..."

}

Done criteria



API work is not done until:



Contract is documented.

Implementation matches contract.

Tests cover success and failure cases.

Docs are updated.

