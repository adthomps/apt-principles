#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function parseArgs() {
  const out = { repoRoot: process.cwd() };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo-root' || a === '-r') {
      out.repoRoot = argv[++i] || out.repoRoot;
    }
  }
  return out;
}

const { repoRoot } = parseArgs();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(scriptDir, '..', 'references', 'project-profile.schema.json');
const profilePath = path.resolve(repoRoot, 'docs', 'apt', 'references', 'project-profile.json');

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) fail(`Schema not found: ${schemaPath}`);
if (!fs.existsSync(profilePath)) fail(`Project profile not found: ${profilePath}`);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(profilePath, 'utf8'));

// Check required keys
const missing = (schema.required || []).filter((k) => !(k in data));
if (missing.length) fail(`Missing required keys: ${missing.join(', ')}`);

// Enum checks for adoption_mode and maturity (if present in schema)
if (schema.properties?.adoption_mode?.enum) {
  if (!schema.properties.adoption_mode.enum.includes(data.adoption_mode)) {
    fail(`Invalid adoption_mode: ${data.adoption_mode}`);
  }
}
if (schema.properties?.maturity?.enum && data.maturity) {
  if (!schema.properties.maturity.enum.includes(data.maturity)) {
    fail(`Invalid maturity: ${data.maturity}`);
  }
}

// Basic showcase object shape
if ('showcase' in data) {
  const s = data.showcase;
  if (typeof s !== 'object' || s === null || typeof s.include !== 'boolean' || typeof s.summary !== 'string') {
    fail('Invalid showcase object: expected { include: boolean, summary: string }');
  }
}

console.log('Project profile JSON passed validation:', profilePath);
process.exit(0);
