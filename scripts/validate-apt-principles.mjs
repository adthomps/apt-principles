#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CANONICAL_DOCTRINE_MARKDOWN = [
  "README.md",
  "apt-principles.md",
  "thinking.md",
  "design.md",
  "architecture.md",
  "system-standards.md",
  "security.md",
  "execution.md",
  "quality-testing.md",
  "release-change-management.md",
  "operations-support.md",
  "knowledge-system.md",
  "ai-agent-framework.md",
];

const ACTIVE_AUDIT_MARKDOWN = [
  "apt-principles-framework-audit.md",
];

const REQUIRED_TOP_LEVEL_MARKDOWN = [
  ...CANONICAL_DOCTRINE_MARKDOWN,
  ...ACTIVE_AUDIT_MARKDOWN,
];

const ALLOWED_TOP_LEVEL_NON_MARKDOWN = ["package.json"];

const REQUIRED_FOLDERS = ["checklists", "examples", "prompts", "references", "templates"];
const REQUIRED_FRONTMATTER_KEYS = ["title", "version", "last_updated", "owner", "status"];

const REQUIRED_REFERENCE_FILES = [
  "references/ai-review-bundle.json",
  "references/architecture-map.json",
  "references/design-lint-gates.json",
  "references/design-tokens.json",
  "references/knowledge-contracts.json",
  "references/metadata-versioning-contract.json",
  "references/project-profile.schema.json",
];

const PRINCIPLE_DOCS = [
  "thinking.md",
  "design.md",
  "architecture.md",
  "system-standards.md",
  "security.md",
  "execution.md",
  "quality-testing.md",
  "release-change-management.md",
  "operations-support.md",
  "knowledge-system.md",
  "ai-agent-framework.md",
];

const SECTION_CONTRACTS = [
  {
    name: "principle-doc",
    appliesTo: (relativePath) => PRINCIPLE_DOCS.includes(relativePath),
    requiredSections: ["Overview", "Purpose", "Core Principles", "Standards / Rules", "Required Artifacts", "Summary"],
  },
  {
    name: "checklist",
    appliesTo: (relativePath) => relativePath.startsWith("checklists/") && relativePath.endsWith(".md"),
    requiredSections: ["Scope", "Required Checks", "Failure Conditions", "Evidence Required", "Related Documents"],
  },
  {
    name: "example",
    appliesTo: (relativePath) =>
      relativePath.startsWith("examples/") && relativePath.endsWith(".md") && relativePath !== "examples/README.md",
    requiredSections: [
      "Context",
      "Problem",
      "APT Principles Applied",
      "Solution",
      "Tradeoffs",
      "Common Mistakes",
      "Related Documents",
    ],
  },
  {
    name: "prompt",
    appliesTo: (relativePath) => relativePath.startsWith("prompts/") && relativePath.endsWith(".md"),
    requiredSections: ["Purpose", "Prompt", "Expected Output", "Guardrails", "Related Documents"],
  },
];

const MIN_ACTIVE_DOC_LENGTH = 1000;
const MIN_TEMPLATE_DOC_LENGTH = 700;

