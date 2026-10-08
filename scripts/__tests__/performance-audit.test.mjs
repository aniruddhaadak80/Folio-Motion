import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

describe('performance-audit.mjs', () => {
  it('should exist', () => {
    const path = fileURLToPath(import.meta.url);
    const scriptPath = path.replace('__tests__/performance-audit.test.mjs', '../performance-audit.mjs');
    expect(() => statSync(scriptPath)).not.toThrow();
  });
});