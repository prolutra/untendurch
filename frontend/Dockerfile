FROM node:18-slim

ARG CI_COMMIT_SHORT_SHA
ARG NEXUS_USERNAME
ARG NEXUS_PASSWORD
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /app

COPY ./frontend/ ./

RUN ./scripts/ci-create-npmrc.sh

RUN npm install -g http-server pm2

RUN node ./scripts/generateBuildId.js $CI_COMMIT_SHORT_SHA && \
    npm install && \
    npm run build:$ENVIRONMENT && \
    find . -type f -regextype posix-egrep -regex ".*\.(tsx|ts|tar.gz|md|txt)$" -delete && \
    find . -type f -regextype posix-egrep -regex ".*(LICENSE|license|CHANGELOG)$" -delete && \
    apt remove mount --allow-remove-essential -y && \
    apt autoremove -y && apt clean

WORKDIR /app/build

CMD pm2 start --name http-server "$(which http-server) --port 8080 --proxy http://localhost:8080? ."

EXPOSE 8080