const ARTIFACT_COVERAGE = [
  {
    principle: "thinking.md",
    artifacts: [
      "checklists/thinking-review-checklist.md",
      "examples/thinking/problem-framing-example.md",
      "prompts/framework-review-prompt.md",
      "prompts/apt-one-shot-build-prompt.md",
    ],
  },
  {
    principle: "design.md",
    artifacts: [
      "checklists/design-review-checklist.md",
      "examples/ui/dashboard-layout-pattern.md",
      "examples/ui/navigation-layout-pattern.md",
      "prompts/design-review-prompt.md",
      "references/design-tokens.json",
      "references/design-lint-gates.json",
    ],
  },
  {
    principle: "architecture.md",
    artifacts: [
      "checklists/architecture-review-checklist.md",
      "examples/architecture/monorepo-layout-example.md",
      "examples/architecture/cloudflare-pages-workers-example.md",
      "prompts/architecture-review-prompt.md",
      "references/architecture-map.json",
    ],
  },
  {
    principle: "system-standards.md",
    artifacts: [
      "checklists/api-standards-checklist.md",
      "examples/api/rest-api-example.md",
      "examples/api/error-response-example.md",
      "examples/api/pagination-example.md",
      "prompts/api-review-prompt.md",
      "references/metadata-versioning-contract.json",
    ],
  },
  {
    principle: "security.md",
    artifacts: [
      "checklists/security-review-checklist.md",
      "examples/security/login-session-flow.md",
      "examples/security/magic-link-flow.md",
      "examples/security/mfa-extension.md",
      "prompts/security-review-prompt.md",
    ],
  },
  {
    principle: "execution.md",
    artifacts: [
      "checklists/execution-readiness-checklist.md",
      "examples/workflows/spec-to-story-flow.md",
      "examples/workflows/preview-to-prod-flow.md",
      "prompts/apt-one-shot-build-prompt.md",
    ],
  },
  {
    principle: "quality-testing.md",
    artifacts: [
      "checklists/quality-testing-checklist.md",
      "examples/quality/validation-plan-example.md",
      "prompts/testing-review-prompt.md",
      "references/design-lint-gates.json",
      "references/ai-review-bundle.json",
    ],
  },
  {
    principle: "release-change-management.md",
    artifacts: [
      "checklists/release-readiness-checklist.md",
      "examples/workflows/preview-to-prod-flow.md",
      "prompts/release-review-prompt.md",
      "references/metadata-versioning-contract.json",
    ],
  },
  {
    principle: "operations-support.md",
    artifacts: [
      "checklists/operations-support-checklist.md",
      "examples/workflows/preview-to-prod-flow.md",
      "prompts/operations-review-prompt.md",
    ],
  },
  {
    principle: "knowledge-system.md",
    artifacts: [
      "checklists/knowledge-system-checklist.md",
      "examples/knowledge/canonical-doc-update-example.md",
      "prompts/knowledge-review-prompt.md",
      "references/knowledge-contracts.json",
      "references/project-profile.schema.json",
    ],
  },
  {
    principle: "ai-agent-framework.md",
    artifacts: [
      "checklists/ai-agent-review-checklist.md",
      "examples/ai-agent/agent-prompt-contract-example.md",
      "prompts/framework-review-prompt.md",
      "prompts/apt-one-shot-build-prompt.md",
      "references/ai-review-bundle.json",
    ],
  },
];

const PROJECT_ADOPTION_ARTIFACTS = [
  "checklists/project-adoption-checklist.md",
  "prompts/project-adoption-prompt.md",
  "templates/project-adoption-template.md",
  "examples/projects/apt-project-profile-example.md",
  "references/project-profile.schema.json",
];

function parseArgs(argv) {
  const args = {
    root: path.resolve(process.cwd()),
    json: false,
    report: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--root requires a path");
      }
      args.root = path.resolve(process.cwd(), value);
      index += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--report") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--report requires a path");
      }
      args.report = path.resolve(process.cwd(), value);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeToRoot(root, filePath) {
  return toPosix(path.relative(root, filePath));
}

function isIgnored(relativePath) {
  return relativePath === "archive" || relativePath.startsWith("archive/");
}

function walkFiles(root) {
  const results = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relativePath = relativeToRoot(root, fullPath);
      if (isIgnored(relativePath)) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }

  walk(root);
  return results;
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    return null;
  }

  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return null;
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      data[keyMatch[1]] = keyMatch[2].trim();
    }
  }
  return data;
}

function getHeadings(markdown) {
  return [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
}

function hasSection(markdown, section) {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^##\\s+${escaped}\\s*$`, "m").test(markdown);
}

function findEmptyHeadings(markdown) {
  const empty = [];
  const matches = [...markdown.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].trim(),
    index: match.index,
    length: match[0].length,
  }));
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const nextPeerOrParent = matches
      .slice(index + 1)
      .find((candidate) => candidate.level <= current.level);
    const currentEnd = current.index + current.length;
    const nextStart = nextPeerOrParent ? nextPeerOrParent.index : markdown.length;
    const body = markdown.slice(currentEnd, nextStart).trim();
    if (!body) {
      empty.push(current.title);
    }
  }
  return empty;
}

function extractMarkdownLinks(markdown) {
  const links = [];
  const pattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(pattern)) {
    const raw = match[1].trim();
    const link = raw.split(/\s+/)[0].replace(/^<|>$/g, "");
    links.push(link);
  }
  return links;
}

function isExternalOrAnchor(link) {
  return (
    link.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(link) ||
    link.startsWith("mailto:") ||
    link.startsWith("//")
  );
}

