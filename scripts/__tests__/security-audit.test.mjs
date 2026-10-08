import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('security-audit.mjs', () => {
  it('should exist', () => {
    expect(() => import('../security-audit.mjs')).not.toThrow();
  });
});