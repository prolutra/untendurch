import { bridgeVerifyData } from './lib/bridge-verify-data.js';
import './lib/export-xls.js';
import './lib/delete-file.js';
import './lib/clear-cache.js';
import './lib/convert-png-to-jpeg.js';
import './lib/optimize-jpeg.js';

Parse.Cloud.beforeSave('Bridge', bridgeVerifyData);
