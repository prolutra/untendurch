import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import { thumbnailRoute } from './routes/thumbnail.js';

const app = express();

const serverOptions = {
  databaseURI: process.env.PARSE_SERVER_DATABASE_URI,
  cloud: function () {
    import('./parse/cloud/main.js');
  },
  appId: process.env.PARSE_SERVER_APPLICATION_ID,
  masterKey: process.env.PARSE_SERVER_MASTER_KEY,
  fileKey: process.env.PARSE_SERVER_FILE_KEY,
  serverURL: process.env.PARSE_SERVER_URL,
  masterKeyIps: ['0.0.0.0/0', '::/0'],
  // enableAnonymousUsers: true,
  fileUpload: {
    enableForPublic: true,
  },
};

const parseServer = new ParseServer(serverOptions);
parseServer.start();

app.use(process.env.PARSE_SERVER_MOUNT_PATH || '/parse', parseServer.app);

const dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: process.env.PARSE_SERVER_URL,
        appId: process.env.PARSE_SERVER_APPLICATION_ID,
        masterKey: process.env.PARSE_SERVER_MASTER_KEY,
        appName: process.env.PARSE_SERVER_APP_NAME,
      },
    ],
    users: [
      {
        user: process.env.PARSE_SERVER_DASHBOARD_USER_ID,
        pass: process.env.PARSE_SERVER_DASHBOARD_USER_PASSWORD,
        apps: [
          {
            appId: process.env.PARSE_SERVER_APPLICATION_ID,
          },
        ],
      },
    ],
  },
  { allowInsecureHTTP: true }
);

app.use('/dashboard', dashboard);
app.use(thumbnailRoute);

app.use(
  express.static('public', { cacheControl: true, etag: true, maxAge: '1d' })
);

app.listen(process.env.PARSE_SERVER_PORT, function () {
  console.log(`localhost:${process.env.PARSE_SERVER_PORT}`);
});
