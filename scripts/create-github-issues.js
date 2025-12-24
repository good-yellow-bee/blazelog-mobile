#!/usr/bin/env node

/**
 * Script to create GitHub issues from github-issues.json
 *
 * Prerequisites:
 *   - GitHub CLI (gh) installed and authenticated
 *   - Run from repository root
 *
 * Usage:
 *   node scripts/create-github-issues.js [--dry-run] [--labels-only] [--phase=X]
 *
 * Options:
 *   --dry-run      Print commands without executing
 *   --labels-only  Only create labels, skip issues
 *   --phase=X      Only create issues for specific phase (e.g., --phase=0)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const labelsOnly = args.includes('--labels-only');
const phaseArg = args.find((a) => a.startsWith('--phase='));
const targetPhase = phaseArg ? phaseArg.split('=')[1] : null;

const dataPath = path.join(__dirname, '..', 'github-issues.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function exec(cmd, options = {}) {
  console.log(`\n$ ${cmd}`);
  if (dryRun) {
    console.log('  (dry run - skipped)');
    return '';
  }
  try {
    return execSync(cmd, { encoding: 'utf8', ...options });
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return null;
  }
}

function createLabels() {
  console.log('\n=== Creating Labels ===\n');

  for (const label of data.labels) {
    const cmd = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`;
    exec(cmd);
  }
}

function createIssues() {
  console.log('\n=== Creating Issues ===\n');

  const issues = targetPhase
    ? data.issues.filter((i) => i.id.startsWith(`P${targetPhase}-`))
    : data.issues;

  console.log(`Creating ${issues.length} issues...`);

  for (const issue of issues) {
    const labels = issue.labels.join(',');
    const deps =
      issue.dependencies.length > 0 ? `\n\n**Dependencies:** ${issue.dependencies.join(', ')}` : '';
    const body = issue.body + deps;

    // Use heredoc for body to handle special characters
    const cmd = `gh issue create --title "${issue.id}: ${issue.title}" --label "${labels}" --body "$(cat <<'ISSUE_BODY_EOF'
${body}
ISSUE_BODY_EOF
)"`;

    exec(cmd, { shell: '/bin/bash' });

    // Small delay to avoid rate limiting
    if (!dryRun) {
      execSync('sleep 0.5');
    }
  }
}

function main() {
  console.log('GitHub Issues Creator');
  console.log('=====================');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  if (targetPhase) console.log(`Phase filter: ${targetPhase}`);

  // Check gh is available
  try {
    execSync('gh --version', { encoding: 'utf8' });
  } catch {
    console.error('\nError: GitHub CLI (gh) not found. Install from https://cli.github.com/');
    process.exit(1);
  }

  createLabels();

  if (!labelsOnly) {
    createIssues();
  }

  console.log('\n=== Done ===\n');
}

main();
