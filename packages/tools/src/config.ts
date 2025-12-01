import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, '../.env') });

export const CONFIG = {
  remote: {
    host: process.env.REMOTE_HOST || '',
    user: process.env.REMOTE_USER || '',
    port: process.env.REMOTE_PORT || '22',
    backupPath: process.env.REMOTE_BACKUP_PATH || '',
    volumeBackupPath: process.env.REMOTE_VOLUME_BACKUP_PATH || '',
  },
  local: {
    backupDir: resolve(__dirname, process.env.LOCAL_BACKUP_DIR || '../../../db-backup'),
    filesDir: resolve(__dirname, '../../backend/files'),
    mongoContainer: 'untendurch-mongodb',
    mongoDb: 'untendurch',
    mongoUser: 'untendurch',
    mongoPassword: 'untendurch',
  },
};

export function validateConfig() {
  const { remote } = CONFIG;
  if (!remote.host || !remote.user || !remote.backupPath) {
    console.error('Missing required environment variables.');
    console.error('Copy .env.example to .env and configure:');
    console.error('  - REMOTE_HOST');
    console.error('  - REMOTE_USER');
    console.error('  - REMOTE_BACKUP_PATH');
    process.exit(1);
  }
}
