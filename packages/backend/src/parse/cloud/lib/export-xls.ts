import { compact } from 'lodash-es';
import path, { resolve } from 'path';
import fs from 'fs';
import writeXlsxFile from 'write-excel-file/node';
import archiver from 'archiver';

const __dirname = import.meta.dirname;
const projectRoot = resolve(__dirname, '../../../..');

Parse.Cloud.define('export-xls', async (req) => {
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

  // Add field names to header row
  const headerRow = BridgeSchemaFields.map((fieldName) => ({
    value: fieldName,
  }));

  const files: string[] = [];

  const rows = result.map((parseObject) =>
    BridgeSchemaFields.map((fieldName) => {
      const row = parseObject.toJSON();
      const value = row[fieldName];
      // Test if the value is an image
      if (fieldName === 'images') {
        if (value.length > 0) {
          const output: string[] = value.map((item: any) => {
            return item.name;
          });
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
      // Test if the value is a date
      if (value instanceof Date) {
        return {
          type: Date,
          value: value,
          format: 'dd/mm/yyyy hh:mm:ss',
        };
      }
      // Test if the value is a boolean
      if (typeof value === 'boolean') {
        return {
          type: Boolean,
          value: value,
        };
      }
      // Test if the value is a number
      if (typeof value === 'number') {
        return {
          type: Number,
          value: value,
        };
      }
      // Test if the value is an array
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return {
            type: String,
            value: '',
          };
        }
        const output = compact(value).map((item) => {
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
      // Test if the value is an object
      if (typeof value === 'object') {
        // test if the object is an r2 point
        if (value.latitude && value.longitude) {
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
  const date = new Date();
  const timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  const tmpDir = path.join(projectRoot, 'cache', 'tmp', 'exports', timestamp);
  const uploadDir = path.join(projectRoot, 'files', 'uploads');

  fs.mkdirSync(tmpDir, { recursive: true });

  const filePath = path.join(tmpDir, 'bridges.xlsx');

  // copy all files to the tmp directory from the files directory, find matches by filename
  for (const file of files) {
    const filename = path.basename(file);
    const availableFiles = fs.readdirSync(uploadDir);

    for (const availableFile of availableFiles) {
      if (availableFile.includes(filename)) {
        const src = path.join(uploadDir, availableFile);
        const dest = path.join(tmpDir, availableFile);
        fs.copyFileSync(src, dest);
      }
    }
  }

  await writeXlsxFile(sheetData, { filePath });

  async function zipDirectory(sourceDir: string, outputFilePath: string) {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const stream = fs.createWriteStream(outputFilePath);

    return new Promise<void>((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', (err: any) => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }
  const zipFileName = `bridges-${timestamp}.zip`;
  const zipFilePath = path.join(projectRoot, 'cache', 'uploads', zipFileName);
  await zipDirectory(tmpDir, zipFilePath);

  // clean up
  fs.rmSync(tmpDir, { recursive: true, force: true });

  // delete upload files older than a week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const filesToDelete = fs.readdirSync(uploadDir);
  for (const file of filesToDelete) {
    const stats = fs.statSync(path.join(uploadDir, file));
    if (stats.mtime < weekAgo) {
      fs.rmSync(path.join(uploadDir, file));
    }
  }

  const zipFileUrl = `${process.env.PARSE_SERVER_URL.replace(process.env.PARSE_SERVER_MOUNT_PATH, '')}/uploads/${zipFileName}`;

  return { zipFileUrl };
});
