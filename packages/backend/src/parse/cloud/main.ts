import { bridgeVerifyData } from './lib/bridge-verify-data.js';
import './lib/resize-reimport-images.js';
import './lib/export-xls.js';
import './lib/delete-file.js';

Parse.Cloud.beforeSave('Bridge', bridgeVerifyData);
