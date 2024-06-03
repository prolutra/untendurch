# Parse server backend

This package provides an express server that serves the parse server backend, a dashboard and the compiled react frontend app once an image from the root Dockerfile has been created.

## Usage

To run the development server, you need to have a `.env` file in the root of the project with the following variables:

```bash
PARSE_SERVER_APPLICATION_ID=untendurch
PARSE_SERVER_APP_NAME=untendurch
PARSE_SERVER_MASTER_KEY=secret
PARSE_SERVER_DATABASE_URI=mongodb://untendurch:untendurch@localhost:27017/untendurch
PARSE_SERVER_URL=http://localhost:1337/parse
PARSE_SERVER_MOUNT_PATH=/parse
PARSE_SERVER_DASHBOARD_USER_ID=untendurch
PARSE_SERVER_DASHBOARD_USER_PASSWORD=untendurch
PARSE_SERVER_PORT=1337
```

Then, you can run the server with the following command:

```bash
yarn run start:db
yarn run dev
```

To build the production image, you can run the following command in the root of the project:

```bash
docker build .
```

## Static files

- The static files are served from the `public` directory. The frontend app is compiled to this directory.
- The backend uses a thumbnail cache which creates a `cache` directory in the package directory.
- The parse backend saves files to the `files` directory in the package directory instead of using mongodb to save file chunks.