function resolveMarkdownLink(root, fromFile, link) {
  const withoutHash = link.split("#")[0];
  if (!withoutHash || (!withoutHash.endsWith(".md") && !withoutHash.endsWith(".json"))) {
    return null;
  }
  return path.resolve(path.dirname(fromFile), decodeURIComponent(withoutHash));
}

function addIssue(collection, severity, message, relativePath = null) {
  collection.push({ severity, message, relativePath });
}

function validate(root) {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    addIssue(errors, "error", `Root does not exist or is not a directory: ${root}`);
    return { root, status: "fail", errors, warnings, files: [] };
  }

  const activeFiles = walkFiles(root);
  const activeMarkdownFiles = activeFiles.filter((file) => file.endsWith(".md"));
  const topLevelMarkdown = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
  const topLevelFiles = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  for (const expected of REQUIRED_TOP_LEVEL_MARKDOWN) {
    if (!topLevelMarkdown.includes(expected)) {
      addIssue(errors, "error", `Missing required top-level Markdown file: ${expected}`);
    }
  }

  for (const actual of topLevelMarkdown) {
    if (!REQUIRED_TOP_LEVEL_MARKDOWN.includes(actual)) {
      addIssue(errors, "error", `Unexpected active top-level Markdown file: ${actual}`);
    }
  }

  for (const actual of topLevelFiles) {
    if (actual.endsWith(".md")) {
      continue;
    }
    if (!ALLOWED_TOP_LEVEL_NON_MARKDOWN.includes(actual)) {
      addIssue(warnings, "warn", `Unexpected top-level operational file: ${actual}`);
    }
  }

  for (const folder of REQUIRED_FOLDERS) {
    const folderPath = path.join(root, folder);
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      addIssue(errors, "error", `Missing required build-kit folder: ${folder}`);
    }
  }

  for (const reference of REQUIRED_REFERENCE_FILES) {
    const referencePath = path.join(root, reference);
    if (!fs.existsSync(referencePath) || !fs.statSync(referencePath).isFile()) {
      addIssue(errors, "error", `Missing required reference file: ${reference}`);
      continue;
    }
    try {
      JSON.parse(fs.readFileSync(referencePath, "utf8"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addIssue(errors, "error", `Invalid JSON reference: ${message}`, reference);
    }
  }

  for (const artifact of PROJECT_ADOPTION_ARTIFACTS) {
    const artifactPath = path.join(root, artifact);
    if (!fs.existsSync(artifactPath) || !fs.statSync(artifactPath).isFile()) {
      addIssue(warnings, "warn", `Missing expected project adoption artifact: ${artifact}`);
    }
  }

  for (const coverage of ARTIFACT_COVERAGE) {
    const principlePath = path.join(root, coverage.principle);
    if (!fs.existsSync(principlePath) || !fs.statSync(principlePath).isFile()) {
      continue;
    }

    const principleMarkdown = fs.readFileSync(principlePath, "utf8");
    for (const artifact of coverage.artifacts) {
      const artifactPath = path.join(root, artifact);
      if (!fs.existsSync(artifactPath) || !fs.statSync(artifactPath).isFile()) {
        addIssue(warnings, "warn", `Missing expected related artifact: ${artifact}`, coverage.principle);
        continue;
      }
      if (!principleMarkdown.includes(artifact)) {
        addIssue(warnings, "warn", `Principle doc does not reference expected artifact: ${artifact}`, coverage.principle);
      }
    }
  }

  for (const file of activeMarkdownFiles) {
    const relativePath = relativeToRoot(root, file);
    const markdown = fs.readFileSync(file, "utf8");
    const frontmatter = parseFrontmatter(markdown);

    if (!frontmatter) {
      addIssue(errors, "error", "Missing YAML frontmatter block", relativePath);
    } else {
      for (const key of REQUIRED_FRONTMATTER_KEYS) {
        if (!frontmatter[key]) {
          addIssue(errors, "error", `Missing frontmatter key: ${key}`, relativePath);
        }
      }
    }

    for (const contract of SECTION_CONTRACTS) {
      if (!contract.appliesTo(relativePath)) {
        continue;
      }
      for (const section of contract.requiredSections) {
        if (!hasSection(markdown, section)) {
          addIssue(errors, "error", `Missing required ${contract.name} section: ${section}`, relativePath);
        }
      }
    }

    if (relativePath.startsWith("templates/") && markdown.length < MIN_TEMPLATE_DOC_LENGTH) {
      addIssue(warnings, "warn", `Template is short (${markdown.length} chars); confirm it provides enough authoring guidance`, relativePath);
    }

    if (!relativePath.startsWith("templates/") && markdown.length < MIN_ACTIVE_DOC_LENGTH) {
      addIssue(warnings, "warn", `File is short (${markdown.length} chars); confirm it is intentionally concise`, relativePath);
    }

    if (/\b(TODO|TBD)\b/i.test(markdown)) {
      addIssue(warnings, "warn", "Contains TODO/TBD language", relativePath);
    }

    if (!relativePath.startsWith("templates/")) {
      for (const heading of findEmptyHeadings(markdown)) {
        addIssue(warnings, "warn", `Heading has no body content: ${heading}`, relativePath);
      }
    }

    const headings = getHeadings(markdown);
    if (
      PRINCIPLE_DOCS.includes(relativePath) &&
      !headings.some((heading) => /^Related (Checklists|Examples|Prompts|Documents|Build Kit)$/.test(heading))
    ) {
      addIssue(warnings, "warn", "Principle doc has no related artifact/document section", relativePath);
    }

    for (const link of extractMarkdownLinks(markdown)) {
      if (isExternalOrAnchor(link)) {
        continue;
      }
      const resolved = resolveMarkdownLink(root, file, link);
      if (!resolved) {
        continue;
      }
      const resolvedRelative = relativeToRoot(root, resolved);
      if (isIgnored(resolvedRelative)) {
        continue;
      }
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        addIssue(errors, "error", `Broken local Markdown link: ${link}`, relativePath);
      }
    }
  }

  return {
    root,
    status: errors.length > 0 ? "fail" : "pass",
    errors,
    warnings,
    files: activeMarkdownFiles.map((file) => relativeToRoot(root, file)).sort(),
  };
}

