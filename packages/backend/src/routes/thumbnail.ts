import express from 'express';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path, { resolve } from 'path';

const __dirname = import.meta.dirname;

const thumbnailRoute = express.Router();

const projectRoot = resolve(__dirname, '../..');

thumbnailRoute.get('/thumbnail', async (req, res) => {
  const { url } = req.query;

  const width = 320;
  const height = 200;
  const cacheDir = path.join(projectRoot, 'cache', 'thumbnails');

  // Create the cache directory recursively if it does not exist
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  if (!url) {
    return res.status(400).send({ error: 'Missing URL parameter' });
  }

  if (typeof url !== 'string') {
    return res.status(400).send({ error: 'URL parameter must be a string' });
  }

  if (!url.includes(process.env.PARSE_SERVER_URL.split('//')[1])) {
    return res.status(400).send({
      error: 'Invalid URL',
      url,
      serverUrl: process.env.PARSE_SERVER_URL,
    });
  }

  const filename = path.basename(url);
  const cachePath = path.join(cacheDir, filename);

  // Check if the image is already cached
  if (fs.existsSync(cachePath)) {
    return res.sendFile(cachePath);
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const imgSharp = sharp(buffer);
    const metadata = await imgSharp.metadata();

    let thumbnail;
    if (metadata.width && metadata.height && metadata.height > metadata.width) {
      // If the image is in portrait mode, select the center region and resize it to landscape mode
      thumbnail = await imgSharp
        .extract({
          left: 0,
          top: Math.ceil((metadata.height - metadata.width) / 2),
          width: metadata.width,
          height: metadata.width,
        })
        .resize(width, height) // Resize to 200x200 pixels
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();
    } else {
      thumbnail = await imgSharp
        .resize(width, height) // Resize to 200x200 pixels
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();
    }

    // Save the thumbnail to the cache directory
    fs.writeFileSync(cachePath, thumbnail);

    // Serve the thumbnail
    res.sendFile(cachePath);
  } catch (error) {
    console.error(`Failed to fetch or resize image: ${error}`);
    res.status(500).send('Failed to fetch or resize image');
  }
});

export { thumbnailRoute };
