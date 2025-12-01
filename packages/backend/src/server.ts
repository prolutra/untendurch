import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import { thumbnailRoute } from './routes/thumbnail.js';
import FSFilesAdapter from '@parse/fs-files-adapter';
import { uploadRoute } from './routes/upload.js';
import cors from 'cors';
import {
  PARSE_SERVER_APP_NAME,
  PARSE_SERVER_APPLICATION_ID,
  PARSE_SERVER_DASHBOARD_USER_ID,
  PARSE_SERVER_DASHBOARD_USER_PASSWORD,
  PARSE_SERVER_DATABASE_URI,
  PARSE_SERVER_MASTER_KEY,
  PARSE_SERVER_MOUNT_PATH,
  PARSE_SERVER_PORT,
  PARSE_SERVER_URL,
} from './config.js';
import { uploadsDirectory } from './directories.js';

const app = express();

const fsAdapter = new FSFilesAdapter({
  filesSubDirectory: './images',
});

const serverOptions = {
  databaseURI: PARSE_SERVER_DATABASE_URI,
  cloud: function () {
    import('./parse/cloud/main.js');
  },
  appId: PARSE_SERVER_APPLICATION_ID,
  masterKey: PARSE_SERVER_MASTER_KEY,
  filesAdapter: fsAdapter,
  serverURL: PARSE_SERVER_URL,
  publicServerURL: PARSE_SERVER_URL,
  masterKeyIps: ['0.0.0.0/0', '::/0'],
  fileUpload: {
    enableForPublic: true,
  },
  // Set to future defaults
  encodeParseObjectInCloudFunction: true,
  enableInsecureAuthAdapters: false,
  // Use PagesRouter instead of deprecated PublicAPIRouter
  pages: {
    enableRouter: true,
  },
};

const parseServer = new ParseServer(serverOptions);
await parseServer.start();

app.use(PARSE_SERVER_MOUNT_PATH, parseServer.app);

const dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: PARSE_SERVER_URL,
        appId: PARSE_SERVER_APPLICATION_ID,
        masterKey: PARSE_SERVER_MASTER_KEY,
        appName: PARSE_SERVER_APP_NAME,
      },
    ],
    users: [
      {
        user: PARSE_SERVER_DASHBOARD_USER_ID,
        pass: PARSE_SERVER_DASHBOARD_USER_PASSWORD,
        apps: [
          {
            appId: PARSE_SERVER_APPLICATION_ID,
          },
        ],
      },
    ],
  },
  { allowInsecureHTTP: true }
);

app.use('/dashboard', dashboard);
app.use(thumbnailRoute);
app.use(uploadRoute);

app.use(
  express.static('public', { cacheControl: true, etag: true, maxAge: '1d' })
);

app.use(
  '/uploads',
  cors({
    origin: '*',
  }),
  express.static(uploadsDirectory, {
    cacheControl: true,
    etag: true,
    maxAge: '14d',
  })
);

app.listen(PARSE_SERVER_PORT, function () {
  console.log(`localhost:${PARSE_SERVER_PORT}`);
});
