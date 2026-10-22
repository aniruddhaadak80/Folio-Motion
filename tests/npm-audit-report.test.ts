import { describe, expect, it } from "vitest";
import { classifyAudit, parseAudit, summariseAudit } from "../scripts/npm-audit-report.mjs";

/**
 * The audit report feeds a scheduled workflow that opens a pull request, so
 * the classification has to be right: a package that is called fixable but
 * is not produces a pull request that changes nothing, and one that is called
 * unfixable but is not means a real advisory never gets closed.
 */

const REPORT = {
  vulnerabilities: {
    braces: {
      name: "braces",
      severity: "high",
      isDirect: false,
      range: "<3.0.3",
      fixAvailable: { name: "braces", version: "3.0.3", isSemVerMajor: false },
    },
    "source-map-js": {
      name: "source-map-js",
      severity: "moderate",
      isDirect: false,
      range: "<1.2.1",
      fixAvailable: false,
    },
    vite: {
      name: "vite",
      severity: "high",
      isDirect: true,
      range: "<7.2.2",
      fixAvailable: { name: "vite", version: "7.2.2", isSemVerMajor: true },
    },
  },
  metadata: { vulnerabilities: { critical: 0, high: 2, moderate: 1, total: 3 } },
};

describe("parseAudit", () => {
  it("reads a report", () => {
    expect(parseAudit(JSON.stringify(REPORT))).not.toBeNull();
  });

  it("returns null for something that is not a report", () => {
    expect(parseAudit("not json")).toBeNull();
    expect(parseAudit("")).toBeNull();
    expect(parseAudit("null")).toBeNull();
    expect(parseAudit("42")).toBeNull();
  });
});

describe("classifyAudit", () => {
  const { fixable, major, unfixable } = classifyAudit(REPORT);

  it("separates the advisories that have a fix from the ones that do not", () => {
    expect(fixable.map((a) => a.name)).toEqual(["braces"]);
    expect(unfixable.map((a) => a.name)).toEqual(["source-map-js"]);
  });

  it("keeps a major version bump out of the automatically applied list", () => {
    // `npm audit fix` will not install a fix that falls outside the range
    // the dependency asked for.
    expect(major.map((a) => a.name)).toEqual(["vite"]);
    expect(fixable.map((a) => a.name)).not.toContain("vite");
  });

  it("records the version that resolves the advisory", () => {
    const braces = fixable.find((a) => a.name === "braces");
    expect(braces?.fixVersion).toBe("3.0.3");
  });

  it("records the severity, the range and whether the dependency is direct", () => {
    const vite = major.find((a) => a.name === "vite");
    expect(vite?.severity).toBe("high");
    expect(vite?.range).toBe("<7.2.2");
    expect(vite?.direct).toBe(true);
  });

  it("sorts the most serious advisory first", () => {
    expect(fixable[0]?.severity).toBe("high");
  });

  it("copes with a report that has no vulnerabilities at all", () => {
    const empty = classifyAudit({});
    expect(empty.fixable).toEqual([]);
    expect(empty.major).toEqual([]);
    expect(empty.unfixable).toEqual([]);
  });
});

describe("summariseAudit", () => {
  const summary = summariseAudit(REPORT);

  it("counts what can and cannot be applied", () => {
    expect(summary).toContain("applies **1**");
    expect(summary).toContain("**1** need a major version bump");
    expect(summary).toContain("**1** have no fix published");
  });

  it("names the packages and the version that fixes them", () => {
    expect(summary).toContain("`braces`");
    expect(summary).toContain("`3.0.3`");
    expect(summary).toContain("`source-map-js`");
  });

  it("says so when the audit is clean", () => {
    expect(summariseAudit({ vulnerabilities: {} })).toContain("clean");
  });
});
