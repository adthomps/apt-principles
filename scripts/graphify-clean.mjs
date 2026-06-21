#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defaultStagingRoot, GRAPHIFY_STAGING_DIR_NAME } from "./graphify-config.mjs";

function isInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function removeDirectory(targetPath, allowedRoots) {
  const resolvedTarget = path.resolve(targetPath);
  const allowed = allowedRoots.some((root) => isInside(resolvedTarget, path.resolve(root)));

  if (!allowed) {
    throw new Error(`Refusing to remove outside allowed roots: ${resolvedTarget}`);
  }

  if (!fs.existsSync(resolvedTarget)) {
    process.stdout.write(`Not found: ${resolvedTarget}\n`);
    return;
  }

  fs.rmSync(resolvedTarget, { recursive: true, force: true });
  process.stdout.write(`Removed: ${resolvedTarget}\n`);
}

function main() {
  const aptPrinciplesRoot = path.resolve(process.cwd());
  const tempRoot = path.resolve(process.env.TEMP ?? process.env.TMP ?? aptPrinciplesRoot);
  const allowedRoots = [aptPrinciplesRoot, tempRoot];

  const targets = [
    path.join(aptPrinciplesRoot, "graphify-out"),
    path.join(aptPrinciplesRoot, ".graphify-workspace"),
    path.join(aptPrinciplesRoot, GRAPHIFY_STAGING_DIR_NAME),
    defaultStagingRoot(aptPrinciplesRoot),
  ];

  process.stdout.write("Cleaning local Graphify artifacts\n");
  for (const target of targets) {
    removeDirectory(target, allowedRoots);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}

