# React frontend

This package provides a react frontend app that is served by the parse server backend.

## Usage

To run the development server, you need to have a `.env` file in the root of the project with the following variables:

```bash
VITE_REACT_APP_PARSE_SERVER_URL=http://localhost:1337/parse
```
Be aware that this is a build time variable. If you need a different value for production, you need to set it during build time.

Then, you can run the server with the following command:

```bash
yarn run dev
```
