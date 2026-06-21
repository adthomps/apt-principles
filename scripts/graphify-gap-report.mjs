#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { graphifyCommand, NOISY_GRAPH_SOURCES } from "./graphify-config.mjs";

const QUERIES = [
  {
    title: "Doctrine-first evidence in apt-principles",
    prompt: "Using only nodes and edges under apt-principles/, identify strongest evidence links between canonical doctrine docs and enforcement artifacts (checklists, prompts, references, templates, scripts).",
  },
  {
    title: "Doctrine-to-enforcement gaps in apt-principles",
    prompt: "Within apt-principles/ only, where do doctrine concepts appear weakly linked to checklists, prompts, references, templates, or validation scripts? Prefer source-backed candidates.",
  },
  {
    title: "Cross-repo findings after doctrine baseline",
    prompt: "After doctrine baseline, list notable cross-repo links between apt-principles doctrine/enforcement assets and sibling repos, highlighting likely implementation evidence and drift candidates.",
  },
  {
    title: "Cross-repo drift candidates",
    prompt: "Which concepts look duplicated, renamed, or split across repos in ways that could create APT knowledge drift relative to apt-principles canonical terminology?",
  },
  {
    title: "Remediation queue by APT layer",
    prompt: "Group the most actionable remediation opportunities by APT layer: Thinking, Design, Architecture, Security, AI, Execution, Knowledge, Operations, Quality, Release, and System Standards. Prioritize apt-principles evidence first, then cross-repo items.",
  },
  {
    title: "Canonical chain coverage per APT layer",
    prompt: "For each APT layer (Thinking, Design, Architecture, Security, AI, Execution, Knowledge, Operations, Quality, Release, System Standards), report whether the canonical doctrine doc in apt-principles links to or is supported by: a checklist, a prompt, an example, and a reference artifact. Flag any layer missing one or more artifact types.",
  },
  {
    title: "AI agent readiness and traversal clusters",
    prompt: "Which principle and enforcement clusters in apt-principles are most completely linked for AI agent traversal? Identify the 3-5 strongest doctrine-to-enforcement chains an AI agent could follow to answer framework coverage questions, and note which layers lack sufficient cross-reference density for confident AI-assisted review.",
  },
];

function parseArgs(argv) {
  const args = {
    date: new Date().toISOString().slice(0, 10),
    graph: "graphify-out/graph.json",
    allowNoisy: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--date") {
      args.date = argv[index + 1];
      index += 1;
    } else if (arg === "--graph") {
      args.graph = argv[index + 1];
      index += 1;
    } else if (arg === "--allow-noisy") {
      args.allowNoisy = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function runGraphifyQuery(prompt, graphPath) {
  const result = spawnSync(graphifyCommand(), ["query", prompt, "--graph", graphPath, "--budget", "4000"], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return `Graphify query failed.\n\n${(result.stderr || result.stdout || "").trim()}`;
  }

  return result.stdout.trim() || "No graph response returned.";
}

function latestSweepSummary(reportsDir) {
  const reports = fs
    .readdirSync(reportsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^project-profile-validation-sweep-\d{4}-\d{2}-\d{2}\.md$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (!reports.length) {
    return "No project profile validation sweep report found.";
  }

  const latestPath = path.join(reportsDir, reports.at(-1));
  const content = fs.readFileSync(latestPath, "utf8");
  const queue = content.split("## Portfolio Action Queue")[1]?.split("## Notes")[0]?.trim();
  return queue ? `Source: \`${path.basename(latestPath)}\`\n\n${queue}` : `Source: \`${path.basename(latestPath)}\``;
}

function graphHygieneWarnings(graphPath) {
  const content = fs.readFileSync(graphPath, "utf8");
  return NOISY_GRAPH_SOURCES.filter((source) => content.includes(source));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(process.cwd());
  const reportsDir = path.join(root, "reports");
  const graphPath = path.resolve(root, args.graph);

  if (!fs.existsSync(graphPath)) {
    throw new Error(`Missing graph file: ${graphPath}. Run npm run graphify:apt first.`);
  }

  fs.mkdirSync(reportsDir, { recursive: true });
  const sections = [
    "---",
    `title: Graphify APT Gap Analysis ${args.date}`,
    "version: v1",
    `last_updated: ${args.date}`,
    "owner: APT",
    "status: draft",
    "---",
    "",
    `# Graphify APT Gap Analysis ${args.date}`,
    "",
    "## Summary",
    "",
    "This report uses the local Graphify workspace graph to collect raw traversal evidence for APT-wide knowledge, doctrine, implementation, and evidence gaps. It complements the deterministic APT validator and project-profile sweep; it does not replace either gate.",
    "",
    "Graphify `query` returns nearby nodes and edges, not a polished narrative answer. Treat the sections below as evidence to inspect, then promote only source-supported findings into project-profile remediation or doctrine updates.",
    "",
    `Graph source: \`${path.relative(root, graphPath).replaceAll("\\", "/")}\``,
    "",
  ];

  const noisySources = graphHygieneWarnings(graphPath);
  if (noisySources.length && !args.allowNoisy) {
    throw new Error(
      `Graph hygiene failed: found noisy sources (${noisySources.join(", ")}). Rebuild graph input or rerun with --allow-noisy to bypass.`
    );
  }

  if (noisySources.length) {
    sections.push(
      "## Graph Hygiene Warning",
      "",
      "This graph still contains generated, runtime, or validation-output paths that should be excluded from APT analysis:",
      "",
      ...noisySources.map((source) => `- \`${source}\``),
      "",
      "Rebuild the graph with the current staging filters before treating traversal results as useful evidence:",
      "",
      "```bash",
      "npm run graphify:apt -- --force",
      "npm run graphify:gaps",
      "```",
      "",
    );
  }

  for (const query of QUERIES) {
    sections.push(`## ${query.title}`, "", runGraphifyQuery(query.prompt, graphPath), "");
  }

  sections.push("## Known Validation Drift Candidates", "", latestSweepSummary(reportsDir), "");
  sections.push("## Recommended Next Pass", "");
  sections.push("- Convert high-confidence Graphify findings into project-profile remediation items.");
  sections.push("- Update canonical doctrine only when the graph finding is supported by source evidence.");
  sections.push("- Re-run `npm run validate`, `npm run sweep:project-profiles`, and this report after remediation.");
  sections.push("");

  const outputPath = path.join(reportsDir, `graphify-apt-gap-analysis-${args.date}.md`);
  fs.writeFileSync(outputPath, `${sections.join("\n")}\n`);
  process.stdout.write(`Wrote ${outputPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
