#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const DEFAULT_REPO_COMMANDS = [
  {
    repo: "apt-novel-reviewer",
    runner: "pnpm",
    commands: ["lint", "typecheck", "test"],
  },
  {
    repo: "crt-world",
    runner: "pnpm",
    commands: ["lint", "typecheck", "test"],
  },
];

function parseArgs(argv) {
  const args = {
    workspaceRoot: null,
    repos: null,
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
      "Usage: node scripts/run-all-checks.mjs [options]",
      "",
      "Runs:",
      "  1. npm run validate",
      "  2. npm run sweep:project-profiles",
      "  3. selected sibling repo quality commands",
      "",
      "Options:",
      "  --workspace-root <path>  Override sibling workspace root",
      "  --repos <a,b,c>          Limit repo checks to the listed repos",
      "  --help, -h               Show this help",
    ].join("\n") + "\n",
  );
}

function compactOutput(output) {
  const normalized = output.replace(/\r/g, "").trim();
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.slice(-5).join(" | ");
}

function runCommand(command, args, cwd, label) {
  const result = spawnSync(command, args, {
    cwd,
    shell: true,
    encoding: "utf8",
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const summary = compactOutput(`${stdout}\n${stderr}`);
  const exitCode = result.status ?? 1;

  return {
    label,
    cwd,
    command: `${command} ${args.join(" ")}`.trim(),
    exitCode,
    ok: exitCode === 0,
    summary,
  };
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
  const repoConfigs = DEFAULT_REPO_COMMANDS.filter(
    (config) => !args.repos || args.repos.includes(config.repo),
  );

  const checks = [
    {
      label: "apt-principles:validate",
      cwd: aptPrinciplesRoot,
      command: "npm",
      args: ["run", "validate"],
    },
    {
      label: "apt-principles:sweep",
      cwd: aptPrinciplesRoot,
      command: "npm",
      args: ["run", "sweep:project-profiles"],
    },
    ...repoConfigs.flatMap((config) =>
      config.commands.map((repoCommand) => ({
        label: `${config.repo}:${repoCommand}`,
        cwd: path.join(workspaceRoot, config.repo),
        command: config.runner,
        args: [repoCommand],
      })),
    ),
  ];

  const results = checks.map((check) => runCommand(check.command, check.args, check.cwd, check.label));
  const failed = results.filter((result) => !result.ok);

  process.stdout.write("APT operator check summary\n");
  process.stdout.write(`Workspace root: ${workspaceRoot}\n`);
  process.stdout.write(`Checks run: ${results.length}\n`);
  process.stdout.write(`Passed: ${results.length - failed.length}\n`);
  process.stdout.write(`Failed: ${failed.length}\n\n`);

  for (const result of results) {
    const status = result.ok ? "PASS" : "FAIL";
    process.stdout.write(`[${status}] ${result.label}\n`);
    if (result.summary) {
      process.stdout.write(`  ${result.summary}\n`);
    }
  }

  if (failed.length) {
    process.stdout.write("\nFailed checks:\n");
    for (const result of failed) {
      process.stdout.write(`- ${result.label} (${result.command}) in ${result.cwd}\n`);
    }
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}