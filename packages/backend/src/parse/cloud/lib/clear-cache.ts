import fs from 'fs';

import { cacheDirectory, initializeDirectories } from '../../../directories.js';

Parse.Cloud.job('clearCaches', async (request) => {
  //  @ts-expect-error outdated types

  const { log } = request;

  if (fs.existsSync(cacheDirectory)) {
    fs.rmSync(cacheDirectory, { force: true, recursive: true });
    initializeDirectories();
  }

  log.info('Cache directory cleared');
});
