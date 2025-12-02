FROM node:24 AS builder

ARG CI_COMMIT_SHORT_SHA
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /build

COPY ./ ./

RUN node -v
RUN yarn -v
RUN node ./scripts/generateBuildId.js $CI_COMMIT_SHORT_SHA
RUN yarn install
RUN yarn check
RUN yarn workspaces focus @untendurch/frontend
RUN yarn workspace @untendurch/frontend run build:$ENVIRONMENT
RUN yarn workspaces focus @untendurch/backend
RUN yarn workspace @untendurch/backend run build
RUN cp -pr ./packages/frontend/dist/* ./packages/backend/public/
RUN yarn workspaces focus @untendurch/backend --production

#RUN rm -rf .git && rm -rf *.lock

FROM node:24-slim AS runner
ARG CI_COMMIT_SHORT_SHA
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /
COPY --from=builder /build/ /app

WORKDIR /app/packages/backend
CMD node ./dist/server.js

EXPOSE 8080
