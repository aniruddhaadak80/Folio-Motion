import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { statSync } from 'fs';

describe('accessibility-audit.mjs', () => {
  it('should exist', () => {
    // Resolved from the project root rather than from import.meta.url: the
    // test environment is jsdom, where that URL is an http one and cannot be
    // turned into a path. The old string replace also only matched on Linux,
    // where it then pointed one directory too high.
    const scriptPath = join(process.cwd(), 'scripts', 'accessibility-audit.mjs');
    expect(() => statSync(scriptPath)).not.toThrow();
  });
});