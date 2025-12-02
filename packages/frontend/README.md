# Frontend: React Application

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This package provides the React frontend application for Pro Lutra: Untendurch, allowing users to report and view bridges with their safety assessment for otters.

## 🔧 Configuration

The frontend requires environment variables for configuration. Environment files for different deployment environments are included:

- `.env.development` - Development environment configuration
- `.env.test` - Testing environment configuration
- `.env.prod` - Production environment configuration

Example configuration:

```bash
VITE_REACT_APP_PARSE_SERVER_URL=http://localhost:1337/parse
```

**Note:** These are build-time variables. If you need different values for different environments, you must set them during the build process.

## 🚀 Development

### Starting Development Server
```bash
yarn run dev
```

This will start the Vite development server, typically on port 5173. The application will be available at [http://localhost:5173](http://localhost:5173).

## 🏗️ Building

### Building for Different Environments
```bash
# Development build
yarn run build:dev

# Testing build
yarn run build:test

# Production build
yarn run build:prod
```

The compiled application will be output to the `dist/` directory.

## 🌐 Internationalization

### Managing Translations

The application supports multiple languages (de, en, fr, it) through the i18n system:

#### Extracting Translations
Extract strings from all source files for all languages:
```bash
yarn run i18n-extract
```

#### Compiling Translations
Compile translation files for runtime use:
```bash
yarn run i18n-compile
```

## 📁 Directory Structure

The frontend uses the following key directories:

- `src/` - Application source code
- `public/` - Static assets that are served directly
- `lang/` - Translation files
- `dist/` - Compiled output (generated during build)

## 🔗 Integration with Backend

The frontend communicates with the backend Parse Server API. In development mode, it connects directly to the API endpoint. For production, the compiled frontend is served by the backend Express server.

## 📄 License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE](/LICENSE) file for details
