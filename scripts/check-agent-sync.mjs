#!/usr/bin/env node

/**
 * Validates the doctrine/distribution contract between apt-principles and
 * apt-agent-standards without expecting tool-native Claude/Codex/Copilot copies
 * to live in this repository.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const contractPath = path.join(root, "references", "agent-standards-contract.json");
const requiredReferences = [
  "apt-principles/ai-agent-framework.md",
  "apt-principles/checklists/ai-agent-review-checklist.md",
  "apt-principles/prompts/apt-one-shot-build-prompt.md",
  "apt-principles/references/ai-review-bundle.json",
];
const requiredValidation = [
  "node scripts/detect-profiles.mjs --target <repo> --json",
  "node scripts/install-agent-standards.mjs --target <repo> --profiles <profiles> --dry-run",
  "node scripts/sync-agent-standards.mjs --target <repo> --dry-run",
  "node scripts/check-ai-tool-parity.mjs",
];

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  if (!fs.existsSync(contractPath)) {
    fail("Missing references/agent-standards-contract.json");
    return;
  }

  const contract = readJson(contractPath);
  const issues = [];
  const standards = contract.repositories?.["apt-agent-standards"];
  const references = new Set(standards?.must_reference || []);
  const validations = new Set(contract.validation?.["apt-agent-standards"] || []);
  const governanceRules = contract.governance_rules || [];

  for (const required of requiredReferences) {
    if (!references.has(required)) issues.push(`Missing must_reference entry: ${required}`);
  }

  for (const command of requiredValidation) {
    if (!validations.has(command)) issues.push(`Missing apt-agent-standards validation command: ${command}`);
  }

  if (!governanceRules.some((rule) => rule.includes("Do not merge apt-agent-standards installer"))) {
    issues.push("Missing governance rule that keeps installer behavior out of apt-principles.");
  }

  if (!governanceRules.some((rule) => rule.includes("Preserve target-owned docs/project-context.md"))) {
    issues.push("Missing governance rule that preserves target-owned docs/project-context.md during sync.");
  }

  process.stdout.write("APT agent standards contract check\n");
  process.stdout.write(`Contract: ${path.relative(root, contractPath).replaceAll(path.sep, "/")}\n`);
  process.stdout.write(`Version: ${contract.version || "unknown"}\n\n`);

  if (issues.length > 0) {
    process.stdout.write("Issues:\n");
    for (const issue of issues) process.stdout.write(`  - ${issue}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write("PASS: doctrine/distribution ownership contract is present and complete.\n");
  process.stdout.write("Run cross-tool parity and workspace rollout checks from apt-agent-standards.\n");
}

try {
  main();
} catch (error) {
  fail(error.message);
}
