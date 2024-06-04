import { cacheDirectory, initializeDirectories } from '../../../directories.js';
import fs from 'fs';

Parse.Cloud.job('clearCaches', async (request) => {
  //  @ts-expect-error outdated types
  //  eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { log } = request;

  if (fs.existsSync(cacheDirectory)) {
    fs.rmSync(cacheDirectory, { recursive: true, force: true });
    initializeDirectories();
  }

  log.info('Cache directory cleared');
});
