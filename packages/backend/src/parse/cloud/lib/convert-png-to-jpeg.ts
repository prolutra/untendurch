import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { imagesDirectory } from '../../../directories.js';

type ConversionResult = {
  bridgeId: string;
  error?: string;
  newFilename?: string;
  oldFilename: string;
  success: boolean;
};

type ConversionStatus =
  | 'converting'
  | 'done'
  | 'error'
  | 'pending'
  | 'scanning';

async function runConversion(statusId: string, dryRun: boolean) {
  const results: ConversionResult[] = [];

  try {
    await updateConversionStatus(
      statusId,
      'scanning',
      5,
      'Scanning for bridges with PNG images...'
    );

    // Query all bridges
    const Bridge = Parse.Object.extend('Bridge');
    const query = new Parse.Query(Bridge);
    query.exists('images');
    query.limit(10000);

    const bridges = await query.find({ useMasterKey: true });

    // Find bridges with PNG images
    const bridgesWithPng: { bridge: Parse.Object; pngImages: Parse.File[] }[] =
      [];

    for (const bridge of bridges) {
      const images = bridge.get('images') as Parse.File[];
      if (!images || images.length === 0) continue;

      const pngImages = images.filter((img) => {
        const name = img.name().toLowerCase();
        return name.endsWith('.png');
      });

      if (pngImages.length > 0) {
        bridgesWithPng.push({ bridge, pngImages });
      }
    }

    const totalPngImages = bridgesWithPng.reduce(
      (sum, b) => sum + b.pngImages.length,
      0
    );

    await updateConversionStatus(
      statusId,
      'converting',
      10,
      `Found ${totalPngImages} PNG images in ${bridgesWithPng.length} bridges. ${dryRun ? '(Dry run - no changes will be made)' : 'Converting...'}`
    );

    if (dryRun) {
      // Just report what would be converted
      for (const { bridge, pngImages } of bridgesWithPng) {
        for (const pngImage of pngImages) {
          results.push({
            bridgeId: bridge.id,
            newFilename: pngImage.name().replace(/\.png$/i, '.jpg'),
            oldFilename: pngImage.name(),
            success: true,
          });
        }
      }

      await updateConversionStatus(
        statusId,
        'done',
        100,
        `Dry run complete. ${totalPngImages} PNG images would be converted.`,
        results
      );
      return;
    }

    // Process each bridge
    let processedImages = 0;

    for (const { bridge, pngImages: _pngImages } of bridgesWithPng) {
      void _pngImages; // Used for counting, actual processing uses currentImages
      const currentImages = bridge.get('images') as Parse.File[];
      const updatedImages: Parse.File[] = [];
      let bridgeModified = false;

      for (const image of currentImages) {
        const imageName = image.name();
        const isPng = imageName.toLowerCase().endsWith('.png');

        if (!isPng) {
          // Keep non-PNG images as-is
          updatedImages.push(image);
          continue;
        }

        try {
          // Find the file on disk
          const pngFilename = imageName;
          const pngPath = path.join(imagesDirectory, pngFilename);

          if (!fs.existsSync(pngPath)) {
            results.push({
              bridgeId: bridge.id,
              error: `File not found on disk: ${pngFilename}`,
              oldFilename: pngFilename,
              success: false,
            });
            updatedImages.push(image); // Keep original reference
            continue;
          }

          // Convert PNG to JPEG using sharp (resize to max 2000px, quality 80)
          const jpegFilename = pngFilename.replace(/\.png$/i, '.jpg');
          const jpegPath = path.join(imagesDirectory, jpegFilename);

          await sharp(pngPath)
            .rotate()
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(jpegPath);

          // Create new Parse.File for the JPEG
          const jpegBuffer = fs.readFileSync(jpegPath);
          const newParseFile = new Parse.File(jpegFilename, {
            base64: jpegBuffer.toString('base64'),
          });
          await newParseFile.save({ useMasterKey: true });

          updatedImages.push(newParseFile);
          bridgeModified = true;

          // Delete the old PNG file from disk
          fs.unlinkSync(pngPath);

          results.push({
            bridgeId: bridge.id,
            newFilename: jpegFilename,
            oldFilename: pngFilename,
            success: true,
          });

          processedImages++;
          const progress = Math.round(
            10 + (processedImages / totalPngImages) * 85
          );
          await updateConversionStatus(
            statusId,
            'converting',
            progress,
            `Converting ${processedImages}/${totalPngImages}: ${pngFilename} → ${jpegFilename}`
          );
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          results.push({
            bridgeId: bridge.id,
            error: errorMessage,
            oldFilename: imageName,
            success: false,
          });
          updatedImages.push(image); // Keep original on error
        }
      }

      // Update the bridge if any images were converted
      if (bridgeModified) {
        bridge.set('images', updatedImages);
        await bridge.save(null, { useMasterKey: true });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    await updateConversionStatus(
      statusId,
      'done',
      100,
      `Conversion complete. ${successCount} images converted, ${errorCount} errors.`,
      results
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await updateConversionStatus(
      statusId,
      'error',
      0,
      `Conversion failed: ${errorMessage}`,
      results
    );
  }
}

async function updateConversionStatus(
  statusId: string,
  status: ConversionStatus,
  progress: number,
  message: string,
  results?: ConversionResult[]
) {
  const ConversionStatus = Parse.Object.extend('ConversionStatus');
  const query = new Parse.Query(ConversionStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });
  statusObj.set('status', status);
  statusObj.set('progress', progress);
  statusObj.set('message', message);
  if (results) {
    statusObj.set('results', results);
  }
  await statusObj.save(null, { useMasterKey: true });
}

// Start PNG to JPEG conversion - returns status ID immediately
Parse.Cloud.define('convert-png-start', async (req) => {
  if (!req.user) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  const dryRun = req.params.dryRun !== false; // Default to dry run for safety

  // Create status object
  const ConversionStatus = Parse.Object.extend('ConversionStatus');
  const statusObj = new ConversionStatus();
  statusObj.set('status', 'pending');
  statusObj.set('progress', 0);
  statusObj.set(
    'message',
    dryRun ? 'Starting dry run...' : 'Starting conversion...'
  );
  statusObj.set('dryRun', dryRun);
  await statusObj.save(null, { useMasterKey: true });

  // Start conversion in background (don't await)
  runConversion(statusObj.id, dryRun);

  return { statusId: statusObj.id };
});

// Get conversion status
Parse.Cloud.define('convert-png-status', async (req) => {
  if (!req.user) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  const { statusId } = req.params;
  if (!statusId) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      'Missing statusId parameter'
    );
  }

  const ConversionStatus = Parse.Object.extend('ConversionStatus');
  const query = new Parse.Query(ConversionStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });

  return {
    dryRun: statusObj.get('dryRun'),
    message: statusObj.get('message'),
    progress: statusObj.get('progress'),
    results: statusObj.get('results'),
    status: statusObj.get('status'),
  };
});
