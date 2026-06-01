#!/usr/bin/env node

/**
 * Validates whether a project has the files and configuration needed for AI-assisted work.
 *
 * Scores the repo 0–4 against the APT AI Agent Readiness dimension:
 *   0  None        — no AI configuration found
 *   1  Minimal     — AGENTS.md present with content
 *   2  Configured  — AGENTS.md + copilot-instructions + .github/agents/
 *   3  Active      — ≥3 domain agents + skills + prompts + .claude/CLAUDE.md
 *   4  Optimizing  — agent frontmatter valid + .codex configured
 *
 * Usage:
 *   node scripts/validate-ai-readiness.mjs
 *   node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach
 *   node scripts/validate-ai-readiness.mjs --json
 *   node scripts/validate-ai-readiness.mjs --report
 *   node scripts/validate-ai-readiness.mjs --repo-root ../apt-coach --fix
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCORE_LABELS = ["None", "Minimal", "Configured", "Active", "Optimizing"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

function isDir(root, rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) && fs.statSync(full).isDirectory();
}

function readSafe(root, rel) {
  const full = path.join(root, rel);
  try {
    return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
  } catch {
    return "";
  }
}

function charCount(root, rel) {
  return readSafe(root, rel).replace(/\s+/g, "").length;
}

function listDir(root, rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  try {
    return fs.readdirSync(full, { withFileTypes: true });
  } catch {
    return [];
  }
}

function countAgentFiles(root, rel) {
  return listDir(root, rel).filter(
    (entry) => entry.isFile() && entry.name.endsWith(".agent.md")
  ).length;
}

function countSkillDirs(root, rel) {
  return listDir(root, rel).filter((entry) => {
    if (!entry.isDirectory()) return false;
    return fs.existsSync(path.join(root, rel, entry.name, "SKILL.md"));
  }).length;
}

function countPromptFiles(root, rel) {
  return listDir(root, rel).filter(
    (entry) => entry.isFile() && entry.name.endsWith(".prompt.md")
  ).length;
}

function countMdFiles(root, rel) {
  return listDir(root, rel).filter(
    (entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("README")
  ).length;
}

function hasFrontmatterKey(content, key) {
  const lines = content.split("\n");
  let inFrontmatter = false;
  for (const line of lines) {
    if (line.trim() === "---") {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter && line.startsWith(`${key}:`)) return true;
  }
  return false;
}

function validateAgentFrontmatter(root, rel) {
  const entries = listDir(root, rel).filter(
    (entry) => entry.isFile() && entry.name.endsWith(".agent.md")
  );
  if (!entries.length) return { pass: false, detail: "no agent files found" };

  const failing = [];
  for (const entry of entries) {
    const content = readSafe(root, path.join(rel, entry.name));
    const missingKeys = ["name", "description", "tools"].filter(
      (key) => !hasFrontmatterKey(content, key)
    );
    if (missingKeys.length) {
      failing.push(`${entry.name} missing: ${missingKeys.join(", ")}`);
    }
  }

  if (failing.length) {
    return { pass: false, detail: failing.slice(0, 3).join("; ") };
  }
  return { pass: true, detail: `all ${entries.length} agents valid` };
}

// ---------------------------------------------------------------------------
// Check definitions
// ---------------------------------------------------------------------------

const CHECKS = [
  // ── Category 1: Core AI Guidance ──────────────────────────────────────────
  {
    id: "readme",
    category: "Core AI Guidance",
    label: "README.md present",
    level: 1,
    required: true,
    run(root) {
      const ok = exists(root, "README.md");
      return { pass: ok, detail: ok ? "found" : "README.md not found" };
    },
  },
  {
    id: "agents-md-present",
    category: "Core AI Guidance",
    label: "AGENTS.md present and non-empty",
    level: 1,
    required: true,
    run(root) {
      if (!exists(root, "AGENTS.md")) return { pass: false, detail: "AGENTS.md not found" };
      const chars = charCount(root, "AGENTS.md");
      const ok = chars >= 100;
      return { pass: ok, detail: ok ? `${chars} chars` : `only ${chars} chars (need ≥100)` };
    },
  },
  {
    id: "agents-md-content",
    category: "Core AI Guidance",
    label: "AGENTS.md has task routing or working rules",
    level: 1,
    required: true,
    run(root) {
      const content = readSafe(root, "AGENTS.md").toLowerCase();
      const ok = content.includes("agent") || content.includes("routing") || content.includes("rule");
      return { pass: ok, detail: ok ? "contains agent/routing/rule guidance" : "no agent guidance found" };
    },
  },
  {
    id: "contributing-md",
    category: "Core AI Guidance",
    label: "CONTRIBUTING.md present",
    level: 2,
    required: false,
    run(root) {
      const ok = exists(root, "CONTRIBUTING.md");
      return { pass: ok, detail: ok ? "found" : "CONTRIBUTING.md not found" };
    },
  },
  {
    id: "copilot-instructions",
    category: "Core AI Guidance",
    label: ".github/copilot-instructions.md present",
    level: 2,
    required: true,
    run(root) {
      const paths = [".github/copilot-instructions.md", "copilot-instructions.md"];
      for (const rel of paths) {
        if (exists(root, rel) && charCount(root, rel) > 10) {
          return { pass: true, detail: rel };
        }
      }
      return { pass: false, detail: "not found at .github/copilot-instructions.md" };
    },
  },

  // ── Category 2: GitHub Copilot Agents ─────────────────────────────────────
  {
    id: "github-agents-dir",
    category: "GitHub Copilot Agents",
    label: ".github/agents/ directory exists",
    level: 2,
    required: true,
    run(root) {
      const ok = isDir(root, ".github/agents");
      return { pass: ok, detail: ok ? "found" : ".github/agents/ not found" };
    },
  },
  {
    id: "github-agents-min-one",
    category: "GitHub Copilot Agents",
    label: "At least 1 .agent.md file",
    level: 2,
    required: true,
    run(root) {
      const count = countAgentFiles(root, ".github/agents");
      return { pass: count >= 1, detail: `${count} agent file(s) found` };
    },
  },
  {
    id: "github-agents-auditor",
    category: "GitHub Copilot Agents",
    label: "Read-only/auditor agent present",
    level: 2,
    required: false,
    run(root) {
      const entries = listDir(root, ".github/agents").filter(
        (e) => e.isFile() && (e.name.includes("auditor") || e.name.includes("readonly"))
      );
      const ok = entries.length > 0;
      return { pass: ok, detail: ok ? entries[0].name : "no auditor/readonly agent found" };
    },
  },
  {
    id: "github-agents-min-three",
    category: "GitHub Copilot Agents",
    label: "At least 3 domain agents",
    level: 3,
    required: true,
    run(root) {
      const count = countAgentFiles(root, ".github/agents");
      return { pass: count >= 3, detail: `${count} agent file(s) found` };
    },
  },
  {
    id: "github-agents-frontmatter",
    category: "GitHub Copilot Agents",
    label: "Agent frontmatter valid (name, description, tools)",
    level: 4,
    required: true,
    run(root) {
      if (!isDir(root, ".github/agents")) {
        return { pass: false, detail: ".github/agents/ not found" };
      }
      return validateAgentFrontmatter(root, ".github/agents");
    },
  },
  {
    id: "github-skills",
    category: "GitHub Copilot Agents",
    label: ".github/skills/ has at least 1 skill",
    level: 3,
    required: false,
    run(root) {
      const count = countSkillDirs(root, ".github/skills");
      return { pass: count >= 1, detail: `${count} skill(s) found` };
    },
  },
  {
    id: "github-prompts",
    category: "GitHub Copilot Agents",
    label: ".github/prompts/ has at least 1 prompt",
    level: 3,
    required: false,
    run(root) {
      const count = countPromptFiles(root, ".github/prompts");
      return { pass: count >= 1, detail: `${count} prompt file(s) found` };
    },
  },

  // ── Category 3: Claude Code ────────────────────────────────────────────────
  {
    id: "claude-md",
    category: "Claude Code",
    label: ".claude/CLAUDE.md present and non-empty",
    level: 3,
    required: false,
    run(root) {
      if (!exists(root, ".claude/CLAUDE.md")) {
        return { pass: false, detail: ".claude/CLAUDE.md not found" };
      }
      const chars = charCount(root, ".claude/CLAUDE.md");
      const ok = chars >= 100;
      return { pass: ok, detail: ok ? `${chars} chars` : `only ${chars} chars (need ≥100)` };
    },
  },
  {
    id: "claude-agents",
    category: "Claude Code",
    label: ".claude/agents/ has template agents",
    level: 3,
    required: false,
    run(root) {
      const count = countMdFiles(root, ".claude/agents");
      return { pass: count >= 1, detail: `${count} agent template(s)` };
    },
  },
  {
    id: "claude-skills",
    category: "Claude Code",
    label: ".claude/skills/ has template skills",
    level: 3,
    required: false,
    run(root) {
      const count = countSkillDirs(root, ".claude/skills");
      return { pass: count >= 1, detail: `${count} skill template(s)` };
    },
  },

  // ── Category 4: Codex ─────────────────────────────────────────────────────
  {
    id: "codex-config",
    category: "Codex",
    label: ".codex/config.toml present and non-empty",
    level: 4,
    required: false,
    run(root) {
      if (!exists(root, ".codex/config.toml")) {
        return { pass: false, detail: ".codex/config.toml not found" };
      }
      const chars = charCount(root, ".codex/config.toml");
      return { pass: chars >= 10, detail: chars >= 10 ? "configured" : "file is nearly empty" };
    },
  },
  {
    id: "codex-prompts",
    category: "Codex",
    label: ".codex/prompts/ has at least 1 prompt",
    level: 4,
    required: false,
    run(root) {
      const count = listDir(root, ".codex/prompts").filter(
        (e) => e.isFile() && e.name.endsWith(".md")
      ).length;
      return { pass: count >= 1, detail: `${count} prompt(s)` };
    },
  },

  // ── Category 5: APT Adoption ──────────────────────────────────────────────
  {
    id: "apt-adoption",
    category: "APT Adoption",
    label: "docs/apt/adoption.md or project-profile.json",
    level: 3,
    required: false,
    run(root) {
      const paths = [
        "docs/apt/adoption.md",
        "docs/apt/references/project-profile.json",
      ];
      for (const rel of paths) {
        if (exists(root, rel)) return { pass: true, detail: rel };
      }
      return { pass: false, detail: "no APT adoption record found in docs/apt/" };
    },
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function computeScore(results) {
  const required = results.filter((r) => r.required);

  for (let level = 4; level >= 1; level--) {
    const forLevel = required.filter((r) => r.level <= level);
    if (forLevel.length > 0 && forLevel.every((r) => r.pass)) {
      return level;
    }
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Fix actions
// ---------------------------------------------------------------------------

function copyFileSafe(src, dest) {
  if (!fs.existsSync(src)) return { action: "SKIP", reason: `source not found: ${src}` };
  if (fs.existsSync(dest)) return { action: "SKIPPED", reason: "already exists" };
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return { action: "COPIED" };
}

function copyDirSafe(srcDir, destDir) {
  const actions = [];
  if (!fs.existsSync(srcDir)) return actions;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      const sub = copyDirSafe(src, dest);
      actions.push(...sub);
    } else {
      const result = copyFileSafe(src, dest);
      actions.push({ path: path.relative(process.cwd(), dest), ...result });
    }
  }
  return actions;
}

function ensureDir(full) {
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    return { action: "CREATED", path: full };
  }
  return null;
}

function createAdoptionStub(destDir) {
  const filePath = path.join(destDir, "docs/apt/adoption.md");
  if (fs.existsSync(filePath)) return { action: "SKIPPED", path: "docs/apt/adoption.md", reason: "already exists" };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const content = [
    "---",
    "title: APT Adoption Record",
    "version: v1",
    `last_updated: ${today}`,
    "owner: [OWNER]",
    "status: draft",
    "---",
    "",
    "# APT Adoption Record",
    "",
    "## Adoption Mode",
    "",
    "<!-- copy | sync | apply | showcase -->",
    "[MODE]",
    "",
    "## Maturity",
    "",
    "<!-- concept | prototype | active | production | archived -->",
    "[MATURITY]",
    "",
    "## Canonical Source",
    "",
    "- https://github.com/adthomps/apt-principles",
    "",
    "## Principles Applied",
    "",
    "- [List the APT principles applied in this project]",
    "",
    "## Local Decisions",
    "",
    "- [Document any deviations from canonical APT doctrine here]",
  ].join("\n");
  fs.writeFileSync(filePath, `${content}\n`);
  return { action: "CREATED", path: "docs/apt/adoption.md" };
}

function runFix(root, aptSource) {
  const fixLog = [];

  function log(action, relPath, reason) {
    fixLog.push({ action, path: relPath, reason });
  }

  function tryEnsureDir(rel) {
    const full = path.join(root, rel);
    const result = ensureDir(full);
    if (result) log("CREATED (dir)", rel);
  }

  // Core AI Guidance
  const agentsMd = copyFileSafe(
    path.join(aptSource, "templates/AGENTS.md"),
    path.join(root, "AGENTS.md")
  );
  log(agentsMd.action, "AGENTS.md", agentsMd.reason);

  const contributingMd = copyFileSafe(
    path.join(aptSource, "templates/CONTRIBUTING.md"),
    path.join(root, "CONTRIBUTING.md")
  );
  log(contributingMd.action, "CONTRIBUTING.md", contributingMd.reason);

  // GitHub Copilot
  tryEnsureDir(".github");

  const copilotInstructions = copyFileSafe(
    path.join(aptSource, "templates/copilot-instructions.md"),
    path.join(root, ".github/copilot-instructions.md")
  );
  log(copilotInstructions.action, ".github/copilot-instructions.md", copilotInstructions.reason);

  // GitHub agents
  tryEnsureDir(".github/agents");
  const agentActions = copyDirSafe(
    path.join(aptSource, ".github/agents"),
    path.join(root, ".github/agents")
  );
  for (const a of agentActions) {
    const rel = path.relative(root, a.path ?? "").replaceAll("\\", "/");
    log(a.action, rel || a.path, a.reason);
  }

  // GitHub skills (subset: the 6 recommended portable ones)
  const recommendedSkills = [
    "apt-repo-architect",
    "api-first-openapi-designer",
    "cloudflare-hono-worker-builder",
    "docs-kb-maintainer",
    "testing-validation-runner",
    "webhook-event-designer",
  ];
  tryEnsureDir(".github/skills");
  for (const skill of recommendedSkills) {
    const skillSrc = path.join(aptSource, ".github/skills", skill, "SKILL.md");
    const skillDest = path.join(root, ".github/skills", skill, "SKILL.md");
    const result = copyFileSafe(skillSrc, skillDest);
    const rel = path.join(".github/skills", skill, "SKILL.md").replaceAll("\\", "/");
    log(result.action, rel, result.reason);
  }

  // GitHub prompts
  tryEnsureDir(".github/prompts");
  const promptActions = copyDirSafe(
    path.join(aptSource, ".github/prompts"),
    path.join(root, ".github/prompts")
  );
  for (const a of promptActions) {
    const rel = path.relative(root, a.path ?? "").replaceAll("\\", "/");
    log(a.action, rel || a.path, a.reason);
  }

  // Claude Code
  tryEnsureDir(".claude");
  const claudeMd = copyFileSafe(
    path.join(aptSource, ".claude/CLAUDE.md"),
    path.join(root, ".claude/CLAUDE.md")
  );
  log(claudeMd.action, ".claude/CLAUDE.md", claudeMd.reason);

  tryEnsureDir(".claude/agents");
  const claudeAgentActions = copyDirSafe(
    path.join(aptSource, ".claude/agents"),
    path.join(root, ".claude/agents")
  );
  for (const a of claudeAgentActions) {
    const rel = path.relative(root, a.path ?? "").replaceAll("\\", "/");
    log(a.action, rel || a.path, a.reason);
  }

  tryEnsureDir(".claude/skills");
  const claudeSkillActions = copyDirSafe(
    path.join(aptSource, ".claude/skills"),
    path.join(root, ".claude/skills")
  );
  for (const a of claudeSkillActions) {
    const rel = path.relative(root, a.path ?? "").replaceAll("\\", "/");
    log(a.action, rel || a.path, a.reason);
  }

  // Codex
  tryEnsureDir(".codex");
  const codexConfig = copyFileSafe(
    path.join(aptSource, ".codex/config.toml"),
    path.join(root, ".codex/config.toml")
  );
  log(codexConfig.action, ".codex/config.toml", codexConfig.reason);

  tryEnsureDir(".codex/prompts");
  const codexPromptActions = copyDirSafe(
    path.join(aptSource, ".codex/prompts"),
    path.join(root, ".codex/prompts")
  );
  for (const a of codexPromptActions) {
    const rel = path.relative(root, a.path ?? "").replaceAll("\\", "/");
    log(a.action, rel || a.path, a.reason);
  }

  // APT Adoption stub
  const adoptionResult = createAdoptionStub(root);
  log(adoptionResult.action, adoptionResult.path, adoptionResult.reason);

  return fixLog;
}

// ---------------------------------------------------------------------------
// Output formatters
// ---------------------------------------------------------------------------

function pad(str, len) {
  return str.slice(0, len).padEnd(len);
}

function printConsole(root, results, score, date) {
  const line = "─".repeat(60);
  process.stdout.write(`\nAI readiness check — ${root}\n${line}\n`);

  let currentCategory = "";
  for (const r of results) {
    if (r.category !== currentCategory) {
      currentCategory = r.category;
      process.stdout.write(`\n${currentCategory}\n`);
    }
    const badge = r.pass ? "PASS" : r.required ? "FAIL" : "MISS";
    const detail = r.detail ? `  ${r.detail}` : "";
    process.stdout.write(`  ${badge.padEnd(4)}  ${pad(r.label, 40)}${detail}\n`);
  }

  const required = results.filter((r) => r.required);
  const recommended = results.filter((r) => !r.required);
  const reqPass = required.filter((r) => r.pass).length;
  const reqFail = required.filter((r) => !r.pass).length;
  const recPass = recommended.filter((r) => r.pass).length;
  const recMiss = recommended.filter((r) => !r.pass).length;

  process.stdout.write(`\n${line}\n`);
  process.stdout.write(`AI Readiness Score: ${score} / 4  (${SCORE_LABELS[score]})\n`);
  process.stdout.write(`Required checks:    ${reqPass} pass, ${reqFail} fail\n`);
  process.stdout.write(`Recommended checks: ${recPass} pass, ${recMiss} miss\n`);

  const gaps = results.filter((r) => !r.pass);
  if (gaps.length) {
    process.stdout.write(`\nGaps to address:\n`);
    for (const g of gaps) {
      const tag = g.required ? "[required]" : "[recommended]";
      process.stdout.write(`  ${tag} ${g.label} — ${g.detail}\n`);
    }
    process.stdout.write(`\nTo scaffold missing files from apt-principles templates:\n`);
    process.stdout.write(`  node scripts/validate-ai-readiness.mjs --repo-root <path> --fix\n`);
  } else {
    process.stdout.write(`\nAll checks pass. Repository is AI-ready.\n`);
  }
  process.stdout.write("\n");
}

function buildJson(root, results, score) {
  const gaps = results.filter((r) => !r.pass).map((r) => ({
    id: r.id,
    category: r.category,
    level: r.level,
    required: r.required,
    label: r.label,
    detail: r.detail,
  }));

  const nextSteps = gaps.map((g) => {
    if (g.id === "agents-md-present") return "Create AGENTS.md — copy from apt-principles/templates/AGENTS.md";
    if (g.id === "copilot-instructions") return "Create .github/copilot-instructions.md — copy from apt-principles/templates/copilot-instructions.md";
    if (g.id === "github-agents-dir" || g.id === "github-agents-min-one") return "Create .github/agents/ and add agent definitions — run --fix to scaffold from apt-principles";
    if (g.id === "github-agents-min-three") return "Add at least 3 domain agents to .github/agents/ — run --fix to scaffold";
    if (g.id === "github-agents-frontmatter") return "Add name:, description:, and tools: frontmatter to .github/agents/*.agent.md files";
    if (g.id === "github-skills") return "Add skills to .github/skills/ — run --fix to scaffold recommended skills";
    if (g.id === "github-prompts") return "Add prompts to .github/prompts/ — run --fix to scaffold";
    if (g.id === "claude-md") return "Create .claude/CLAUDE.md with project context — run --fix to scaffold";
    if (g.id === "codex-config") return "Create .codex/config.toml — run --fix to scaffold";
    if (g.id === "apt-adoption") return "Create docs/apt/adoption.md — run --fix to create a stub";
    if (g.id === "contributing-md") return "Create CONTRIBUTING.md — copy from apt-principles/templates/CONTRIBUTING.md";
    return `Fix: ${g.label}`;
  });

  return {
    root,
    score,
    label: SCORE_LABELS[score],
    required: {
      pass: results.filter((r) => r.required && r.pass).length,
      fail: results.filter((r) => r.required && !r.pass).length,
    },
    recommended: {
      pass: results.filter((r) => !r.required && r.pass).length,
      miss: results.filter((r) => !r.required && !r.pass).length,
    },
    checks: results.map((r) => ({
      id: r.id,
      category: r.category,
      level: r.level,
      required: r.required,
      label: r.label,
      pass: r.pass,
      detail: r.detail,
    })),
    gaps,
    next_steps: nextSteps,
  };
}

function buildReport(root, results, score, date) {
  const sections = [
    "---",
    "title: AI Readiness Report",
    "version: v1",
    `last_updated: ${date}`,
    "owner: APT",
    "status: draft",
    "---",
    "",
    `# AI Readiness Report`,
    "",
    `**Repo:** \`${root}\`  `,
    `**Date:** ${date}  `,
    `**Score:** ${score} / 4 — ${SCORE_LABELS[score]}`,
    "",
    "## Check Results",
    "",
    "| Category | Check | Status | Detail |",
    "|----------|-------|--------|--------|",
  ];

  for (const r of results) {
    const status = r.pass ? "PASS" : r.required ? "FAIL" : "MISS";
    sections.push(`| ${r.category} | ${r.label} | ${status} | ${r.detail ?? ""} |`);
  }

  const gaps = results.filter((r) => !r.pass);
  if (gaps.length) {
    sections.push("", "## Gaps", "");
    for (const g of gaps) {
      const tag = g.required ? "**required**" : "recommended";
      sections.push(`- ${tag} — ${g.label}: ${g.detail}`);
    }

    sections.push("", "## Next Steps", "");
    sections.push("Run the following to scaffold missing files from apt-principles templates:", "");
    sections.push("```bash");
    sections.push("node scripts/validate-ai-readiness.mjs --repo-root <path> --fix");
    sections.push("```", "");
    sections.push("Then re-run to confirm score:", "");
    sections.push("```bash");
    sections.push("node scripts/validate-ai-readiness.mjs --repo-root <path>");
    sections.push("```");
  } else {
    sections.push("", "## Result", "", "All checks pass. Repository is AI-ready.");
  }

  return sections.join("\n") + "\n";
}

function printFixLog(root, fixLog) {
  const line = "─".repeat(60);
  process.stdout.write(`\nFixing gaps in ${root}\n${line}\n`);

  let created = 0;
  let skipped = 0;
  let copied = 0;

  for (const entry of fixLog) {
    if (!entry.path) continue;
    const action = (entry.action ?? "").toUpperCase();
    const reason = entry.reason ? ` (${entry.reason})` : "";
    process.stdout.write(`  ${action.padEnd(12)} ${entry.path}${reason}\n`);
    if (action === "CREATED" || action === "CREATED (DIR)") created++;
    else if (action === "COPIED") copied++;
    else if (action === "SKIPPED" || action === "SKIP") skipped++;
  }

  process.stdout.write(`${line}\n`);
  process.stdout.write(`Scaffolded ${created + copied} items. Skipped ${skipped}.\n`);
  process.stdout.write(`Review each file and adapt to this project before committing.\n`);
  process.stdout.write(`Re-run: node scripts/validate-ai-readiness.mjs --repo-root ${root}\n\n`);
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    repoRoot: null,
    aptSource: null,
    json: false,
    report: false,
    fix: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--repo-root") {
      args.repoRoot = path.resolve(argv[++i]);
    } else if (arg === "--apt-source") {
      args.aptSource = path.resolve(argv[++i]);
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--report") {
      args.report = true;
    } else if (arg === "--fix") {
      args.fix = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  process.stdout.write([
    "Usage: node scripts/validate-ai-readiness.mjs [options]",
    "",
    "Validates AI readiness for a project directory and scores it 0–4.",
    "",
    "Options:",
    "  --repo-root <path>   Target repo to validate (default: cwd)",
    "  --apt-source <path>  apt-principles root for templates (default: auto-detected)",
    "  --json               Output results as JSON",
    "  --report             Write Markdown report to docs/apt/reports/",
    "  --fix                Scaffold missing files from apt-principles templates",
    "                       (requires --repo-root; refuses to run against apt-principles itself)",
    "  --help, -h           Show this help",
    "",
    "Scores:",
    "  0  None        — no AI configuration found",
    "  1  Minimal     — AGENTS.md present with content",
    "  2  Configured  — AGENTS.md + copilot-instructions + .github/agents/",
    "  3  Active      — ≥3 domain agents + skills + prompts + .claude/CLAUDE.md",
    "  4  Optimizing  — agent frontmatter valid + .codex configured",
  ].join("\n") + "\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const aptSource = args.aptSource ?? path.resolve(scriptDir, "..");
  const root = args.repoRoot ?? process.cwd();
  const date = new Date().toISOString().slice(0, 10);

  // Guard: refuse to --fix against apt-principles itself
  if (args.fix && !args.repoRoot) {
    throw new Error(
      "--fix requires --repo-root to specify the target project. " +
      "Refusing to scaffold into apt-principles itself."
    );
  }

  if (args.fix) {
    const fixLog = runFix(root, aptSource);
    printFixLog(root, fixLog);
    process.stdout.write(`Verifying after fix...\n`);
  }

  // Run all checks
  const results = CHECKS.map((check) => {
    const result = check.run(root);
    return {
      id: check.id,
      category: check.category,
      label: check.label,
      level: check.level,
      required: check.required,
      pass: result.pass,
      detail: result.detail ?? "",
    };
  });

  const score = computeScore(results);
  const hasRequiredFailure = results.some((r) => r.required && !r.pass);

  if (args.json) {
    process.stdout.write(JSON.stringify(buildJson(root, results, score), null, 2) + "\n");
  } else {
    printConsole(root, results, score, date);
  }

  if (args.report) {
    const reportDir = path.join(root, "docs/apt/reports");
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `ai-readiness-${date}.md`);
    fs.writeFileSync(reportPath, buildReport(root, results, score, date));
    process.stdout.write(`Report written to ${reportPath}\n\n`);
  }

  if (hasRequiredFailure) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