function renderMarkdownReport(result) {
  const lines = [
    "# APT Principles Validation Report",
    "",
    `Root: \`${result.root}\``,
    `Status: **${result.status.toUpperCase()}**`,
    `Files scanned: ${result.files.length}`,
    `Errors: ${result.errors.length}`,
    `Warnings: ${result.warnings.length}`,
    "",
  ];

  if (result.errors.length) {
    lines.push("## Errors", "");
    for (const issue of result.errors) {
      lines.push(`- ${issue.relativePath ? `\`${issue.relativePath}\`: ` : ""}${issue.message}`);
    }
    lines.push("");
  }

  if (result.warnings.length) {
    lines.push("## Warnings", "");
    for (const issue of result.warnings) {
      lines.push(`- ${issue.relativePath ? `\`${issue.relativePath}\`: ` : ""}${issue.message}`);
    }
    lines.push("");
  }

  if (!result.errors.length && !result.warnings.length) {
    lines.push("No issues found.", "");
  }

  return `${lines.join("\n")}\n`;
}

function printHuman(result) {
  console.log(`APT principles validation: ${result.status.toUpperCase()}`);
  console.log(`Root: ${result.root}`);
  console.log(`Files scanned: ${result.files.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.errors.length) {
    console.log("\nErrors:");
    for (const issue of result.errors) {
      console.log(`- ${issue.relativePath ? `${issue.relativePath}: ` : ""}${issue.message}`);
    }
  }

  if (result.warnings.length) {
    console.log("\nWarnings:");
    for (const issue of result.warnings) {
      console.log(`- ${issue.relativePath ? `${issue.relativePath}: ` : ""}${issue.message}`);
    }
  }
}

function printHelp() {
  console.log(`Usage: node scripts/validate-apt-principles.mjs [options]

Options:
  --root <path>    Folder to validate. Defaults to current working directory.
  --json           Print machine-readable JSON.
  --report <path>  Write a Markdown validation report.
  --help           Show this help text.
`);
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const result = validate(args.root);

  if (args.report) {
    fs.mkdirSync(path.dirname(args.report), { recursive: true });
    fs.writeFileSync(args.report, renderMarkdownReport(result), "utf8");
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }

  process.exit(result.status === "pass" ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`APT principles validation failed to run: ${message}`);
  process.exit(1);
}
