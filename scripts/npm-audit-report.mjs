#!/usr/bin/env node
/**
 * Summarise `npm audit` output.
 *
 * The CI gate fails the build on critical advisories and reports the rest
 * without failing. This script does the reporting half in a shape a scheduled
 * workflow can act on: it separates the advisories `npm audit fix` can
 * resolve from the ones it cannot, and prints a markdown summary that can go
 * straight into a pull request body.
 *
 *   node scripts/npm-audit-report.mjs                 # runs `npm audit --json`
 *   node scripts/npm-audit-report.mjs report.json     # reads a saved report
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Severity order, most serious first. */
export const SEVERITIES = ["critical", "high", "moderate", "low", "info"];

/**
 * Turn raw JSON into an audit report.
 *
 * Returns null when the input is not a report, so a broken run is reported as
 * "could not read the report" rather than as "no advisories".
 */
export function parseAudit(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Split the advisories into the ones `npm audit fix` can resolve, the ones
 * that need a major version bump, and the ones that have no fix at all.
 *
 * A fix is available when npm names the version that resolves the advisory.
 * Without one there is nothing to apply, which is the case for the two
 * transitive findings the CI already reports and cannot close.
 *
 * A semver-major fix is a third thing: `npm audit fix` will not install it,
 * because doing so would break the range every dependent asked for. It is
 * reported separately so it is not counted as either applied or hopeless.
 */
export function classifyAudit(report) {
  const vulnerabilities = (report && report.vulnerabilities) || {};
  const fixable = [];
  const major = [];
  const unfixable = [];

  for (const [name, entry] of Object.entries(vulnerabilities)) {
    const fix = entry.fixAvailable;
    const hasFix = Boolean(fix) && typeof fix === "object";
    const record = {
      name,
      severity: entry.severity ?? "unknown",
      direct: Boolean(entry.isDirect),
      range: entry.range ?? "",
      // `fixAvailable` is `false` when there is no fix, or an object naming
      // the version that fixes it.
      fixVersion: hasFix ? (fix.version ?? null) : null,
      // A major bump has to be done by hand, so it is never applied here.
      major: hasFix ? Boolean(fix.isSemVerMajor) : false,
    };

    if (!record.fixVersion) unfixable.push(record);
    else if (record.major) major.push(record);
    else fixable.push(record);
  }

  const bySeverity = (a, b) => {
    const rank = SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);
    return rank !== 0 ? rank : a.name.localeCompare(b.name);
  };
  fixable.sort(bySeverity);
  major.sort(bySeverity);
  unfixable.sort(bySeverity);

  return { fixable, major, unfixable };
}

/**
 * A markdown summary for the pull request body.
 *
 * It names the packages, their severity and the version that fixes them,
 * because a list of advisory names on their own is not actionable.
 */
export function summariseAudit(report) {
  const { fixable, major, unfixable } = classifyAudit(report);

  if (fixable.length === 0 && major.length === 0 && unfixable.length === 0) {
    return "No advisories. `npm audit` is clean.";
  }

  const lines = [
    `\`npm audit fix\` applies **${fixable.length}** advisory(ies) without changing any dependency range. **${major.length}** need a major version bump and **${unfixable.length}** have no fix published at all.`,
    "",
  ];

  if (fixable.length > 0) {
    lines.push("### Applied by `npm audit fix`", "");
    lines.push("| Package | Severity | Affected range | Fixed in |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of fixable) {
      lines.push(`| \`${item.name}\` | ${item.severity} | \`${item.range}\` | \`${item.fixVersion}\` |`);
    }
    lines.push("");
  }

  if (major.length > 0) {
    lines.push("### Needs a major version bump", "");
    lines.push(
      "`npm audit fix` will not install these, because the fix falls outside the range the dependencies ask for. The version below is the one npm would upgrade to.",
      "",
    );
    lines.push("| Package | Severity | Affected range | Upgrade to |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of major) {
      lines.push(`| \`${item.name}\` | ${item.severity} | \`${item.range}\` | \`${item.fixVersion}\` |`);
    }
    lines.push("");
  }

  if (unfixable.length > 0) {
    lines.push("### No published fix", "");
    lines.push("| Package | Severity | Affected range |");
    lines.push("| --- | --- | --- |");
    for (const item of unfixable) {
      lines.push(`| \`${item.name}\` | ${item.severity} | \`${item.range}\` |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Read the report from a file, or run `npm audit --json` to get one. */
function readReport() {
  const file = process.argv[2];
  if (file) return readFileSync(file, "utf8");

  // npm audit exits non-zero when it finds anything, so the exit code is not
  // an error here. The report on stdout is what matters.
  const result = spawnSync("npm", ["audit", "--json"], { encoding: "utf8", shell: true });
  return result.stdout ?? "";
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const report = parseAudit(readReport());
  if (!report) {
    console.error("Could not read the npm audit report.");
    process.exit(1);
  }
  console.log(summariseAudit(report));
}
