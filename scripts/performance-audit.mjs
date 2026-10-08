#!/usr/bin/env node
/**
 * Performance audit script
 * Runs Lighthouse CI if available, otherwise provides guidance.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';

try {
  // Check if lighthouse-ci is installed locally
  const lighthouseCiPath = './node_modules/.bin/lhci';
  if (existsSync(lighthouseCiPath)) {
    console.log('Running Lighthouse CI...');
    execSync('lhci autorun', { stdio: 'inherit' });
  } else {
    console.log('Lighthouse CI not installed. Installing as dev dependency...');
    execSync('npm install --save-dev @lhci/cli@0.14.x', { stdio: 'inherit' });
    console.log('Running Lighthouse CI...');
    execSync('lhci autorun', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Performance audit failed:');
  console.error(error.message);
  process.exit(1);
}