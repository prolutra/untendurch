#!/usr/bin/env node
import { $ } from 'zx';
import { CONFIG } from './config.js';
import {
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  rmSync,
  renameSync,
} from 'fs';
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

const imagesDir = resolve(local.filesDir, 'images');
const tempExtractDir = resolve(local.filesDir, '_extract_temp');

console.log(`\nExtracting to: ${imagesDir}`);

try {
  // Clean up temp directory if it exists
  if (existsSync(tempExtractDir)) {
    rmSync(tempExtractDir, { recursive: true });
  }
  mkdirSync(tempExtractDir, { recursive: true });

  // Extract the tarball to temp directory
  // The volume backup contains /backup/parse_uploads/images/*
  await $`tar -xzf ${latestBackup.path} -C ${tempExtractDir}`;

  // The extracted structure is: _extract_temp/backup/parse_uploads/images/*
  const extractedImagesDir = resolve(
    tempExtractDir,
    'backup',
    'parse_uploads',
    'images'
  );

  if (!existsSync(extractedImagesDir)) {
    throw new Error(
      `Expected images directory not found at: ${extractedImagesDir}`
    );
  }

  // Remove old images directory and replace with extracted one
  if (existsSync(imagesDir)) {
    console.log('Removing old images directory...');
    rmSync(imagesDir, { recursive: true });
  }

  // Move extracted images to final location
  renameSync(extractedImagesDir, imagesDir);

  // Clean up temp directory
  rmSync(tempExtractDir, { recursive: true });

  console.log('\nExtraction complete!');

  // Show what was extracted
  const files = readdirSync(imagesDir);
  console.log(`\nExtracted ${files.length} images to ${imagesDir}`);
} catch (error) {
  console.error('Failed to extract volume backup:', error);
  // Clean up temp directory on error
  if (existsSync(tempExtractDir)) {
    rmSync(tempExtractDir, { recursive: true });
  }
  process.exit(1);
}
