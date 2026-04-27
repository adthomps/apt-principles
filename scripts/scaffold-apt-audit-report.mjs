#!/usr/bin/env node

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    project: null,
    repoRoot: null,
    auditDate: new Date().toISOString().slice(0, 10),
    output: null,
    reviewer: "manual audit pass",
    reviewType: "repo audit",
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") {
      args.project = argv[index + 1];
      index += 1;
    } else if (arg === "--repo-root") {
      args.repoRoot = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--date") {
      args.auditDate = argv[index + 1];
      index += 1;
    } else if (arg === "--output") {
      args.output = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--reviewer") {
      args.reviewer = argv[index + 1];
      index += 1;
    } else if (arg === "--review-type") {
      args.reviewType = argv[index + 1];
      index += 1;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      "Usage: node scripts/scaffold-apt-audit-report.mjs --project <name> --repo-root <path> [options]",
      "",
      "Options:",
      "  --project <name>        Project name used in title and summary",
      "  --repo-root <path>      Root of target repo where docs/apt/reports lives",
      "  --date <YYYY-MM-DD>     Audit date (default: today)",
      "  --output <path>         Explicit output file path",
      "  --reviewer <name>       Reviewer label (default: manual audit pass)",
      "  --review-type <type>    Review type label (default: repo audit)",
      "  --force                 Overwrite output if it already exists",
    ].join("\n") + "\n",
  );
}

function ensureValue(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function computeCanonicalSource(templateRoot, outputFile) {
  return toPosix(path.relative(path.dirname(outputFile), templateRoot));
}

function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf8");
}

function replaceAll(template, replacements) {
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.split(`{{${key}}}`).join(value);
  }
  return output;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  ensureValue(args.project, "--project is required");
  ensureValue(args.repoRoot, "--repo-root is required");

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const aptPrinciplesRoot = path.resolve(scriptDir, "..");
  const templatePath = path.join(aptPrinciplesRoot, "templates", "apt-audit-report-template.md");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const reportsDir = path.join(args.repoRoot, "docs", "apt", "reports");
  const outputFile = args.output ?? path.join(reportsDir, `apt-principles-audit-${args.auditDate}.md`);
  const canonicalSource = computeCanonicalSource(aptPrinciplesRoot, outputFile);
  const projectSlug = slugify(args.project);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.mkdirSync(path.join(reportsDir, "static"), { recursive: true });

  if (fs.existsSync(outputFile) && !args.force) {
    throw new Error(`Output already exists: ${outputFile}. Re-run with --force to overwrite.`);
  }

  const template = readTemplate(templatePath);
  const content = replaceAll(template, {
    PROJECT_NAME: args.project,
    DATE: args.auditDate,
    REVIEW_TARGET: args.project,
    REVIEW_TYPE: args.reviewType,
    AUDIT_WINDOW: args.auditDate,
    REVIEWER: args.reviewer,
    CANONICAL_SOURCE: canonicalSource,
    OVERALL_RESULT: "Partial",
    OVERALL_NOTES: "Fill in repo-specific summary after reviewing evidence.",
    BLOCKING_COUNT: "0",
    BLOCKING_SUMMARY: "Update after review if blocking issues are found.",
    MAJOR_COUNT: "0",
    MAJOR_SUMMARY: "Replace with the major findings summary for this audit pass.",
    MINOR_COUNT: "0",
    MINOR_SUMMARY: "Replace with the minor findings summary for this audit pass.",
    SEVERITY: "Major",
    LAYER: "Knowledge",
    FINDING: "Replace with the first repo-specific finding.",
    EVIDENCE: "List the local docs, code, or reports that support the finding.",
    ACTION: "Describe the smallest verifiable remediation step.",
    SCORE: "Partial",
    DOCS: "README.md; docs/architecture.md; docs/apt/reports/*",
    CODE_PATHS: "apps/*; packages/*",
    VALIDATION_OUTPUTS: "pnpm run check:design; pnpm run test:contracts; pnpm run typecheck",
    DECISIONS_OR_REPORTS: "docs/DECISION_LOG.md; docs/design/*; docs/apt/reports/*",
    REMEDIATION_1: "Create or update the local adoption/profile evidence layer.",
    REMEDIATION_2: "Resolve the highest-priority repo-specific finding with linked validation evidence.",
    REMEDIATION_3: "Refresh generated audit artifacts and record residual risk.",
    COMMAND: "pnpm run check:design",
    RESULT: "Replace with pass/fail and relevant notes.",
    ARTIFACT_NAME: `${projectSlug}-audit-${args.auditDate}`,
  });

  fs.writeFileSync(outputFile, content.endsWith("\n") ? content : `${content}\n`, "utf8");

  process.stdout.write(`Scaffolded audit report: ${outputFile}\n`);
  process.stdout.write(`Canonical source path: ${canonicalSource}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}