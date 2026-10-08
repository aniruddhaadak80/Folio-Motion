#!/usr/bin/env node
/**
 * Security audit script
 * Runs npm audit and exits with non-zero if any vulnerabilities are found.
 */
import { execSync } from 'child_process';

try {
  console.log('Running npm audit...');
  // Run npm audit with moderate level (as used in CI)
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  console.log('No vulnerabilities found.');
} catch (error) {
  console.error('Security audit failed:');
  console.error(error.message);
  process.exit(1);
}