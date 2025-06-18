# Pro Lutra: Untendurch

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

An app designed to map bridges with their safety for otters.

## Project Overview

Pro Lutra: Untendurch is a web application that enables users to report and view bridges, evaluating their safety for otters. The project aims to improve wildlife conservation efforts by identifying potentially hazardous crossing points.

### Architecture

The app consists of the following components:
- `backend` - Express JS server wrapping parse-server, parse-dashboard and other services
- `frontend` - React client for bridge reporting and viewing
- `mongodb` - Database for Parse

## Getting Started

### Prerequisites
- `node >= 20`
- `docker >= 25`

The yarn CLI is included in this repository and can be used to install dependencies.

### Installation

```bash
yarn install
```

### Development Setup

#### Starting Backend Services
```bash
# Start MongoDB
yarn workspace @untendurch/backend run db:start

# Start backend in development mode
yarn workspace @untendurch/backend run dev
```

#### Starting Frontend Development Server
```bash
yarn workspace @untendurch/frontend run dev
```

Access points:
- Web application: [http://localhost:5173](http://localhost:5173)
- Parse Dashboard: [http://localhost:1337/dashboard](http://localhost:1337/dashboard)
- Parse Server API: [http://localhost:1337/parse](http://localhost:1337/parse)
- MongoDB: `localhost:27017`

## Building

### Building the Application
```bash
# Build backend
yarn workspace @untendurch/backend run build

# Build frontend (choose environment)
yarn workspace @untendurch/frontend run build:dev
# or
yarn workspace @untendurch/frontend run build:test
# or
yarn workspace @untendurch/frontend run build:prod
```

### Building Docker Image
```bash
docker build -f frontend/Dockerfile .
```

## Internationalization

### Extracting Translations
For example, for German language:
```bash
cd frontend
npm run i18n-extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file lang/de.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

### Compiling Translations
```bash
cd frontend
npm run i18n-compile -- lang/de.json --ast --out-file src/compiled-lang/de.json
```

## Deployment

### Docker Compose Setup
The Docker Compose setup in `docker-compose/example` can be used as a template for TEST, PRE-PROD, or PROD environments. 

1. Copy the `.env.example` file to `.env`
2. Modify the `.env` file with appropriate values
3. Use docker-compose to start the services

## Package Documentation

The project contains the following packages with their own documentation:

- [Backend](/packages/backend/README.md) - Express server with Parse backend
- [Frontend](/packages/frontend/README.md) - React web application

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
