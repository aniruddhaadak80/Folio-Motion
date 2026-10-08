import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

describe('security-audit.mjs', () => {
  it('should exist', () => {
    const path = fileURLToPath(import.meta.url);
    const scriptPath = path.replace('__tests__/security-audit.test.mjs', '../security-audit.mjs');
    expect(() => statSync(scriptPath)).not.toThrow();
  });
});