import express from 'express';
import Parse from 'parse/node.js';
import axios from 'axios';
import { compact } from 'lodash-es';

const updateImagesRoute = express.Router();

updateImagesRoute.get('/update-images', async (req, res) => {
  Parse.initialize(
    'untendurch',
    process.env.PARSE_SERVER_MASTER_KEY,
    process.env.PARSE_SERVER_MASTER_KEY
  );
  Parse.serverURL = 'http://localhost:1337/parse';

  const Document = Parse.Object.extend('Bridge');
  const query = new Parse.Query(Document);

  query.select('objectId', 'images');
  query.limit(10000);

  await query
    .find()
    .then(async (document) => {
      for (const doc of document) {
        const images = doc.get('images');
        const newImages = []; // Array to hold the new Parse.File objects

        for (const image of images) {
          let parseFile;

          // Check if image is already a Parse.File object
          if (image instanceof Parse.File) {
            parseFile = image;
          } else {
            // If not, create a new Parse.File object
            const imageUrl =
              typeof image.url === 'string' ? image.url : image.url();
            // Check if the URL is reachable
            try {
              await axios.get(imageUrl, { timeout: 2000 });
              parseFile = new Parse.File(imageUrl.split('/').pop(), {
                uri: imageUrl,
              });
            } catch (error) {
              console.error(`Failed to reach ${imageUrl}`);
              parseFile = null;
            }
          }

          newImages.push(parseFile);
        }

        doc.set('images', compact(newImages));
        await doc.save();
      }

      res.json({ message: 'Images updated' });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

export { updateImagesRoute };
