# build image
FROM ubuntu as build

WORKDIR /tmp

RUN apt-get update
RUN apt-get install -y nodejs npm wget

RUN wget https://github.com/parse-community/parse-server/archive/refs/tags/5.2.4.tar.gz
RUN tar -xzf 5.2.4.tar.gz
RUN mv parse-server-5.2.4 parse-server
RUN cp -r parse-server parse-server-build

WORKDIR /tmp/parse-server-build
RUN npm ci
RUN npm run build

# release image
FROM ubuntu as release

ARG PARSE_SERVER_APPLICATION_ID
ARG PARSE_SERVER_MASTER_KEY
ARG PARSE_SERVER_DATABASE_URI
ARG PARSE_SERVER_MOUNT_PATH=/parse
ARG PARSE_SERVER_ALLOW_CLIENT_CLASS_CREATION
ARG PARSE_SERVER_CLOUD=/parse/cloud/main.js
ARG PARSE_SERVER_FILE_UPLOAD_ENABLE_FOR_PUBLIC=true
ARG PARSE_SERVER_FILE_UPLOAD_OPTIONS='{"enableForPublic": true}'

RUN apt-get update
RUN apt-get install -y nodejs npm

# copy sources
WORKDIR /parse-server
COPY --from=build /tmp/parse-server /parse-server
RUN npm cache clean --force
RUN npm ci --production --ignore-scripts

ADD docker/parse-server/cloud /parse/cloud
VOLUME /parse-server/cloud /parse-server/config

# copy libs from build
COPY --from=build /tmp/parse-server-build/bin bin
COPY --from=build /tmp/parse-server-build/public_html public_html
COPY --from=build /tmp/parse-server-build/views views
COPY --from=build /tmp/parse-server-build/lib lib

RUN useradd -ms /bin/bash node
RUN mkdir -p logs && chown -R node: logs

ENV PORT=1337
USER node
EXPOSE $PORT

ENTRYPOINT ["node", "./bin/parse-server"]
