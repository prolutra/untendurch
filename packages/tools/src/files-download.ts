#!/usr/bin/env node
import { $ } from 'zx';
import { CONFIG, validateConfig } from './config.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';

$.verbose = false;

validateConfig();

const { remote, local } = CONFIG;

if (!remote.volumeBackupPath) {
  console.error('REMOTE_VOLUME_BACKUP_PATH not configured in .env');
  process.exit(1);
}

// Ensure local backup directory exists
if (!existsSync(local.backupDir)) {
  mkdirSync(local.backupDir, { recursive: true });
}

console.log('Connecting to remote server...');
console.log(`  Host: ${remote.user}@${remote.host}:${remote.port}`);
console.log(`  Path: ${remote.volumeBackupPath}`);

try {
  // Find the latest volume backup file on remote
  const result =
    await $`ssh -p ${remote.port} ${remote.user}@${remote.host} "ls -t ${remote.volumeBackupPath}/*.tar.gz 2>/dev/null | head -1"`;
  const latestBackup = result.stdout.trim();

  if (!latestBackup) {
    console.error('No volume backup files found on remote server.');
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
    console.log('Downloading volume backup...');
    await $`scp -P ${remote.port} ${remote.user}@${remote.host}:${latestBackup} ${local.backupDir}/`;
    console.log(`Downloaded to: ${localFilePath}`);
  }

  // List local volume backups
  const localFiles = readdirSync(local.backupDir)
    .filter((f) => f.startsWith('backup-') && f.endsWith('.tar.gz'))
    .sort()
    .reverse();
  console.log(`\nLocal volume backups (${localFiles.length}):`);
  localFiles.slice(0, 5).forEach((f) => console.log(`  - ${f}`));
  if (localFiles.length > 5) {
    console.log(`  ... and ${localFiles.length - 5} more`);
  }
} catch (error) {
  console.error('Failed to download volume backup:', error);
  process.exit(1);
}
