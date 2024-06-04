if (process.env.PARSE_SERVER_APPLICATION_ID === undefined) {
  throw new Error('PARSE_SERVER_APPLICATION_ID is not set');
}
if (process.env.PARSE_SERVER_APP_NAME === undefined) {
  throw new Error('PARSE_SERVER_APP_NAME is not set');
}
if (process.env.PARSE_SERVER_MASTER_KEY === undefined) {
  throw new Error('PARSE_SERVER_MASTER_KEY is not set');
}
if (process.env.PARSE_SERVER_DATABASE_URI === undefined) {
  throw new Error('PARSE_SERVER_DATABASE_URI is not set');
}
if (process.env.PARSE_SERVER_URL === undefined) {
  throw new Error('PARSE_SERVER_URL is not set');
}
if (process.env.PARSE_SERVER_MOUNT_PATH === undefined) {
  throw new Error('PARSE_SERVER_MOUNT_PATH is not set');
}
if (process.env.PARSE_SERVER_DASHBOARD_USER_ID === undefined) {
  throw new Error('PARSE_SERVER_DASHBOARD_USER_ID is not set');
}
if (process.env.PARSE_SERVER_DASHBOARD_USER_PASSWORD === undefined) {
  throw new Error('PARSE_SERVER_DASHBOARD_USER_PASSWORD is not set');
}
if (process.env.PARSE_SERVER_PORT === undefined) {
  throw new Error('PARSE_SERVER_PORT is not set');
}

export const PARSE_SERVER_APPLICATION_ID =
  process.env.PARSE_SERVER_APPLICATION_ID;
export const PARSE_SERVER_APP_NAME = process.env.PARSE_SERVER_APP_NAME;
export const PARSE_SERVER_MASTER_KEY = process.env.PARSE_SERVER_MASTER_KEY;
export const PARSE_SERVER_DATABASE_URI = process.env.PARSE_SERVER_DATABASE_URI;
export const PARSE_SERVER_URL = process.env.PARSE_SERVER_URL;
export const PARSE_SERVER_MOUNT_PATH = process.env.PARSE_SERVER_MOUNT_PATH;
export const PARSE_SERVER_DASHBOARD_USER_ID =
  process.env.PARSE_SERVER_DASHBOARD_USER_ID;
export const PARSE_SERVER_DASHBOARD_USER_PASSWORD =
  process.env.PARSE_SERVER_DASHBOARD_USER_PASSWORD;
export const PARSE_SERVER_PORT = process.env.PARSE_SERVER_PORT;

export const PARSE_SERVER_ROOT_URL = PARSE_SERVER_URL.replace(
  PARSE_SERVER_MOUNT_PATH,
  ''
);
