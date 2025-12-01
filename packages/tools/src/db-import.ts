#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { $ } from 'zx';

import { CONFIG } from './config.js';

$.verbose = false;

const { local } = CONFIG;

// Check backup directory exists
if (!existsSync(local.backupDir)) {
  console.error(`Backup directory not found: ${local.backupDir}`);
  console.error('Run "yarn db:download" first to fetch a backup.');
  process.exit(1);
}

// Find the latest backup file (supports both .archive.gz and .gz formats)
const backupFiles = readdirSync(local.backupDir)
  .filter((f) => f.endsWith('.gz') && !f.endsWith('.md5'))
  .map((f) => ({
    mtime: statSync(resolve(local.backupDir, f)).mtime,
    name: f,
    path: resolve(local.backupDir, f),
  }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

if (backupFiles.length === 0) {
  console.error('No backup files found.');
  console.error('Run "yarn db:download" first to fetch a backup.');
  process.exit(1);
}

const latestBackup = backupFiles[0];
console.log(`Latest local backup: ${latestBackup.name}`);
console.log(`  Modified: ${latestBackup.mtime.toLocaleString()}`);

// Check if MongoDB container is running
try {
  const result =
    await $`docker ps --filter name=${local.mongoContainer} --format {{.Names}}`;
  if (!result.stdout.trim()) {
    throw new Error('Container not running');
  }
} catch {
  console.error(`MongoDB container "${local.mongoContainer}" is not running.`);
  console.error(
    'Start it with: yarn workspace @untendurch/backend run db:start'
  );
  process.exit(1);
}

// The backup path inside the container (mounted via docker-compose.dev.yml)
const containerBackupPath = `/db-backup/${latestBackup.name}`;

console.log('\nImporting to local MongoDB...');
console.log(`  Container: ${local.mongoContainer}`);
console.log(`  Database: ${local.mongoDb}`);

try {
  // Drop existing database first
  console.log('\nDropping existing database...');
  await $`docker exec ${local.mongoContainer} mongosh -u ${local.mongoUser} -p ${local.mongoPassword} --authenticationDatabase ${local.mongoDb} ${local.mongoDb} --quiet --eval ${'db.dropDatabase()'}`;

  // Restore from backup
  // The tiredofit/docker-db-backup creates archives with --archive flag
  console.log('Restoring from backup...');
  await $`docker exec ${local.mongoContainer} mongorestore --gzip --archive=${containerBackupPath} --drop -u ${local.mongoUser} -p ${local.mongoPassword} --authenticationDatabase ${local.mongoDb}`;

  console.log('\nImport complete!');

  // Show collection stats
  const stats =
    await $`docker exec ${local.mongoContainer} mongosh -u ${local.mongoUser} -p ${local.mongoPassword} --authenticationDatabase ${local.mongoDb} ${local.mongoDb} --quiet --eval ${'db.getCollectionNames()'}`;
  console.log('\nCollections:');
  console.log(stats.stdout);
} catch (error) {
  console.error('Failed to import backup:', error);
  process.exit(1);
}
