const { readFileSync, writeFileSync } = require('node:fs');
const { execSync } = require('node:child_process');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: New version number required');
  console.error('Usage: npm run version:update <new-version>');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const jsonFiles = [
  'version.json',
  'package.json',
  'frontend/package.json',
  'backend/package.json',
  'shared/package.json',
];

for (const file of jsonFiles) {
  const data = JSON.parse(readFileSync(file, 'utf-8'));
  data.version = newVersion;
  if (file === 'version.json') {
    data.lastUpdated = today;
  }
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ${file} to ${newVersion}`);
}

execSync('npm install --package-lock-only --ignore-scripts', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });

console.log(`Version update complete: ${newVersion}`);
