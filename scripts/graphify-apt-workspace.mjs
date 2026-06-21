#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import {
  DEFAULT_GRAPHIFY_REPOS,
  defaultStagingRoot,
  graphifyCommand,
  hasOpenAiPackage,
} from "./graphify-config.mjs";

function parseArgs(argv) {
  const args = {
    workspaceRoot: null,
    stagingRoot: null,
    repos: DEFAULT_GRAPHIFY_REPOS,
    backend: "openai",
    model: process.env.GRAPHIFY_OPENAI_MODEL ?? "gpt-4o-mini",
    maxConcurrency: process.env.GRAPHIFY_MAX_CONCURRENCY ?? "1",
    tokenBudget: process.env.GRAPHIFY_TOKEN_BUDGET ?? "20000",
    force: false,
    link: false,
    noCluster: false,
    stageOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--workspace-root") {
      args.workspaceRoot = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--staging-root") {
      args.stagingRoot = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--repos") {
      args.repos = (argv[index + 1] ?? "").split(",").map((value) => value.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--backend") {
      args.backend = argv[index + 1];
      index += 1;
    } else if (arg === "--model") {
      args.model = argv[index + 1];
      index += 1;
    } else if (arg === "--max-concurrency") {
      args.maxConcurrency = argv[index + 1];
      index += 1;
    } else if (arg === "--token-budget") {
      args.tokenBudget = argv[index + 1];
      index += 1;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--link") {
      args.link = true;
    } else if (arg === "--no-cluster") {
      args.noCluster = true;
    } else if (arg === "--stage-only") {
      args.stageOnly = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function ensureCleanDirectory(directory) {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
}

function shouldStageEntry(entry) {
  const normalized = entry.replaceAll("\\", "/");
  const blockedSegments = [
    "/.git/",
    "/node_modules/",
    "/dist/",
    "/build/",
    "/.wrangler/",
    "/.next/",
    "/.turbo/",
    "/.cache/",
    "/.vite/",
    "/.vercel/",
    "/.netlify/",
    "/.output/",
    "/coverage/",
    "/playwright-cli/",
    "/playwright-report/",
    "/test-results/",
    "/output/playwright/",
    "/apps/web/public/docs/apt/",
    "/apps/web/data/generated/",
    "/docs/apt/reports/static/",
    "/graphify-out/",
    "/.graphify-workspace/",
  ];

  const blockedFiles = [
    /\/reports\/project-profile-validation-sweep-\d{4}-\d{2}-\d{2}\.json$/,
    /\/reports\/project-profile-validation-sweep-\d{4}-\d{2}-\d{2}\.md$/,
  ];

  return !blockedSegments.some((segment) => normalized.includes(segment)) &&
    !blockedFiles.some((pattern) => pattern.test(normalized));
}

function stageRepo(source, target, useLink) {
  if (useLink) {
    fs.symlinkSync(source, target, "junction");
    return;
  }

  fs.cpSync(source, target, {
    recursive: true,
    dereference: true,
    filter: shouldStageEntry,
  });
}

function countStagedFiles(directory) {
  if (!fs.existsSync(directory)) {
    return 0;
  }

  let count = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      count += countStagedFiles(entryPath);
    } else if (entry.isFile()) {
      count += 1;
    }
  }
  return count;
}

function writeStagingIgnore(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  const blockedInStaging = new Set([".graphify-workspace/"]);
  const content = fs
    .readFileSync(sourcePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => !blockedInStaging.has(line.trim()))
    .join("\n");

  fs.writeFileSync(targetPath, content.endsWith("\n") ? content : `${content}\n`);
}

function requiredBackendEnv(backend) {
  if (backend === "openai") {
    return "OPENAI_API_KEY";
  }
  if (backend === "claude") {
    return "ANTHROPIC_API_KEY";
  }
  if (backend === "gemini") {
    return "GEMINI_API_KEY or GOOGLE_API_KEY";
  }
  if (backend === "kimi") {
    return "MOONSHOT_API_KEY";
  }
  if (backend === "deepseek") {
    return "DEEPSEEK_API_KEY";
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const aptPrinciplesRoot = path.resolve(process.cwd());
  const workspaceRoot = args.workspaceRoot ?? path.resolve(aptPrinciplesRoot, "..");
  const stagingRoot = args.stagingRoot ?? defaultStagingRoot(aptPrinciplesRoot);
  const missingRepos = args.repos.filter((repo) => !fs.existsSync(path.join(workspaceRoot, repo)));

  if (missingRepos.length) {
    throw new Error(`Missing workspace repos: ${missingRepos.join(", ")}`);
  }

  ensureCleanDirectory(stagingRoot);
  if (args.force) {
    fs.rmSync(path.join(aptPrinciplesRoot, "graphify-out"), { recursive: true, force: true });
  }

  const ignorePath = path.join(aptPrinciplesRoot, ".graphifyignore");
  writeStagingIgnore(ignorePath, path.join(stagingRoot, ".graphifyignore"));

  for (const repo of args.repos) {
    stageRepo(path.join(workspaceRoot, repo), path.join(stagingRoot, repo), args.link);
  }

  const stagedFileCount = countStagedFiles(stagingRoot);
  process.stdout.write(`Staged ${args.repos.length} repos with ${stagedFileCount} files in ${stagingRoot}\n`);

  if (args.stageOnly) {
    return;
  }

  const requiredEnv = requiredBackendEnv(args.backend);
  if (requiredEnv === "GEMINI_API_KEY or GOOGLE_API_KEY") {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      throw new Error(`Backend '${args.backend}' requires ${requiredEnv} to be set.`);
    }
  } else if (requiredEnv && !process.env[requiredEnv]) {
    throw new Error(`Backend '${args.backend}' requires ${requiredEnv} to be set.`);
  }
  if (args.backend === "openai" && !hasOpenAiPackage()) {
    throw new Error("Backend 'openai' requires the Python openai package in Graphify's tool environment. Run `npm run graphify:install-openai` and retry.");
  }

  const graphifyArgs = ["extract", stagingRoot, "--out", aptPrinciplesRoot, "--backend", args.backend];
  if (args.model) {
    graphifyArgs.push("--model", args.model);
  }
  if (args.maxConcurrency) {
    graphifyArgs.push("--max-concurrency", args.maxConcurrency);
  }
  if (args.tokenBudget) {
    graphifyArgs.push("--token-budget", args.tokenBudget);
  }
  if (args.noCluster) {
    graphifyArgs.push("--no-cluster");
  }

  process.stdout.write(`Running: graphify ${graphifyArgs.map((value) => `"${value}"`).join(" ")}\n`);
  const result = spawnSync(graphifyCommand(), graphifyArgs, {
    cwd: aptPrinciplesRoot,
    stdio: "inherit",
  });

  process.exitCode = result.status ?? 1;
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
