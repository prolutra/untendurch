import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { imagesDirectory, thumbnailDirectory } from '../../../directories.js';

type ThumbnailParams = {
  devicePixels?: number;
  filename: string;
};

Parse.Cloud.define('thumbnail', async (req) => {
  const { devicePixels = 1, filename } = req.params as ThumbnailParams;

  if (!filename) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing filename');
  }

  // Sanitize filename to prevent directory traversal
  const sanitizedFilename = path.basename(filename);
  const cacheFilename = `${devicePixels}_${sanitizedFilename}`;
  const cachePath = path.join(thumbnailDirectory, cacheFilename);

  // Return cached thumbnail if exists
  if (fs.existsSync(cachePath)) {
    return { cached: true, path: `/cache/thumbnails/${cacheFilename}` };
  }

  // Find source image
  const sourcePath = path.join(imagesDirectory, sanitizedFilename);

  if (!fs.existsSync(sourcePath)) {
    throw new Parse.Error(
      Parse.Error.OBJECT_NOT_FOUND,
      `Image not found: ${sanitizedFilename}`
    );
  }

  // Generate thumbnail
  const width = Math.ceil(320 * devicePixels);
  const height = Math.ceil(200 * devicePixels);

  try {
    const thumbnail = await sharp(sourcePath)
      .rotate()
      .resize({ fit: 'inside', height, width })
      .sharpen()
      .jpeg({ quality: 70 })
      .toBuffer();

    fs.writeFileSync(cachePath, new Uint8Array(thumbnail));

    return { cached: false, path: `/cache/thumbnails/${cacheFilename}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      `Failed to generate thumbnail: ${message}`
    );
  }
});
