declare module 'parse-server';
declare module 'parse-dashboard';
declare module '@parse/fs-files-adapter';
declare module 'archiver';

declare namespace NodeJS {
  export interface ProcessEnv {
    PARSE_SERVER_APP_NAME: string;
    PARSE_SERVER_APPLICATION_ID: string;
    PARSE_SERVER_CLOUD: string;
    PARSE_SERVER_DATABASE_URI: string;
    PARSE_SERVER_FILE_KEY: string;
    PARSE_SERVER_MASTER_KEY: string;
    PARSE_SERVER_MOUNT_PATH: string;
    PARSE_SERVER_PORT: string;
    PARSE_SERVER_URL: string;
  }
}
