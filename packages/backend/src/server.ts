import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import { thumbnailRoute } from './routes/thumbnail.js';

const app = express();

const serverOptions = {
  databaseURI: process.env.PARSE_SERVER_DATABASE_URI,
  cloud: process.env.PARSE_SERVER_CLOUD,
  appId: process.env.PARSE_SERVER_APPLICATION_ID,
  masterKey: process.env.PARSE_SERVER_MASTER_KEY,
  fileKey: process.env.PARSE_SERVER_FILE_KEY,
  serverURL: process.env.PARSE_SERVER_URL,
  // enableAnonymousUsers: true,
  fileUpload: {
    enableForPublic: true,
  },
};

const parseServer = new ParseServer(serverOptions);
parseServer.start();

app.use(process.env.PARSE_SERVER_MOUNT_PATH || '/parse', parseServer.app);

const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: process.env.PARSE_SERVER_URL,
      appId: process.env.PARSE_SERVER_APPLICATION_ID,
      masterKey: process.env.PARSE_SERVER_MASTER_KEY,
      appName: process.env.PARSE_SERVER_APP_NAME,
    },
  ],
});

app.use('/dashboard', dashboard);

app.use(thumbnailRoute);

app.listen(process.env.PARSE_SERVER_PORT, function () {
  console.log(`localhost:${process.env.PARSE_SERVER_PORT}`);
});
