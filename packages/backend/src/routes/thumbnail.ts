import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { imagesDirectory, thumbnailDirectory } from '../directories.js';

const thumbnailRoute = express.Router();

type Query = {
  devicePixels?: string;
  filename?: string;
  url?: string;
};

thumbnailRoute.get('/image/:filename', (req, res) => {
  const imageFilename = path.basename(req.params.filename);
  const sourcePath = path.join(imagesDirectory, imageFilename);

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({
      error: 'Image not found',
      filename: imageFilename,
    });
  }

  res.sendFile(sourcePath);
});

thumbnailRoute.get('/thumbnail', async (req, res) => {
  const { devicePixels, filename, url } = req.query as Query;

  // Support both filename and url parameters for backwards compatibility
  let imageFilename: string | undefined;

  if (filename) {
    imageFilename = path.basename(filename);
  } else if (url) {
    imageFilename = path.basename(url);
  }

  if (!imageFilename) {
    return res.status(400).json({
      error: 'Missing filename or url parameter',
    });
  }

  const pixels = Number(devicePixels) || 1;
  const width = Math.ceil(320 * pixels);
  const height = Math.ceil(200 * pixels);

  const cacheFilename = `${pixels}_${imageFilename}`;
  const cachePath = path.join(thumbnailDirectory, cacheFilename);

  // Return cached thumbnail if exists
  if (fs.existsSync(cachePath)) {
    return res.sendFile(cachePath);
  }

  // Find source image directly from filesystem
  const sourcePath = path.join(imagesDirectory, imageFilename);

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({
      error: 'Image not found',
      filename: imageFilename,
    });
  }

  try {
    const thumbnail = await sharp(sourcePath)
      .rotate()
      .resize({ fit: 'inside', height, width })
      .sharpen()
      .jpeg({ quality: 70 })
      .toBuffer();

    fs.writeFileSync(cachePath, new Uint8Array(thumbnail));
    res.sendFile(cachePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Failed to generate thumbnail for ${imageFilename}:`,
      message
    );
    res.status(500).json({
      error: 'Failed to generate thumbnail',
      filename: imageFilename,
      message,
    });
  }
});

export { thumbnailRoute };
