import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { PARSE_SERVER_ROOT_URL } from '../config.js';
import { uploadsDirectory } from '../directories.js';

const uploadRoute = express.Router();

// Configure multer to store uploaded files in the cache/uploads directory
const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: function (req, file, cb) {
    // Generate a unique name for the file using uuid
    const uniqueName = `${uuidv4()}-${file.originalname.replace(/[^a-z0-9.]/gi, '')}`;
    cb(null, uniqueName);
  },
});

// Configure multer to store uploaded files in the cache/uploads directory
const upload = multer({ storage });

uploadRoute.post(
  '/upload',
  cors({
    origin: '*',
  }),
  upload.array('images', 10),
  async (req, res) => {
    const files = req.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).send({ error: 'Missing image files' });
    }

    console.log(
      'Uploading images:',
      files.map((file) => file.originalname)
    );

    try {
      const processedImages = [];

      for (const file of files) {
        console.log('Processing image:', file.originalname);
        const originalName = file.originalname;
        const uploadPathFilename = path.join(uploadsDirectory, originalName);

        const buffer = fs.readFileSync(file.path);

        const imgSharp = sharp(buffer);
        const metadata = await imgSharp.metadata();

        console.log(
          `Image metadata: ${metadata.width}x${metadata.height}, ${Math.ceil((metadata.size || 0) / 1024)} kb`
        );

        const processedImage = await imgSharp
          .rotate()
          .resize(2000)
          .jpeg({ quality: 80 })
          .toBuffer();

        const newMeta = await sharp(processedImage).metadata();

        if (newMeta.width && newMeta.height && newMeta.width > newMeta.height) {
          fs.writeFileSync(uploadPathFilename, new Uint8Array(processedImage));
          const url = `${PARSE_SERVER_ROOT_URL}/uploads/${file.filename}`;
          processedImages.push({ isValid: true, name: file.originalname, url });
        } else {
          processedImages.push({
            error: 'PORTRAIT_MODE_NOT_SUPPORTED',
            isValid: false,
          });
        }
      }

      console.log('Processed images:', processedImages);

      res.send({ images: processedImages });
    } catch (error) {
      console.error(`Failed to resize images: ${error}`);
      res.status(500).send('Failed to resize images');
    }
  }
);

export { uploadRoute };
