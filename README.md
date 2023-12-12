# Pro Lutra: Untendurch
An app designed to map bridges with their safety for otters.
## App setup
The app consists of the following components:
  - `nginx` proxy
  - `parse-server` as a backend
  - `parse-dashboard` to access and modify data
  - `mongodb` as a database for Parse
  - `frontend` client for bridge reporting and viewing
## Development Setup
### Prerequisites
  - `npm`
  - `node`
  - `docker`
  - `docker-compose`
### Installing
```bash
cd frontend
yarn install
```
### Starting it all for local development
#### Starting `mongodb`, `parse-server`, `parse-dashboard` and `nginx`
```bash
cd docker
docker-compose up
```
#### Starting the client in dev mode
```bash
cd frontend
yarn run dev
```

The app will be available under [http://localhost:3000](http://localhost:3000).

Parse Dashboard can be accessed via [http://localhost:4040](http://localhost:4040) whereas Parse Server is listening on [http://localhost:1337/parse](http://localhost:1337/parse) and MongoDB is listening on `localhost:27017`.
### Building the app
```bash
cd frontend
yarn run build
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
The Docker Compose file `docker/docker-compose.yml` can be seen as a template for any TEST, PRE-PROD or PROD setup.
#### Frontend
##### Image
Running your built frontend Docker image as described in [Building the Docker Image for Deployment](#building-the-docker-image-for-deployment) exposing port 8080.
#### MongoDB
##### Image
`Mongo:5.0.9`
##### Notable Variables
```yml
MONGO_INITDB_DATABASE: untendurch
MONGO_INITDB_PASSWORD: YOUR_CORRESPONDING_ENV_PASSWORD
MONGO_INITDB_USERNAME: untendurch
```
#### Parse Server
##### Image
The built image using `docker/parse-server/Dockerfile`
##### Notable Variables
```yml
PARSE_PUBLIC_SERVER_URL: https://your-url/parse
PARSE_SERVER_ALLOW_CLIENT_CLASS_CREATION: false
PARSE_SERVER_APPLICATION_ID: untendurch
PARSE_SERVER_CLOUD: /parse-server/cloud/main.js
PARSE_SERVER_DATABASE_URI: mongodb://untendurch:YOUR_CORRESPONDING_ENV_PASSWORD@mongodb-host:27017/untendurch
PARSE_SERVER_FILE_UPLOAD_ENABLE_FOR_PUBLIC: true
PARSE_SERVER_FILE_UPLOAD_OPTIONS: {"enableForPublic": true}
PARSE_SERVER_MASTER_KEY: YOUR_CORRESPONDING_ENV_MASTER_KEY
PARSE_SERVER_MOUNT_PATH: /parse
PARSE_SERVER_URL: http://localhost:1337/parse
```
#### Parse Dashboard
##### Image
`parse-platform/parse-dashboard:4.1.4`
##### Notable Variables
```yml
PARSE_DASHBOARD_ALLOW_INSECURE_HTTP: true
PARSE_DASHBOARD_APP_ID: untendurch
PARSE_DASHBOARD_APP_NAME: untendurch
PARSE_DASHBOARD_MASTER_KEY: YOUR_CORRESPONDING_ENV_MASTER_KEY
PARSE_DASHBOARD_SERVER_URL: https://your-url/parse
PARSE_DASHBOARD_USER_ID: untendurch
PARSE_DASHBOARD_USER_PASSWORD: YOUR_CORRESPONDING_ENV_PASSWORD
```
#### Nginx
The assumption is to redirect `80` to `443` with SSL termination on Nginx.

##### Key Configuration Points
```conf
server {
    #http3 quic does not seem to be supported by parse-server
    listen       443 http2 ssl;
    listen       [::]:443 http2 ssl;
    # other lines omitted for readability
    location / {
        # upstream is the frontend container
        set $upstream_name common;
        include conf.d/ssl.upstreams.inc;
        proxy_pass http://$upstream_name;
        proxy_next_upstream error;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Host $http_host;
        proxy_set_header X-Forwarded-For $http_x_forwarded_for;
        proxy_set_header X-URI $request_uri;
        proxy_set_header X-ARGS $args;
        proxy_set_header Refer $http_refer;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Ssl-Offloaded "1";
    }
    # for parse-server
    location /parse/ {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://parse-server-container-ip:1337/parse/;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }
    # for parse-dashboard
    location /dashboard/ {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-NginX-Proxy true;
      proxy_pass http://parse-dashboard-container-ip:4040/dashboard/;
      proxy_ssl_session_reuse off;
      proxy_set_header Host $http_host;
      proxy_redirect off;
    }
}
```
