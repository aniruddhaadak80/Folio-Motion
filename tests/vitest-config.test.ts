import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * The Vitest include patterns are the only thing that decides which test
 * files run.
 *
 * This repository keeps its unit tests in `tests/`, but there are also suites
 * that live next to the code they test, under `src/`, `lib/` and `scripts/`.
 * The patterns used to cover `tests/` only, so those suites were silently
 * skipped: they were not failing, they were never run, and nothing said so.
 *
 * This test is the alarm. If a test file is added somewhere the patterns do
 * not reach, it fails here instead of being quietly ignored.
 *
 * The patterns are read out of `vitest.config.mts` rather than imported: the
 * config is an `.mts` file that reads `import.meta.url`, which cannot be
 * imported from a jsdom test.
 */

const ROOT = process.cwd();

/** Directories that never contain project tests. */
const IGNORED = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "playwright-report",
  "test-results",
  ".vercel",
  ".agents",
]);

function isTestFile(name: string): boolean {
  return /\.test\.(ts|tsx|mjs)$/.test(name);
}

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORED.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, found);
    else if (isTestFile(entry)) found.push(full);
  }
  return found;
}

/** Pull the quoted globs out of the config's `include` array. */
function readIncludePatterns(source: string): string[] {
  const start = source.indexOf("include: [");
  if (start === -1) {
    throw new Error("vitest.config.mts does not declare an include array");
  }
  const end = source.indexOf("]", start);
  if (end === -1) {
    throw new Error("vitest.config.mts has an unterminated include array");
  }
  return [...source.slice(start, end).matchAll(/["'`]([^"'`]+)["'`]/g)].map((match) => match[1]!);
}

/**
 * Turn a glob into a regular expression.
 *
 * Only the subset of glob syntax the config uses is supported: `**` for any
 * number of path segments, `*` for any run of characters inside a segment.
 */
function globToRegExp(pattern: string): RegExp {
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]!;
    if (char === "*") {
      if (pattern[i + 1] === "*") {
        i++;
        if (pattern[i + 1] === "/") {
          i++;
          out += "(?:[^/]+/)*";
        } else {
          out += ".*";
        }
      } else {
        out += "[^/]*";
      }
    } else if ("+^${}()|[]\\.".includes(char)) {
      out += `\\${char}`;
    } else {
      out += char;
    }
  }
  return new RegExp(`^${out}$`);
}

const configSource = readFileSync(join(ROOT, "vitest.config.mts"), "utf8");
const include = readIncludePatterns(configSource);

describe("vitest include patterns", () => {
  const files = walk(ROOT).map((file) => relative(ROOT, file).split(sep).join("/"));

  it("declares include patterns", () => {
    expect(include.length).toBeGreaterThan(0);
  });

  it("finds the test files in the repository", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("covers the suites that live next to the code they test", () => {
    // These three directories are the ones that used to be skipped.
    expect(include.some((pattern) => pattern.startsWith("src/"))).toBe(true);
    expect(include.some((pattern) => pattern.startsWith("lib/"))).toBe(true);
    expect(include.some((pattern) => pattern.startsWith("scripts/"))).toBe(true);
  });

  it.each(files.map((file) => [file]))("%s is covered by an include pattern", (file) => {
    const matched = include.some((pattern) => globToRegExp(pattern).test(file));
    expect(matched, `${file} is not matched by any vitest include pattern`).toBe(true);
  });
});
