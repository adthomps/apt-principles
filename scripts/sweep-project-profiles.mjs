#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const args = {
    workspaceRoot: null,
    repos: null,
    auditDate: new Date().toISOString().slice(0, 10),
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--workspace-root") {
      args.workspaceRoot = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--repos") {
      args.repos = (argv[index + 1] ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      index += 1;
    } else if (arg === "--date") {
      args.auditDate = argv[index + 1];
      index += 1;
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
      "Usage: node scripts/sweep-project-profiles.mjs [options]",
      "",
      "Options:",
      "  --workspace-root <path>  Workspace root containing sibling repos (default: parent of apt-principles)",
      "  --repos <a,b,c>          Optional comma-separated repo names to include",
      "  --date <YYYY-MM-DD>      Output date stamp (default: today)",
      "  --help, -h               Show this help",
    ].join("\n") + "\n",
  );
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function discoverRepos(workspaceRoot, includeRepos) {
  const childEntries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
  return childEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== "apt-principles")
    .filter((name) => !includeRepos || includeRepos.includes(name))
    .filter((name) => fs.existsSync(path.join(workspaceRoot, name, "package.json")))
    .sort();
}

function validateProfile(schema, profile) {
  const errors = [];
  const missing = (schema.required ?? []).filter((key) => !(key in profile));
  if (missing.length) {
    errors.push(`Missing required keys: ${missing.join(", ")}`);
  }

  if (schema.properties?.adoption_mode?.enum) {
    if (!schema.properties.adoption_mode.enum.includes(profile.adoption_mode)) {
      errors.push(`Invalid adoption_mode: ${profile.adoption_mode}`);
    }
  }

  if (schema.properties?.maturity?.enum && profile.maturity) {
    if (!schema.properties.maturity.enum.includes(profile.maturity)) {
      errors.push(`Invalid maturity: ${profile.maturity}`);
    }
  }

  if ("showcase" in profile) {
    const showcase = profile.showcase;
    const validShowcase =
      typeof showcase === "object" &&
      showcase !== null &&
      typeof showcase.include === "boolean" &&
      typeof showcase.summary === "string";

    if (!validShowcase) {
      errors.push("Invalid showcase object: expected { include: boolean, summary: string }");
    }
  }

  return errors;
}

function findLatestAuditReport(repoRoot) {
  const reportsDir = path.join(repoRoot, "docs", "apt", "reports");
  if (!fs.existsSync(reportsDir)) {
    return null;
  }

  const reportNames = fs
    .readdirSync(reportsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^apt-principles-audit-\d{4}-\d{2}-\d{2}\.md$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (!reportNames.length) {
    return null;
  }

  return path.join(reportsDir, reportNames.at(-1));
}

function cleanCellValue(value) {
  return value.replace(/`/g, "").replace(/\s+/g, " ").trim();
}

function parseMarkdownTableRows(tableSection, ignoredHeaders = []) {
  const rows = [];
  let currentRow = null;

  for (const rawLine of tableSection.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("|")) {
      if (currentRow) {
        rows.push(currentRow);
      }
      currentRow = line;
      continue;
    }

    if (currentRow) {
      currentRow = `${currentRow} ${line}`;
    }
  }

  if (currentRow) {
    rows.push(currentRow);
  }

  return rows.filter((line) => {
    if (line.includes("---")) {
      return false;
    }
    return !ignoredHeaders.some((header) => line.includes(header));
  });
}

function extractFindings(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return [];
  }

  const content = readText(reportPath);
  const findingsMatch = content.match(/## Findings\r?\n([\s\S]*?)\r?\n## Rubric/);
  if (!findingsMatch) {
    return [];
  }

  const findingRows = parseMarkdownTableRows(findingsMatch[1], ["Severity", "APT layer", "Finding"]);

  return findingRows.map((line) => {
    const rowMatch = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([\s\S]+?)\s*\|\s*[\s\S]*$/);
    const cells = rowMatch
      ? [rowMatch[1], rowMatch[2], rowMatch[3]].map((cell) => cleanCellValue(cell))
      : line.split("|").slice(1, -1).map((cell) => cleanCellValue(cell));

    return {
      severity: cells[0] ?? "Unknown",
      layer: cells[1] ?? "Unknown",
      finding: cells[2] ?? "No finding text found",
    };
  });
}

function extractRubricScores(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return [];
  }

  const content = readText(reportPath);
  const rubricMatch = content.match(/## Rubric\r?\n([\s\S]*?)\r?\n## Evidence Sampled/);
  if (!rubricMatch) {
    return [];
  }

  const rubricRows = parseMarkdownTableRows(rubricMatch[1], ["APT layer", "Score", "Evidence"]);

  return rubricRows.map((line) => {
    const rowMatch = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*[\s\S]*$/);
    const cells = rowMatch
      ? [rowMatch[1], rowMatch[2]].map((cell) => cleanCellValue(cell))
      : line.split("|").slice(1, -1).map((cell) => cleanCellValue(cell));

    return {
      layer: cells[0] ?? "Unknown",
      score: cells[1] ?? "Unknown",
    };
  });
}

function extractTopActions(reportPath, maxActions = 3) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return [];
  }

  const content = readText(reportPath);
  const recommendationsMatch = content.match(/## Remediation Recommendations\r?\n([\s\S]*?)\r?\n(?:Prefer actions|## Validation Evidence)/);
  if (!recommendationsMatch) {
    return [];
  }

  return recommendationsMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, "").replace(/`/g, "").trim())
    .slice(0, maxActions);
}

