Use this when you want Claude to inspect structure before making changes.



```md

\# Review Repo



Review the current repository and produce a practical improvement plan.



\## Instructions



1\. Inspect the repo structure.

2\. Identify the app type, package manager, framework, and deployment target.

3\. Read key files:

&#x20;  - `README.md`

&#x20;  - `AGENTS.md`

&#x20;  - `CLAUDE.md`

&#x20;  - `package.json`

&#x20;  - `wrangler.toml`

&#x20;  - `vite.config.\*`

&#x20;  - `tsconfig.json`

&#x20;  - `docs/\*`

4\. Do not modify files yet.

5\. Produce a concise report.



\## Report format



Return:



1\. Project summary

2\. Current architecture

3\. Strengths

4\. Risks

5\. Recommended structure

6\. Suggested file moves

7\. Missing docs

8\. Missing tests

9\. Validation commands

10\. First three safe next steps

