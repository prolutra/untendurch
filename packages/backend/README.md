# Backend: Parse Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This package provides an Express server that serves the Parse Server backend, a dashboard, and the compiled React frontend app once an image from the root Dockerfile has been created.

## 🔧 Configuration

The backend requires environment variables for configuration. Create a `.env` file in the root of this package with the following variables:

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

## 🚀 Development

### Starting MongoDB
```bash
yarn run db:start
```

### Starting Development Server
```bash
yarn run dev
```

Access points:
- Parse Dashboard: [http://localhost:1337/dashboard](http://localhost:1337/dashboard)
- Parse Server API: [http://localhost:1337/parse](http://localhost:1337/parse)
- MongoDB: `localhost:27017`

## 🏗️ Building

### Building for Production
```bash
yarn run build
```

### Docker Build
From the project root directory:
```bash
docker build .
```

## 📁 Directory Structure

The backend uses the following key directories:

- `public/` - Static files served by the Express server. The frontend app is compiled to this directory.
- `cache/` - Thumbnail cache directory created automatically when needed
- `files/` - Parse backend saves files here instead of using MongoDB for file storage
- `src/` - Source code for the Express server and Parse Server configuration

## 🔗 Integration with Frontend

The backend serves the compiled frontend app from the `public` directory. When building for production, make sure to build the frontend first so that the compiled files are available in the `public` directory.

## 📄 License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE](/LICENSE) file for details