function normalizeSeverity(value) {
  const normalized = value.toLowerCase().trim();
  if (normalized.includes("block")) {
    return "Blocking";
  }
  if (normalized.includes("major")) {
    return "Major";
  }
  if (normalized.includes("minor")) {
    return "Minor";
  }
  return "Other";
}

function normalizeScore(value) {
  const normalized = value.toLowerCase().replace(/`/g, "").trim();
  if (normalized === "pass") {
    return "pass";
  }
  if (normalized === "partial") {
    return "partial";
  }
  if (normalized === "gap") {
    return "gap";
  }
  if (normalized === "not applicable") {
    return "not_applicable";
  }
  return "other";
}

function aggregateFindingsBySeverity(repoResults) {
  const groups = {
    Blocking: 0,
    Major: 0,
    Minor: 0,
    Other: 0,
  };

  for (const result of repoResults) {
    for (const finding of result.findings ?? []) {
      groups[normalizeSeverity(finding.severity)] += 1;
    }
  }

  return groups;
}

function aggregateFindingsByLayer(repoResults) {
  const groups = {};

  for (const result of repoResults) {
    for (const finding of result.findings ?? []) {
      const layer = finding.layer || "Unknown";
      groups[layer] = (groups[layer] ?? 0) + 1;
    }
  }

  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function aggregateRubricByLayer(repoResults) {
  const groups = {};

  for (const result of repoResults) {
    for (const scoreEntry of result.rubric_scores ?? []) {
      const layer = scoreEntry.layer || "Unknown";
      const score = normalizeScore(scoreEntry.score);

      if (!groups[layer]) {
        groups[layer] = {
          pass: 0,
          partial: 0,
          gap: 0,
          not_applicable: 0,
          other: 0,
        };
      }

      groups[layer][score] += 1;
    }
  }

  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])),
  );
}

function buildPortfolioActionQueue(repoResults, maxItems = 10) {
  const queue = [];

  for (const result of repoResults) {
    for (const action of result.top_actions ?? []) {
      queue.push({ repo: result.repo, action });
    }
  }

  return queue.slice(0, maxItems);
}

function buildRepoResult(workspaceRoot, repoName, schema) {
  const repoRoot = path.join(workspaceRoot, repoName);
  const profilePath = path.join(repoRoot, "docs", "apt", "references", "project-profile.json");
  const reportDir = path.join(repoRoot, "docs", "apt", "reports", "static");
  const auditReportPath = findLatestAuditReport(repoRoot);

  if (!fs.existsSync(profilePath)) {
    return {
      repo: repoName,
      repo_root: toPosix(repoRoot),
      profile_path: toPosix(profilePath),
      report_dir: toPosix(reportDir),
      audit_report_path: auditReportPath ? toPosix(auditReportPath) : null,
      findings: [],
      top_findings: [],
      rubric_scores: [],
      top_actions: [],
      status: "skipped",
      errors: ["project-profile.json not found"],
    };
  }

  const profile = readJson(profilePath);
  const errors = validateProfile(schema, profile);
  const findings = extractFindings(auditReportPath);

  return {
    repo: repoName,
    repo_root: toPosix(repoRoot),
    profile_path: toPosix(profilePath),
    report_dir: toPosix(reportDir),
    audit_report_path: auditReportPath ? toPosix(auditReportPath) : null,
    findings,
    top_findings: findings.slice(0, 2),
    rubric_scores: extractRubricScores(auditReportPath),
    top_actions: extractTopActions(auditReportPath),
    status: errors.length ? "failed" : "passed",
    errors,
  };
}

function writeRepoSummary(repoResult, workspaceSummary, auditDate) {
  if (repoResult.status === "skipped") {
    return null;
  }

  fs.mkdirSync(repoResult.report_dir, { recursive: true });
  const outputPath = path.join(repoResult.report_dir, `project-profile-validation-sweep-${auditDate}.json`);
  const payload = {
    generated_at: new Date().toISOString(),
    audit_date: auditDate,
    source: "apt-principles/scripts/sweep-project-profiles.mjs",
    repo: repoResult.repo,
    repo_root: repoResult.repo_root,
    profile_path: repoResult.profile_path,
    audit_report_path: repoResult.audit_report_path,
    findings: repoResult.findings,
    top_findings: repoResult.top_findings,
    rubric_scores: repoResult.rubric_scores,
    top_actions: repoResult.top_actions,
    status: repoResult.status,
    errors: repoResult.errors,
    workspace_summary: workspaceSummary,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return toPosix(outputPath);
}

function writeWorkspaceMasterSummary(aptPrinciplesRoot, workspaceSummary, auditDate) {
  const reportsDir = path.join(aptPrinciplesRoot, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const outputPath = path.join(reportsDir, `project-profile-validation-sweep-${auditDate}.json`);
  const payload = {
    generated_at: new Date().toISOString(),
    audit_date: auditDate,
    source: "apt-principles/scripts/sweep-project-profiles.mjs",
    scope: "workspace-master-summary",
    workspace_summary: workspaceSummary,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return toPosix(outputPath);
}

function buildMarkdownList(items) {
  if (!items.length) {
    return "- none";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function buildCountList(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) {
    return "- none";
  }

  return entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function buildMarkdownTable(repoResults) {
  const rows = repoResults.map((result) => {
    const errorSummary = result.errors.length
      ? result.errors.join("; ")
      : result.top_findings.length
        ? result.top_findings.map((finding) => `${finding.severity}: ${finding.finding}`).join(" / ")
        : "none";
    return `| ${result.repo} | ${result.status} | ${errorSummary} |`;
  });

  return [
    "| Repo | Status | Notes |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

function buildFindingsSection(repoResults) {
  const sections = [];

  for (const result of repoResults) {
    sections.push(`### ${result.repo}`);
    sections.push("");
    if (!result.top_findings.length) {
      sections.push("- No audit findings available in the latest local report.");
      sections.push("");
      continue;
    }

    for (const finding of result.top_findings) {
      sections.push(`- ${finding.severity} / ${finding.layer}: ${finding.finding}`);
    }
    sections.push("");
  }

  return sections.join("\n");
}

