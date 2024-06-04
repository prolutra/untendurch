import {
  compact,
  isArray,
  isBoolean,
  isDate,
  isNumber,
  isObject,
  padStart,
} from 'lodash-es';
import path from 'path';
import fs from 'fs';
import writeXlsxFile from 'write-excel-file/node';
import archiver from 'archiver';
import { exportDirectory, uploadsDirectory } from '../../../directories.js';
import { PARSE_SERVER_ROOT_URL } from '../../../config.js';

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = padStart((date.getMonth() + 1).toString(), 2, '0');
  const day = padStart(date.getDate().toString(), 2, '0');
  const hours = padStart(date.getHours().toString(), 2, '0');
  const minutes = padStart(date.getMinutes().toString(), 2, '0');
  const seconds = padStart(date.getSeconds().toString(), 2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

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
      if (isDate(value)) {
        return {
          type: Date,
          value: value,
          format: 'dd/mm/yyyy hh:mm:ss',
        };
      }
      // Test if the value is a boolean
      if (isBoolean(value)) {
        return {
          type: Boolean,
          value: value,
        };
      }
      // Test if the value is a number
      if (isNumber(value)) {
        return {
          type: Number,
          value: value,
        };
      }
      // Test if the value is an array
      if (isArray(value)) {
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
      if (isObject(value)) {
        // test if the object is an r2 point
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

  // copy all files to the tmp directory from the files directory, find matches by filename
  for (const file of files) {
    const filename = path.basename(file);
    const availableFiles = fs.readdirSync(uploadsDirectory);

    for (const availableFile of availableFiles) {
      if (availableFile.includes(filename)) {
        const src = path.join(uploadsDirectory, availableFile);
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
  const zipFilePath = path.join(uploadsDirectory, zipFileName);
  await zipDirectory(tmpDir, zipFilePath);

  // clean up
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const zipFileUrl = `${PARSE_SERVER_ROOT_URL}/uploads/${zipFileName}`;

  return { zipFileUrl };
});
