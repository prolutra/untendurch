# Pro Lutra: Untendurch

An app designed to map bridges with their safety for otters.

## App setup
The app consists of the following components:
  - `backend` which wraps parse-server, parse-dashboard and other services up in an Express JS server
  - `frontend` client for bridge reporting and viewing
  - `mongodb` as a database for Parse

## Development Setup

### Prerequisites
  - `node >= 20`
  - `docker >= 25`

The yarn cli is part of this repository and can be used to install the dependencies.


### Installing
```bash
yarn install
```


### Starting it all for local development
#### Starting `mongodb`, `backend`
```bash
yarn workspace @untendurch/backend run db:start
yarn workspace @untendurch/backend run dev
```

#### Starting the client in dev mode
```bash
yarn workspace @untendurch/frontend run dev
```

The app will be available under [http://localhost:5173](http://localhost:5173).

Parse Dashboard can be accessed via [http://localhost:1337/dashboard](http://localhost:1337/dashboard) whereas Parse Server is listening on [http://localhost:1337/parse](http://localhost:1337/parse) and MongoDB is listening on `localhost:27017`.

### Building the app
```bash
yarn workspace @untendurch/backend run build
yarn workspace @untendurch/frontend run build:[dev|test|prod]
```

### Translations
#### Extraction
For `de` as example.
```bash
cd frontend
npm run i18n-extract -- 'src/**/*.ts*' --ignore='**/*.d.ts' --out-file lang/de.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

#### Compilation
```bash
cd frontend
npm run i18n-compile -- lang/de.json --ast --out-file src/compiled-lang/de.json
```

### Building the Docker Image for Deployment
```bash
docker build -f frontend/Dockerfile .
```

### Docker Images Setup
The Docker Compose setup `docker-compose/example` can be seen as a template for any TEST, PRE-PROD or PROD setup. All required variables are present in the `.env.example` file which you will need to rename to `.env`.


## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
