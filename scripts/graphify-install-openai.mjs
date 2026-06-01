#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

function uvCommand() {
  const localBin = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, ".local", "bin", "uv.exe") : null;
  return localBin && fs.existsSync(localBin) ? localBin : "uv";
}

const result = spawnSync(uvCommand(), ["tool", "install", "graphifyy", "--with", "openai", "--force"], {
  stdio: "inherit",
});

process.exitCode = result.status ?? 1;

