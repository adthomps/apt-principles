import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export const DEFAULT_GRAPHIFY_REPOS = [
  "apt-principles",
  "apt-agent-standards",
  "applied-practical-thinking",
  "apt-coach",
  "apt-dream-to-reality",
  "apt-novel-reviewer",
  "apt-payment-rpc-api",
  "crt-world",
];

export const GRAPHIFY_STAGING_DIR_NAME = "apt-graphify-workspace";

export const NOISY_GRAPH_SOURCES = [
  "playwright-cli/",
  ".wrangler/",
  "output/playwright/",
  "apps/web/public/docs/apt/",
  "docs/apt/reports/static/",
  "project-profile-validation-sweep-",
];

export function localBinCommand(commandName) {
  const executable = process.platform === "win32" ? `${commandName}.exe` : commandName;
  const localBin = process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, ".local", "bin", executable)
    : null;

  return localBin && fs.existsSync(localBin) ? localBin : commandName;
}

export function graphifyCommand() {
  return localBinCommand("graphify");
}

export function uvCommand() {
  return localBinCommand("uv");
}

export function defaultStagingRoot(aptPrinciplesRoot) {
  return path.join(process.env.TEMP ?? process.env.TMP ?? aptPrinciplesRoot, GRAPHIFY_STAGING_DIR_NAME);
}

export function graphifyToolEnvironmentRoot() {
  return process.env.APPDATA ? path.join(process.env.APPDATA, "uv", "tools", "graphifyy") : null;
}

export function hasOpenAiPackage() {
  const toolRoot = graphifyToolEnvironmentRoot();
  return Boolean(toolRoot && fs.existsSync(path.join(toolRoot, "Lib", "site-packages", "openai")));
}

