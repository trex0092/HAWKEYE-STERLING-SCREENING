#!/usr/bin/env node
// Verifies that the repository's required governance / community-health files
// are present. Hermetic and dependency-free so it can gate CI without flakiness.
// Run locally with: node scripts/check-governance.mjs

import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  // Community health
  "README.md",
  "LICENSE",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "AUTHORS",
  // Governance
  "GOVERNANCE.md",
  "MAINTAINERS.md",
  "ROADMAP.md",
  "REVIEWING.md",
  "RELEASING.md",
  "TRIAGE.md",
  "CITATION.cff",
  "SECURITY-INSIGHTS.yml",
  // GitHub config
  ".github/SUPPORT.md",
  ".github/CODEOWNERS",
  ".github/FUNDING.yml",
  ".github/dependabot.yml",
  ".github/settings.yml",
  ".github/labels.yml",
  ".github/labeler.yml",
  ".github/release-drafter.yml",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/documentation.yml",
  ".github/ISSUE_TEMPLATE/task.yml",
  // Workflows
  ".github/workflows/ci.yml",
  ".github/workflows/e2e.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/dependency-review.yml",
  ".github/workflows/scorecard.yml",
  ".github/workflows/stale.yml",
  ".github/workflows/labeler.yml",
  ".github/workflows/labels.yml",
  ".github/workflows/release-drafter.yml",
  ".github/workflows/pr-title-lint.yml",
  ".github/workflows/greetings.yml",
  ".github/workflows/links.yml",
  ".github/workflows/governance-check.yml",
  // Docs
  "docs/ARCHITECTURE.md",
  "docs/adr/README.md",
  "docs/governance/README.md",
  "docs/governance/github-community-compliance.md",
  // Security contact
  "public/.well-known/security.txt",
];

const results = await Promise.all(
  required.map(async (rel) => {
    try {
      await access(join(root, rel), constants.F_OK);
      return { rel, ok: true };
    } catch {
      return { rel, ok: false };
    }
  }),
);

const missing = results.filter((r) => !r.ok).map((r) => r.rel);

if (missing.length > 0) {
  console.error("✖ Missing required governance files:");
  for (const rel of missing) console.error(`  - ${rel}`);
  console.error(
    `\n${missing.length} missing of ${required.length} required. See docs/governance/github-community-compliance.md`,
  );
  process.exit(1);
}

console.log(`✔ All ${required.length} required governance files are present.`);