function buildRubricSummaryTable(rubricSummary) {
  const preferredOrder = ["Thinking", "Design", "Architecture", "Security"];
  const allLayers = Object.keys(rubricSummary);
  const orderedLayers = [
    ...preferredOrder.filter((layer) => allLayers.includes(layer)),
    ...allLayers.filter((layer) => !preferredOrder.includes(layer)).sort((a, b) => a.localeCompare(b)),
  ];

  const rows = orderedLayers.map((layer) => {
    const counts = rubricSummary[layer];
    return `| ${layer} | ${counts.pass} | ${counts.partial} | ${counts.gap} | ${counts.not_applicable} |`;
  });

  return [
    "| APT Layer | Pass | Partial | Gap | Not Applicable |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function buildActionQueueSection(actionQueue) {
  if (!actionQueue.length) {
    return "- none";
  }

  return actionQueue.map((item) => `- ${item.repo}: ${item.action}`).join("\n");
}

function writeWorkspaceMarkdownSummary(aptPrinciplesRoot, workspaceSummary, auditDate) {
  const reportsDir = path.join(aptPrinciplesRoot, "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const outputPath = path.join(reportsDir, `project-profile-validation-sweep-${auditDate}.md`);
  const content = [
    "---",
    `title: Project Profile Validation Sweep ${auditDate}`,
    "version: v1",
    `last_updated: ${auditDate}`,
    "owner: APT",
    "status: draft",
    "---",
    "",
    `# Project Profile Validation Sweep ${auditDate}`,
    "",
    "## Summary",
    "",
    `- Workspace root: \`${workspaceSummary.workspace_root}\``,
    `- Repos scanned: ${workspaceSummary.repos_scanned}`,
    `- Passed: ${workspaceSummary.passed.length}`,
    `- Failed: ${workspaceSummary.failed.length}`,
    `- Skipped: ${workspaceSummary.skipped.length}`,
    "",
    "## Principle Coverage (Rubric)",
    "",
    buildRubricSummaryTable(workspaceSummary.rubric_summary_by_layer),
    "",
    "## Findings by Severity",
    "",
    buildCountList(workspaceSummary.findings_by_severity),
    "",
    "## Findings by APT Layer",
    "",
    buildCountList(workspaceSummary.findings_by_layer),
    "",
    "## Repo Status",
    "",
    buildMarkdownTable(workspaceSummary.results),
    "",
    "## Top Findings",
    "",
    buildFindingsSection(workspaceSummary.results),
    "",
    "## Passed",
    "",
    buildMarkdownList(workspaceSummary.passed),
    "",
    "## Failed",
    "",
    buildMarkdownList(workspaceSummary.failed),
    "",
    "## Skipped",
    "",
    buildMarkdownList(workspaceSummary.skipped),
    "",
    "## Portfolio Action Queue",
    "",
    buildActionQueueSection(workspaceSummary.action_queue),
    "",
    "## Notes",
    "",
    "Use the sibling repo JSON summaries under `docs/apt/reports/static/` for local detail and this report for a fast portfolio-level view.",
    "",
  ].join("\n");

  fs.writeFileSync(outputPath, content, "utf8");
  return toPosix(outputPath);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const aptPrinciplesRoot = path.resolve(scriptDir, "..");
  const workspaceRoot = args.workspaceRoot ?? path.resolve(aptPrinciplesRoot, "..");
  const schemaPath = path.join(aptPrinciplesRoot, "references", "project-profile.schema.json");

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema not found: ${schemaPath}`);
  }

  const schema = readJson(schemaPath);
  const repoNames = discoverRepos(workspaceRoot, args.repos);

  if (!repoNames.length) {
    throw new Error(`No target repos found in workspace root: ${workspaceRoot}`);
  }

  const repoResults = repoNames.map((repoName) => buildRepoResult(workspaceRoot, repoName, schema));
  const workspaceSummary = {
    workspace_root: toPosix(workspaceRoot),
    repos_scanned: repoResults.length,
    passed: repoResults.filter((result) => result.status === "passed").map((result) => result.repo),
    failed: repoResults.filter((result) => result.status === "failed").map((result) => result.repo),
    skipped: repoResults.filter((result) => result.status === "skipped").map((result) => result.repo),
    findings_by_severity: aggregateFindingsBySeverity(repoResults),
    findings_by_layer: aggregateFindingsByLayer(repoResults),
    rubric_summary_by_layer: aggregateRubricByLayer(repoResults),
    action_queue: buildPortfolioActionQueue(repoResults),
    results: repoResults,
  };

  const writtenFiles = [];
  for (const repoResult of repoResults) {
    const outputPath = writeRepoSummary(repoResult, workspaceSummary, args.auditDate);
    if (outputPath) {
      writtenFiles.push(outputPath);
    }
  }

  const masterOutputPath = writeWorkspaceMasterSummary(aptPrinciplesRoot, workspaceSummary, args.auditDate);
  const markdownOutputPath = writeWorkspaceMarkdownSummary(aptPrinciplesRoot, workspaceSummary, args.auditDate);

  process.stdout.write(`Repos scanned: ${workspaceSummary.repos_scanned}\n`);
  process.stdout.write(`Passed: ${workspaceSummary.passed.length}\n`);
  process.stdout.write(`Failed: ${workspaceSummary.failed.length}\n`);
  process.stdout.write(`Skipped: ${workspaceSummary.skipped.length}\n`);
  process.stdout.write(`Workspace summary: ${masterOutputPath}\n`);
  process.stdout.write(`Workspace markdown summary: ${markdownOutputPath}\n`);
  for (const outputPath of writtenFiles) {
    process.stdout.write(`Wrote: ${outputPath}\n`);
  }

  if (workspaceSummary.failed.length) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
