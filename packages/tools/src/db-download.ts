#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { $ } from 'zx';

import { CONFIG, validateConfig } from './config.js';

validateConfig();

const { local, remote } = CONFIG;

// Ensure local backup directory exists
if (!existsSync(local.backupDir)) {
  mkdirSync(local.backupDir, { recursive: true });
  console.log(`Created backup directory: ${local.backupDir}`);
}

console.log('Connecting to remote server...');
console.log(`  Host: ${remote.user}@${remote.host}:${remote.port}`);
console.log(`  Path: ${remote.backupPath}`);

try {
  // Resolve the latest symlink to get actual filename
  const result =
    await $`ssh -p ${remote.port} ${remote.user}@${remote.host} "readlink -f ${remote.backupPath}/latest-* 2>/dev/null || ls -t ${remote.backupPath}/*.archive.gz 2>/dev/null | head -1"`.quiet();
  const latestBackup = result.stdout.trim();

  if (!latestBackup) {
    console.error('No backup files found on remote server.');
    process.exit(1);
  }

  const backupFileName = latestBackup.split('/').pop()!;
  const localFilePath = `${local.backupDir}/${backupFileName}`;

  // Check if we already have this backup
  if (existsSync(localFilePath)) {
    console.log(`Backup already exists locally: ${backupFileName}`);
    console.log('Skipping download.');
  } else {
    console.log(`Latest backup: ${backupFileName}`);
    console.log('Downloading backup...');
    await $`scp -P ${remote.port} ${remote.user}@${remote.host}:${latestBackup} ${local.backupDir}/`;
    console.log(`Downloaded to: ${localFilePath}`);
  }

  // List local backups
  const localFiles = readdirSync(local.backupDir)
    .filter((f) => f.endsWith('.gz'))
    .sort()
    .reverse();
  console.log(`\nLocal backups (${localFiles.length}):`);
  localFiles.slice(0, 5).forEach((f) => console.log(`  - ${f}`));
  if (localFiles.length > 5) {
    console.log(`  ... and ${localFiles.length - 5} more`);
  }
} catch (error) {
  console.error('Failed to download backup:', error);
  process.exit(1);
}
