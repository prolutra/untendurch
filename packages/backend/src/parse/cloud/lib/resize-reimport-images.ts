import axios from 'axios';
import https from 'https';
import sharp from 'sharp';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

Parse.Cloud.job(
  'Migration2024-06::resizeAndReimportImages',
  async (request) => {
    //  @ts-expect-error outdated types
    //  eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { headers, log, message, params } = request;

    const maxSide = 2000;

    const Document = Parse.Object.extend('Bridge');
    const query = new Parse.Query(Document);

    query.select('objectId', 'images');

    const blacklist = ['ffee01f829b8bbab27458e5ba6549966'];

    const documents = await query.findAll();

    const resizedImages = [];

    for (const doc of documents) {
      log.info(`Document: ${doc.id}`);

      const images = doc.get('images');
      const newImages = [];

      for (const image of images) {
        let parseFile;

        // Check if image is already a Parse.File object
        if (image instanceof Parse.File) {
          parseFile = image;
        } else {
          // If not, create a new Parse.File object
          let imageUrl =
            typeof image.url === 'function'
              ? image.url()
              : image.url
                ? image.url
                : null;

          if (!imageUrl) {
            continue;
          }

          imageUrl = imageUrl.replace(
            'untendurch.prolutra.ch',
            'untendurch.tegonal.com'
          );

          // check for partial matches on image urls
          if (
            blacklist.some((blacklistUrl) => imageUrl.includes(blacklistUrl))
          ) {
            newImages.push(null);
            continue;
          }

          log.info(`Resizing image: ${imageUrl}`);

          let response;

          try {
            response = await axios.get(imageUrl, {
              httpsAgent: agent,
              responseType: 'arraybuffer',
              timeout: 2000,
            });
          } catch (error: unknown) {
            const axiosError = error as {
              code?: string;
              config?: { url?: string };
            };
            log.error(
              axiosError.code ?? 'UNKNOWN',
              axiosError.config?.url ?? 'unknown url'
            );
            newImages.push(null);
            continue;
          }

          const imgBuffer = Buffer.from(response.data, 'binary');
          const imgSharp = sharp(imgBuffer);
          const metadata = await imgSharp.metadata();

          log.info(
            `Image metadata: ${metadata.width}x${metadata.height}, ${Math.ceil((metadata.size || 0) / 1024)} kb`
          );

          if (
            metadata.width &&
            metadata.height &&
            (metadata.width > maxSide || metadata.height > maxSide)
          ) {
            const resizedBuffer = await imgSharp
              .rotate()
              .resize({ fit: 'inside', height: maxSide, width: maxSide })
              .toFormat('jpeg', { quality: 75 })
              .toBuffer();
            log.info(
              `Resized image ${Math.ceil(resizedBuffer.length / 1024)} kb`
            );

            const file = new Parse.File('resized.jpg', {
              base64: resizedBuffer.toString('base64'),
            });
            const result = await file.save();
            log.info(`Saved resized image ${result.url()}`);
            newImages.push(file); // Add the new image to the newImages array

            resizedImages.push({
              height: metadata.height,
              size: metadata.size,
              sizeAfter: resizedBuffer.length,
              url: imageUrl,
              width: metadata.width,
            });
          } else {
            log.info('Image is already small enough');
            parseFile = new Parse.File(imageUrl.split('/').pop(), {
              base64: imgBuffer.toString('base64'),
            });
            await parseFile.save();
          }
        }

        newImages.push(parseFile);
      }

      if (newImages.length > 0) {
        log.info('Setting new images:', newImages.length);
        const images = (newImages || []).filter(Boolean);
        doc.set('images', images);
        const json = doc.toJSON();
        log.info(`Saving document ${json.objectId}`);
        try {
          await doc.save();
        } catch (error) {
          log.error('Failed to save document:', error);
        }
        log.info('Document saved');
      }
    }

    log.info('All documents saved');

    message('Resized images');
  }
);
