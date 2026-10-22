/**
 * Types for `scripts/npm-audit-report.mjs`.
 *
 * The scripts in this repository are plain JavaScript so they can run under
 * `node` without a build step. This declaration file lets the TypeScript test
 * in `tests/` import them without turning on `allowJs`.
 */

export interface AuditAdvisory {
  /** The package the advisory is about. */
  name: string;
  /** "critical" | "high" | "moderate" | "low" | "info" | "unknown". */
  severity: string;
  /** True when the advisory is in a direct dependency. */
  direct: boolean;
  /** The semver range npm reports as affected. */
  range: string;
  /** The version that resolves the advisory, or null when there is none. */
  fixVersion: string | null;
  /** True when the fix is a major version bump. */
  major: boolean;
}

export interface AuditReport {
  /** The advisories `npm audit fix` can apply without changing a range. */
  fixable: AuditAdvisory[];
  /** The advisories that need a major version bump. */
  major: AuditAdvisory[];
  /** The advisories that have no published fix. */
  unfixable: AuditAdvisory[];
}

export const SEVERITIES: readonly string[];

export function parseAudit(raw: string): unknown | null;

export function classifyAudit(report: unknown): AuditReport;

export function summariseAudit(report: unknown): string;
