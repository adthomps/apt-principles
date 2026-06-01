#!/usr/bin/env node

/**
 * Detects content drift between shared skills across .claude/, .codex/, and .github/ namespaces.
 *
 * The four skills that exist in all three namespaces should stay semantically aligned.
 * This script warns when a namespace copy has drifted significantly from the canonical
 * .github/skills/ version (measured by word count and key-phrase overlap).
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const SHARED_SKILLS = [
  "api-first-openapi-designer",
  "cloudflare-hono-worker-builder",
  "docs-kb-maintainer",
  "testing-validation-runner",
];

const NAMESPACES = [
  { name: ".claude/skills", dir: ".claude/skills" },
  { name: ".codex/skills", dir: ".codex/skills" },
];

const CANONICAL_DIR = ".github/skills";

function readSkill(root, dir, skill) {
  const filePath = path.join(root, dir, skill, "SKILL.md");
  if (!fs.existsSync(filePath)) {
    return { exists: false, content: "", wordCount: 0, path: filePath };
  }
  const content = fs.readFileSync(filePath, "utf8");
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return { exists: true, content, wordCount, path: filePath };
}

function keyPhrases(content) {
  const lower = content.toLowerCase();
  const phrases = [
    "purpose", "use when", "rules", "output", "required steps",
    "validation", "enforce", "do not", "completion",
  ];
  return phrases.filter((phrase) => lower.includes(phrase));
}

function main() {
  const root = process.cwd();
  const warnings = [];
  const passes = [];

  for (const skill of SHARED_SKILLS) {
    const canonical = readSkill(root, CANONICAL_DIR, skill);

    if (!canonical.exists) {
      warnings.push(`MISSING canonical: ${path.join(CANONICAL_DIR, skill, "SKILL.md")}`);
      continue;
    }

    const canonicalPhrases = new Set(keyPhrases(canonical.content));

    for (const ns of NAMESPACES) {
      const copy = readSkill(root, ns.dir, skill);

      if (!copy.exists) {
        warnings.push(`MISSING: ${path.join(ns.dir, skill, "SKILL.md")} (canonical exists)`);
        continue;
      }

      if (copy.wordCount === 0) {
        warnings.push(`EMPTY: ${path.join(ns.dir, skill, "SKILL.md")}`);
        continue;
      }

      const copyPhrases = new Set(keyPhrases(copy.content));
      const overlap = [...canonicalPhrases].filter((p) => copyPhrases.has(p));
      const coverageRatio = canonicalPhrases.size > 0 ? overlap.length / canonicalPhrases.size : 1;

      const wordRatio = canonical.wordCount > 0 ? copy.wordCount / canonical.wordCount : 1;

      if (coverageRatio < 0.4) {
        warnings.push(
          `DRIFT: ${path.join(ns.dir, skill, "SKILL.md")} shares only ${Math.round(coverageRatio * 100)}% key phrases with canonical`
        );
      } else if (wordRatio < 0.1) {
        warnings.push(
          `DRIFT: ${path.join(ns.dir, skill, "SKILL.md")} is only ${copy.wordCount} words vs canonical ${canonical.wordCount}`
        );
      } else {
        passes.push(`OK: ${path.join(ns.dir, skill, "SKILL.md")}`);
      }
    }
  }

  process.stdout.write("Agent skill sync check\n");
  process.stdout.write(`Canonical: ${CANONICAL_DIR}\n`);
  process.stdout.write(`Skills checked: ${SHARED_SKILLS.join(", ")}\n\n`);

  for (const pass of passes) {
    process.stdout.write(`  ${pass}\n`);
  }

  if (warnings.length) {
    process.stdout.write("\nWarnings:\n");
    for (const warning of warnings) {
      process.stdout.write(`  ${warning}\n`);
    }
    process.stdout.write(
      "\nSync policy: update .github/skills/<name>/SKILL.md first, then sync to .claude/skills/ and .codex/skills/.\n"
    );
    process.exitCode = 1;
  } else {
    process.stdout.write("\nAll shared skills are within acceptable drift range.\n");
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
