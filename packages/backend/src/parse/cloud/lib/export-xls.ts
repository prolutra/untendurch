import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import writeXlsxFile from 'write-excel-file/node';

import { PARSE_SERVER_ROOT_URL } from '../../../config.js';
import {
  exportDirectory,
  imagesDirectory,
  uploadsDirectory,
} from '../../../directories.js';

type ExportStatus =
  | 'copying'
  | 'done'
  | 'error'
  | 'pending'
  | 'processing'
  | 'querying'
  | 'zipping';

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}`;
}

async function updateExportStatus(
  statusId: string,
  status: ExportStatus,
  progress: number,
  message: string,
  zipFileUrl?: string
) {
  const ExportStatus = Parse.Object.extend('ExportStatus');
  const query = new Parse.Query(ExportStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });
  statusObj.set('status', status);
  statusObj.set('progress', progress);
  statusObj.set('message', message);
  if (zipFileUrl) {
    statusObj.set('zipFileUrl', zipFileUrl);
  }
  await statusObj.save(null, { useMasterKey: true });
}

// Start export - returns status ID immediately
Parse.Cloud.define('export-xls-start', async (req) => {
  if (!req.user) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  // Create status object
  const ExportStatus = Parse.Object.extend('ExportStatus');
  const statusObj = new ExportStatus();
  statusObj.set('status', 'pending');
  statusObj.set('progress', 0);
  statusObj.set('message', 'Export gestartet...');
  statusObj.set('filters', req.params.filters || []);
  await statusObj.save(null, { useMasterKey: true });

  // Start export in background (don't await)
  runExport(statusObj.id, req.params.filters || []);

  return { statusId: statusObj.id };
});

// Get export status
Parse.Cloud.define('export-xls-status', async (req) => {
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

  const ExportStatus = Parse.Object.extend('ExportStatus');
  const query = new Parse.Query(ExportStatus);
  const statusObj = await query.get(statusId, { useMasterKey: true });

  return {
    message: statusObj.get('message'),
    progress: statusObj.get('progress'),
    status: statusObj.get('status'),
    zipFileUrl: statusObj.get('zipFileUrl'),
  };
});

type Filter = {
  attribute: string;
  value: string;
};

async function runExport(statusId: string, filters: Filter[]) {
  try {
    await updateExportStatus(
      statusId,
      'querying',
      5,
      'Daten werden abgefragt...'
    );

    const BridgeSchemaFields = [
      'objectId',
      'position',
      'waterBodies',
      'name',
      'shape',
      'hasBanquet',
      'hasStones',
      'bridgeWidth',
      'bridgeHeight',
      'bridgeLength',
      'hasContinuousShore',
      'hasSlopes',
      'traffic',
      'speedLimit',
      'barriers',
      'nickname',
      'bridgeIndex',
      'otterFriendly',
      'safetyRisk',
      'images',
      'isManualOverride',
      'createdAt',
      'updatedAt',
      'cantons',
      'municipalities',
      'status',
    ];

    const query = new Parse.Query('Bridge');

    for (const { attribute, value } of filters) {
      query.equalTo(attribute, value);
    }
    query.select(BridgeSchemaFields);
    query.limit(9999);
    const result = await query.find({ useMasterKey: true });

    if (result.length === 0) {
      await updateExportStatus(
        statusId,
        'done',
        100,
        'Keine Daten gefunden',
        ''
      );
      return;
    }

    await updateExportStatus(
      statusId,
      'processing',
      15,
      `${result.length} Brücken werden verarbeitet...`
    );

    // Add field names to header row
    const headerRow = BridgeSchemaFields.map((fieldName) => ({
      value: fieldName,
    }));

    const files: string[] = [];

    const rows = result.map((parseObject) =>
      BridgeSchemaFields.map((fieldName) => {
        const row = parseObject.toJSON();
        const value = row[fieldName];
        if (fieldName === 'images') {
          if (value.length > 0) {
            const output: string[] = value.map(
              (item: { name: string }) => item.name
            );
            files.push(...output);
            return {
              type: String,
              value: output.join(', '),
            };
          }
          return {
            value: '',
          };
        }
        if (value instanceof Date) {
          return {
            format: 'dd/mm/yyyy hh:mm:ss',
            type: Date,
            value: value,
          };
        }
        if (typeof value === 'boolean') {
          return {
            type: Boolean,
            value: value,
          };
        }
        if (typeof value === 'number') {
          if (Number.isNaN(value) || !Number.isFinite(value)) {
            return {
              type: String,
              value: '',
            };
          }
          return {
            type: Number,
            value: value,
          };
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return {
              type: String,
              value: '',
            };
          }
          const output = value.filter(Boolean).map((item) => {
            if (typeof item === 'object') {
              return JSON.stringify(item);
            }
            return item;
          });
          return {
            type: String,
            value: output.join(', '),
          };
        }
        if (value !== null && typeof value === 'object') {
          if ('latitude' in value && 'longitude' in value) {
            return {
              type: String,
              value: `${value.latitude}, ${value.longitude}`,
            };
          }
          return {
            type: String,
            value: JSON.stringify(value),
          };
        }
        return {
          type: String,
          value,
        };
      })
    );

    const sheetData = [headerRow, ...rows];
    const timestamp = getTimestamp();
    const tmpDir = path.join(exportDirectory, timestamp);

    fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, 'bridges.xlsx');

    await updateExportStatus(
      statusId,
      'copying',
      30,
      `${files.length} Bilder werden kopiert...`
    );

    // copy all files to the tmp directory from the images directory
    const availableFiles = fs.readdirSync(imagesDirectory);
    let copiedCount = 0;
    for (const file of files) {
      const filename = path.basename(file);

      for (const availableFile of availableFiles) {
        if (availableFile.includes(filename)) {
          const src = path.join(imagesDirectory, availableFile);
          const dest = path.join(tmpDir, availableFile);
          fs.copyFileSync(src, dest);
        }
      }
      copiedCount++;
      // Update progress every 10 files
      if (copiedCount % 10 === 0) {
        const copyProgress = 30 + Math.floor((copiedCount / files.length) * 40);
        await updateExportStatus(
          statusId,
          'copying',
          copyProgress,
          `${copiedCount}/${files.length} Bilder kopiert...`
        );
      }
    }

    await updateExportStatus(
      statusId,
      'processing',
      75,
      'Excel-Datei wird erstellt...'
    );
    await writeXlsxFile(sheetData, { filePath });

    await updateExportStatus(
      statusId,
      'zipping',
      85,
      'ZIP-Archiv wird erstellt...'
    );

    async function zipDirectory(sourceDir: string, outputFilePath: string) {
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      const stream = fs.createWriteStream(outputFilePath);

      return new Promise<void>((resolve, reject) => {
        archive
          .directory(sourceDir, false)
          .on('error', (err: Error) => reject(err))
          .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
      });
    }

    const zipFileName = `untendurch-export-${timestamp}.zip`;
    const zipFilePath = path.join(uploadsDirectory, zipFileName);
    await zipDirectory(tmpDir, zipFilePath);

    // clean up tmp directory
    fs.rmSync(tmpDir, { force: true, recursive: true });

    // clean up old export zip files (older than 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const uploadFiles = fs.readdirSync(uploadsDirectory);
    for (const file of uploadFiles) {
      if (file.startsWith('untendurch-export-') && file.endsWith('.zip')) {
        const oldFilePath = path.join(uploadsDirectory, file);
        const stats = fs.statSync(oldFilePath);
        if (stats.mtimeMs < oneDayAgo) {
          fs.rmSync(oldFilePath);
        }
      }
    }

    const zipFileUrl = `${PARSE_SERVER_ROOT_URL}/uploads/${zipFileName}`;
    await updateExportStatus(
      statusId,
      'done',
      100,
      'Export abgeschlossen',
      zipFileUrl
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    await updateExportStatus(statusId, 'error', 0, `Fehler: ${message}`);
  }
}

// Keep the old function for backwards compatibility
Parse.Cloud.define('export-xls', async (req) => {
  if (!req.user) {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      'Authentication required'
    );
  }

  type Filter = {
    attribute: string;
    value: string;
  };

  const BridgeSchemaFields = [
    'objectId',
    'position',
    'waterBodies',
    'name',
    'shape',
    'hasBanquet',
    'hasStones',
    'bridgeWidth',
    'bridgeHeight',
    'bridgeLength',
    'hasContinuousShore',
    'hasSlopes',
    'traffic',
    'speedLimit',
    'barriers',
    'nickname',
    'bridgeIndex',
    'otterFriendly',
    'safetyRisk',
    'images',
    'isManualOverride',
    'createdAt',
    'updatedAt',
    'cantons',
    'municipalities',
    'status',
  ];

  const filter = req.params.filters as Filter[];
  const query = new Parse.Query('Bridge');

  for (const { attribute, value } of filter) {
    query.equalTo(attribute, value);
  }
  query.select(BridgeSchemaFields);

  query.limit(9999);
  const result = await query.find();

  if (result.length === 0) {
    return { zipFileUrl: '' };
  }

  const headerRow = BridgeSchemaFields.map((fieldName) => ({
    value: fieldName,
  }));

  const files: string[] = [];

  const rows = result.map((parseObject) =>
    BridgeSchemaFields.map((fieldName) => {
      const row = parseObject.toJSON();
      const value = row[fieldName];
      if (fieldName === 'images') {
        if (value.length > 0) {
          const output: string[] = value.map(
            (item: { name: string }) => item.name
          );
          files.push(...output);
          return {
            type: String,
            value: output.join(', '),
          };
        }
        return {
          value: '',
        };
      }
      if (value instanceof Date) {
        return {
          format: 'dd/mm/yyyy hh:mm:ss',
          type: Date,
          value: value,
        };
      }
      if (typeof value === 'boolean') {
        return {
          type: Boolean,
          value: value,
        };
      }
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return {
          type: Number,
          value: value,
        };
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return {
            type: String,
            value: '',
          };
        }
        const output = value.filter(Boolean).map((item) => {
          if (typeof item === 'object') {
            return JSON.stringify(item);
          }
          return item;
        });
        return {
          type: String,
          value: output.join(', '),
        };
      }
      if (value !== null && typeof value === 'object') {
        if ('latitude' in value && 'longitude' in value) {
          return {
            type: String,
            value: `${value.latitude}, ${value.longitude}`,
          };
        }
        return {
          type: String,
          value: JSON.stringify(value),
        };
      }
      return {
        type: String,
        value,
      };
    })
  );

  const sheetData = [headerRow, ...rows];
  const timestamp = getTimestamp();
  const tmpDir = path.join(exportDirectory, timestamp);

  fs.mkdirSync(tmpDir, { recursive: true });

  const filePath = path.join(tmpDir, 'bridges.xlsx');

  const availableFiles = fs.readdirSync(imagesDirectory);
  for (const file of files) {
    const filename = path.basename(file);

    for (const availableFile of availableFiles) {
      if (availableFile.includes(filename)) {
        const src = path.join(imagesDirectory, availableFile);
        const dest = path.join(tmpDir, availableFile);
        fs.copyFileSync(src, dest);
      }
    }
  }

  await writeXlsxFile(sheetData, { filePath });

  async function zipDirectory(sourceDir: string, outputFilePath: string) {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const stream = fs.createWriteStream(outputFilePath);

    return new Promise<void>((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', (err: Error) => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

  const zipFileName = `bridges-${timestamp}.zip`;
  const zipFilePath = path.join(uploadsDirectory, zipFileName);
  await zipDirectory(tmpDir, zipFilePath);

  fs.rmSync(tmpDir, { force: true, recursive: true });

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const uploadFiles = fs.readdirSync(uploadsDirectory);
  for (const file of uploadFiles) {
    if (file.startsWith('untendurch-export-') && file.endsWith('.zip')) {
      const oldFilePath = path.join(uploadsDirectory, file);
      const stats = fs.statSync(oldFilePath);
      if (stats.mtimeMs < oneDayAgo) {
        fs.rmSync(oldFilePath);
      }
    }
  }

  const zipFileUrl = `${PARSE_SERVER_ROOT_URL}/uploads/${zipFileName}`;

  return { zipFileUrl };
});
