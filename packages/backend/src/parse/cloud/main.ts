import { bridgeVerifyData } from './lib/bridge-verify-data.js';
import './lib/resize-reimport-images.js';

Parse.Cloud.beforeSave('Bridge', bridgeVerifyData);

Parse.Cloud.define('deleteFile', async (req) => {
  const { filename } = req.params;
  if (!filename) {
    throw new Error('Missing filename parameter');
  }

  // @ts-expect-error types are outdated
  const file = new Parse.File(filename);
  try {
    await file.destroy({ useMasterKey: true });
    return 'File deleted successfully';
  } catch (error) {
    throw new Error('Failed to delete file');
  }
});
