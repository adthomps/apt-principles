#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { DEFAULT_GRAPHIFY_REPOS, graphifyCommand, hasOpenAiPackage } from "./graphify-config.mjs";

function run(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
  });
}

function main() {
  const aptPrinciplesRoot = path.resolve(process.cwd());
  const workspaceRoot = path.resolve(aptPrinciplesRoot, "..");
  const graphifyPath = graphifyCommand();
  const graphify = run(graphifyPath, ["--version"]);
  const missingRepos = DEFAULT_GRAPHIFY_REPOS.filter((repo) => !fs.existsSync(path.join(workspaceRoot, repo)));

  process.stdout.write("APT Graphify readiness check\n");
  process.stdout.write(`Workspace root: ${workspaceRoot}\n`);
  process.stdout.write(`Repos expected: ${DEFAULT_GRAPHIFY_REPOS.length}\n`);
  process.stdout.write(`Repo set: ${DEFAULT_GRAPHIFY_REPOS.join(", ")}\n`);

  if (graphify.status === 0) {
    process.stdout.write(`Graphify: ${graphify.stdout.trim() || "available"}\n`);
  } else if (fs.existsSync(graphifyPath)) {
    process.stdout.write(`Graphify: installed but not runnable from this shell (${graphifyPath})\n`);
    const details = (graphify.stderr || graphify.error?.message || "").trim();
    if (details) {
      process.stdout.write(`Graphify detail: ${details}\n`);
    }
  } else {
    process.stdout.write("Graphify: missing from PATH\n");
    process.stdout.write("Install prerequisites: Python 3.10+, uv, then `uv tool install graphifyy`.\n");
  }

  if (missingRepos.length) {
    process.stdout.write(`Missing repos: ${missingRepos.join(", ")}\n`);
  } else {
    process.stdout.write("Workspace repos: present\n");
  }

  if (process.env.OPENAI_API_KEY) {
    process.stdout.write("OpenAI semantic backend: OPENAI_API_KEY is set\n");
  } else {
    process.stdout.write("OpenAI semantic backend: OPENAI_API_KEY is not set\n");
  }

  if (hasOpenAiPackage()) {
    process.stdout.write("OpenAI Python package: installed in Graphify tool environment\n");
  } else {
    process.stdout.write("OpenAI Python package: missing from Graphify tool environment\n");
    process.stdout.write("Install it with: npm run graphify:install-openai\n");
  }

  if (graphify.status !== 0 || graphify.error || missingRepos.length) {
    process.exitCode = 1;
  }
}

main();
