#!/usr/bin/env node
import { $ } from 'zx';
import { CONFIG } from './config.js';
import { existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { resolve } from 'path';

$.verbose = false;

const { local } = CONFIG;

// Check backup directory exists
if (!existsSync(local.backupDir)) {
  console.error(`Backup directory not found: ${local.backupDir}`);
  console.error('Run "yarn files:download" first to fetch a backup.');
  process.exit(1);
}

// Find the latest volume backup file
const backupFiles = readdirSync(local.backupDir)
  .filter((f) => f.startsWith('backup-') && f.endsWith('.tar.gz'))
  .map((f) => ({
    name: f,
    path: resolve(local.backupDir, f),
    mtime: statSync(resolve(local.backupDir, f)).mtime,
  }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

if (backupFiles.length === 0) {
  console.error('No volume backup files found.');
  console.error('Run "yarn files:download" first to fetch a backup.');
  process.exit(1);
}

const latestBackup = backupFiles[0];
console.log(`Latest local volume backup: ${latestBackup.name}`);
console.log(`  Modified: ${latestBackup.mtime.toLocaleString()}`);

// Ensure files directory exists
if (!existsSync(local.filesDir)) {
  mkdirSync(local.filesDir, { recursive: true });
}

console.log(`\nExtracting to: ${local.filesDir}`);

try {
  // Extract the tarball
  // The volume backup contains parse_uploads/* so we need to strip that prefix
  await $`tar -xzf ${latestBackup.path} -C ${local.filesDir} --strip-components=1`;

  console.log('\nExtraction complete!');

  // Show what was extracted
  const extractedDirs = readdirSync(local.filesDir);
  console.log('\nExtracted contents:');
  for (const dir of extractedDirs) {
    const dirPath = resolve(local.filesDir, dir);
    const stat = statSync(dirPath);
    if (stat.isDirectory()) {
      const files = readdirSync(dirPath);
      console.log(`  ${dir}/ (${files.length} files)`);
    } else {
      console.log(`  ${dir}`);
    }
  }
} catch (error) {
  console.error('Failed to extract volume backup:', error);
  process.exit(1);
}
