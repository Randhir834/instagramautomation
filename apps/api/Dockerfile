# Build from the repo root:  docker build -f apps/api/Dockerfile -t app-api .
# Same image runs the API (default) or the worker:
#   docker run app-api                      -> API
#   docker run app-api node dist/worker.js  -> worker

FROM node:22-slim AS base
# openssl: Prisma. chromium + fonts: invoice PDFs (Puppeteer).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl chromium fonts-noto-core fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm install -g pnpm@12
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --filter @repo/api... --frozen-lockfile=false
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
