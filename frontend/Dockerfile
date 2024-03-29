FROM node:18 AS builder

ARG CI_COMMIT_SHORT_SHA
ARG NEXUS_USERNAME
ARG NEXUS_PASSWORD
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /build

COPY ./ ./

RUN npm -v
RUN node -v
RUN node ./scripts/generateBuildId.js $CI_COMMIT_SHORT_SHA
RUN npm install
RUN npm run build:$ENVIRONMENT
RUN rm -rf .git && rm -rf *.lock && \
    find . -name "*.ts" -type f -delete && find . -name "*.md" -type f -delete && find . -name "README.*" -type f -delete && find . -name "README" -type f -delete && find . -name "LICENSE.*" -type f -delete && find . -name "LICENSE" -type f -delete


FROM caddy:latest AS runner
ARG CI_COMMIT_SHORT_SHA
ARG NEXUS_USERNAME
ARG NEXUS_PASSWORD
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

COPY Caddyfile /etc/caddy/Caddyfile

WORKDIR /

COPY --from=builder /build/dist /app

EXPOSE 8080
