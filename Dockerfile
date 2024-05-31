FROM node:20 AS builder

ARG CI_COMMIT_SHORT_SHA
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /build

COPY ./ ./

RUN node -v
RUN yarn -v
RUN node ./scripts/generateBuildId.js $CI_COMMIT_SHORT_SHA
RUN yarn workspaces focus @untendurch/frontend
RUN yarn workspace @untendurch/frontend run build
RUN yarn workspaces focus @untendurch/backend
RUN yarn workspace @untendurch/backend run build
RUN cp -r ./packages/frontend/dist/* ./packages/backend/public
RUN yarn workspaces focus @untendurch/backend --production



RUN rm -rf .git && rm -rf *.lock && \
    find . -name "*.ts" -type f -delete && find . -name "*.md" -type f -delete && find . -name "README.*" -type f -delete && find . -name "README" -type f -delete && find . -name "LICENSE.*" -type f -delete && find . -name "LICENSE" -type f -delete


FROM node:20-slim AS runner
ARG CI_COMMIT_SHORT_SHA
ARG ENVIRONMENT
LABEL git-commit=$CI_COMMIT_SHORT_SHA

WORKDIR /

COPY --from=builder /build/packages/backend/ /app
RUN ls -al
CMD node ./dist/server.js

EXPOSE 8080
