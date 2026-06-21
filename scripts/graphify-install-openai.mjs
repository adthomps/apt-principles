#!/usr/bin/env node

import process from "node:process";
import { spawnSync } from "node:child_process";
import { uvCommand } from "./graphify-config.mjs";

const result = spawnSync(uvCommand(), ["tool", "install", "graphifyy", "--with", "openai", "--force"], {
  stdio: "inherit",
});

process.exitCode = result.status ?? 1;
