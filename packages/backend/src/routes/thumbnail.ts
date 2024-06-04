import express from 'express';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { isString, toNumber } from 'lodash-es';
import { thumbnailDirectory } from '../directories.js';
import { PARSE_SERVER_URL } from '../config.js';

const thumbnailRoute = express.Router();

type Query = {
  url: string;
  devicePixels: string;
};

thumbnailRoute.get('/thumbnail', async (req, res) => {
  const { url, devicePixels } = req.query as Query;

  const width = Math.ceil(320 * (toNumber(devicePixels) || 1));
  const height = Math.ceil(200 * (toNumber(devicePixels) || 1));

  if (!url) {
    return res.status(400).send({ error: 'Missing URL parameter' });
  }

  if (!isString(url)) {
    return res.status(400).send({ error: 'URL parameter must be a string' });
  }

  if (!url.includes(PARSE_SERVER_URL.split('//')[1])) {
    return res.status(400).send({
      error: 'Invalid URL',
      url,
      serverUrl: PARSE_SERVER_URL,
    });
  }

  const filename = `${devicePixels}_${path.basename(url)}`;
  const cachePathFilename = path.join(thumbnailDirectory, filename);

  if (fs.existsSync(cachePathFilename)) {
    return res.sendFile(cachePathFilename);
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    console.log(url);

    const imgSharp = sharp(buffer);
    const thumbnail = await imgSharp
      .rotate()
      .resize({ width, height, fit: 'inside' })
      .sharpen()
      .jpeg({ quality: 70 })
      .toBuffer();

    fs.writeFileSync(cachePathFilename, thumbnail);

    res.sendFile(cachePathFilename);
  } catch (error) {
    console.error(`Failed to fetch or resize image: ${error}`);
    res.status(500).send('Failed to fetch or resize image');
  }
});

export { thumbnailRoute };
