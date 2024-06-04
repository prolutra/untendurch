import express from 'express';
import sharp from 'sharp';
import fs from 'fs';
import path, { resolve } from 'path';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const __dirname = import.meta.dirname;

const uploadRoute = express.Router();

const projectRoot = resolve(__dirname, '../..');
const cacheDir = path.join(projectRoot, 'cache', 'uploads');

// Configure multer to store uploaded files in the cache/uploads directory
const storage = multer.diskStorage({
  destination: cacheDir,
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
        const filename = file.originalname;
        const cachePath = path.join(cacheDir, filename);

        const buffer = fs.readFileSync(file.path);

        const imgSharp = sharp(buffer);
        const metadata = await imgSharp.metadata();

        console.log(
          `Image metadata: ${metadata.width}x${metadata.height}, ${Math.ceil((metadata.size || 0) / 1024)} kb`
        );

        if (metadata.orientation) {
          switch (metadata.orientation) {
            case 1:
              break;
            case 2:
              imgSharp.flip();
              break;
            case 3:
              imgSharp.rotate(180);
              break;
            case 4:
              imgSharp.flip().rotate(180);
              break;
            case 5:
              imgSharp.flip().rotate(90);
              break;
            case 6:
              imgSharp.rotate(90);
              break;
            case 7:
              imgSharp.flip().rotate(-90);
              break;
            case 8:
              imgSharp.rotate(-90);
              break;
          }
        }

        const processedImage = await imgSharp
          .resize(2000)
          .jpeg({ quality: 80 })
          .toBuffer();
        const newMeta = await sharp(processedImage).metadata();

        if (newMeta.width && newMeta.height && newMeta.width > newMeta.height) {
          fs.writeFileSync(cachePath, processedImage);
          const serverAddr = process.env.PARSE_SERVER_URL.replace(
            process.env.PARSE_SERVER_MOUNT_PATH,
            ''
          );
          const url = `${serverAddr}/uploads/${file.filename}`;
          processedImages.push({ isValid: true, url, name: file.originalname });
        } else {
          processedImages.push({
            isValid: false,
            error:
              'Images in portrait mode are not supported and will be automatically rejected. Please upload images in landscape mode.',
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
