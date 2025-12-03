import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { imagesDirectory } from '../../../directories.js';

type OptimizationResult = {
  bridgeId: string;
  error?: string;
  filename: string;
  newSize?: number;
  originalSize?: number;
  success: boolean;
  wasOptimized?: boolean;
};

type OptimizationStatus =
  | 'done'
  | 'error'
  | 'optimizing'
  | 'pending'
  | 'scanning';

async function runOptimization(statusId: string, dryRun: boolean) {
  const results: OptimizationResult[] = [];

  try {
    await updateOptimizationStatus(
      statusId,
      'scanning',
      5,
      'Scanning for bridges with JPEG images...'
    );

    // Query all bridges
    const Bridge = Parse.Object.extend('Bridge');
    const query = new Parse.Query(Bridge);
    query.exists('images');
    query.limit(10000);

    const bridges = await query.find({ useMasterKey: true });

    // Collect all JPEG images that need checking
    const imagesToCheck: { bridge: Parse.Object; image: Parse.File }[] = [];

    for (const bridge of bridges) {
      const images = bridge.get('images') as Parse.File[];
      if (!images || images.length === 0) continue;

      for (const img of images) {
        const name = img.name().toLowerCase();
        if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
          imagesToCheck.push({ bridge, image: img });
        }
      }
    }

    await updateOptimizationStatus(
      statusId,
      'optimizing',
      10,
      `Found ${imagesToCheck.length} JPEG images to check. ${dryRun ? '(Dry run - no changes will be made)' : 'Checking dimensions...'}`
    );

    let processedCount = 0;
    let optimizedCount = 0;
    let skippedCount = 0;
    let totalSavedBytes = 0;

    for (const { bridge, image } of imagesToCheck) {
      const filename = image.name();
      const filePath = path.join(imagesDirectory, filename);

      try {
        if (!fs.existsSync(filePath)) {
          results.push({
            bridgeId: bridge.id,
            error: `File not found on disk: ${filename}`,
            filename,
            success: false,
          });
          continue;
        }

        const originalStats = fs.statSync(filePath);
        const originalSize = originalStats.size;

        // Get image metadata
        const metadata = await sharp(filePath).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const longestSide = Math.max(width, height);

        // Check if optimization is needed (longer side > 2000px)
        if (longestSide <= 2000) {
          results.push({
            bridgeId: bridge.id,
            filename,
            originalSize,
            success: true,
            wasOptimized: false,
          });
          skippedCount++;
        } else {
          if (dryRun) {
            // Estimate new size (rough approximation)
            const scaleFactor = 2000 / longestSide;
            const estimatedNewSize = Math.round(
              originalSize * scaleFactor * scaleFactor * 0.8
            );
            results.push({
              bridgeId: bridge.id,
              filename,
              newSize: estimatedNewSize,
              originalSize,
              success: true,
              wasOptimized: true,
            });
            totalSavedBytes += originalSize - estimatedNewSize;
            optimizedCount++;
          } else {
            // Actually optimize the image
            const optimizedBuffer = await sharp(filePath)
              .rotate()
              .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80 })
              .toBuffer();

            // Write optimized image back to disk (overwrites in place)
            // No need to update Parse.File reference - the file URL stays the same,
            // only the content on disk changes
            fs.writeFileSync(filePath, new Uint8Array(optimizedBuffer));

            const newSize = optimizedBuffer.length;
            const savedBytes = originalSize - newSize;
            totalSavedBytes += savedBytes;

            results.push({
              bridgeId: bridge.id,
              filename,
              newSize,
              originalSize,
              success: true,
              wasOptimized: true,
            });
            optimizedCount++;
          }
        }

        processedCount++;
        const progress = Math.round(
          10 + (processedCount / imagesToCheck.length) * 85
        );
        await updateOptimizationStatus(
          statusId,
          'optimizing',
          progress,
          `Processed ${processedCount}/${imagesToCheck.length}: ${filename} (${longestSide}px)`
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          bridgeId: bridge.id,
          error: errorMessage,
          filename,
          success: false,
        });
      }
    }

    const errorCount = results.filter((r) => !r.success).length;
    const savedMB = (totalSavedBytes / (1024 * 1024)).toFixed(2);

    await updateOptimizationStatus(
      statusId,
      'done',
      100,
      `${dryRun ? 'Dry run complete' : 'Optimization complete'}. ${optimizedCount} images ${dryRun ? 'would be' : ''} optimized, ${skippedCount} already optimal, ${errorCount} errors. ${dryRun ? 'Estimated' : 'Total'} savings: ${savedMB} MB`,
      results
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await updateOptimizationStatus(
      statusId,
      'error',
      0,
      `Optimization failed: ${errorMessage}`,
      results
    );
  }
}

