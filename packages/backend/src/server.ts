import FSFilesAdapter from '@parse/fs-files-adapter';
import cors from 'cors';
import express from 'express';
import ParseDashboard from 'parse-dashboard';
import { ParseServer } from 'parse-server';
import path from 'path';

import {
  CORS_ORIGINS,
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
import { thumbnailRoute } from './routes/thumbnail.js';
import { uploadRoute } from './routes/upload.js';

const app = express();

// FSFilesAdapter prepends 'files/' to filesSubDirectory, so use 'images' to get 'files/images'
const fsAdapter = new FSFilesAdapter({
  filesSubDirectory: 'images',
});

const serverOptions = {
  appId: PARSE_SERVER_APPLICATION_ID,
  cloud: function () {
    import('./parse/cloud/main.js');
  },
  databaseURI: PARSE_SERVER_DATABASE_URI,
  enableInsecureAuthAdapters: false,
  // Set to future defaults
  encodeParseObjectInCloudFunction: true,
  filesAdapter: fsAdapter,
  fileUpload: {
    enableForPublic: true,
  },
  masterKey: PARSE_SERVER_MASTER_KEY,
  // Allow master key from any IP (container is behind reverse proxy)
  masterKeyIps: ['0.0.0.0/0', '::/0'],
  // Use PagesRouter instead of deprecated PublicAPIRouter
  pages: {
    enableRouter: true,
  },
  publicServerURL: PARSE_SERVER_URL,
  serverURL: PARSE_SERVER_URL,
};

const parseServer = new ParseServer(serverOptions);
await parseServer.start();

app.use(PARSE_SERVER_MOUNT_PATH, parseServer.app);

const dashboard = new ParseDashboard(
  {
    apps: [
      {
        appId: PARSE_SERVER_APPLICATION_ID,
        appName: PARSE_SERVER_APP_NAME,
        masterKey: PARSE_SERVER_MASTER_KEY,
        serverURL: PARSE_SERVER_URL,
      },
    ],
    users: [
      {
        apps: [
          {
            appId: PARSE_SERVER_APPLICATION_ID,
          },
        ],
        pass: PARSE_SERVER_DASHBOARD_USER_PASSWORD,
        user: PARSE_SERVER_DASHBOARD_USER_ID,
      },
    ],
  },
  { allowInsecureHTTP: true }
);

app.use('/dashboard', dashboard);
app.use(thumbnailRoute);
app.use(uploadRoute);

// Serve index.html with no-cache for SPA routes to ensure users always get latest version
const publicDir = path.join(import.meta.dirname, '../public');
app.get(
  ['/', '/index.html', '/bridges/:id', '/admin', '/admin/:path'],
  (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(publicDir, 'index.html'));
  }
);

// Serve hashed assets with long cache (immutable since filename changes on content change)
app.use(
  '/assets',
  express.static(path.join(publicDir, 'assets'), {
    cacheControl: true,
    etag: true,
    immutable: true,
    maxAge: '1y',
  })
);

// Serve other static files with moderate cache
app.use(
  express.static('public', { cacheControl: true, etag: true, maxAge: '1d' })
);

app.use(
  '/uploads',
  cors({
    origin: CORS_ORIGINS,
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