async function updateOptimizationStatus(
  statusId: string,
  status: OptimizationStatus,
  progress: number,
  message: string,
  results?: OptimizationResult[]
) {
  const OptimizationStatus = Parse.Object.extend('OptimizationStatus');
  const query = new Parse.Query(OptimizationStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });
  statusObj.set('status', status);
  statusObj.set('progress', progress);
  statusObj.set('message', message);
  if (results) {
    statusObj.set('results', results);
  }
  await statusObj.save(null, { useMasterKey: true });
}

// Start JPEG optimization - returns status ID immediately
Parse.Cloud.define('optimize-jpeg-start', async (req) => {
  if (!req.user && !req.master) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  const dryRun = req.params.dryRun !== false; // Default to dry run for safety

  // Create status object
  const OptimizationStatus = Parse.Object.extend('OptimizationStatus');
  const statusObj = new OptimizationStatus();
  statusObj.set('status', 'pending');
  statusObj.set('progress', 0);
  statusObj.set(
    'message',
    dryRun ? 'Starting dry run...' : 'Starting optimization...'
  );
  statusObj.set('dryRun', dryRun);
  await statusObj.save(null, { useMasterKey: true });

  // Start optimization in background (don't await)
  runOptimization(statusObj.id, dryRun);

  return { statusId: statusObj.id };
});

// Get optimization status
Parse.Cloud.define('optimize-jpeg-status', async (req) => {
  if (!req.user && !req.master) {
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

  const OptimizationStatus = Parse.Object.extend('OptimizationStatus');
  const query = new Parse.Query(OptimizationStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });

  return {
    dryRun: statusObj.get('dryRun'),
    message: statusObj.get('message'),
    progress: statusObj.get('progress'),
    results: statusObj.get('results'),
    status: statusObj.get('status'),
  };
});

// Background job for JPEG optimization (dry run) - can be run from Dashboard > Jobs
Parse.Cloud.job('optimize-jpeg-dry-run', async (request) => {
  const { message } = request;
  message('Starting JPEG optimization dry run...');

  const OptimizationStatus = Parse.Object.extend('OptimizationStatus');
  const statusObj = new OptimizationStatus();
  statusObj.set('status', 'pending');
  statusObj.set('progress', 0);
  statusObj.set('message', 'Starting dry run...');
  statusObj.set('dryRun', true);
  await statusObj.save(null, { useMasterKey: true });

  message(`Status ID: ${statusObj.id}`);

  await runOptimization(statusObj.id, true);

  const updatedStatus = await new Parse.Query(OptimizationStatus).get(
    statusObj.id,
    { useMasterKey: true }
  );
  message(updatedStatus.get('message'));
});

// Background job for JPEG optimization (actual) - can be run from Dashboard > Jobs
Parse.Cloud.job('optimize-jpeg-run', async (request) => {
  const { message } = request;
  message('Starting JPEG optimization...');

  const OptimizationStatus = Parse.Object.extend('OptimizationStatus');
  const statusObj = new OptimizationStatus();
  statusObj.set('status', 'pending');
  statusObj.set('progress', 0);
  statusObj.set('message', 'Starting optimization...');
  statusObj.set('dryRun', false);
  await statusObj.save(null, { useMasterKey: true });

  message(`Status ID: ${statusObj.id}`);

  await runOptimization(statusObj.id, false);

  const updatedStatus = await new Parse.Query(OptimizationStatus).get(
    statusObj.id,
    { useMasterKey: true }
  );
  message(updatedStatus.get('message'));
});
