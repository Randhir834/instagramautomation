# Build from the repo root:  docker build -f apps/web/Dockerfile -t app-web .
# NEXT_PUBLIC_* values are baked in at build time, so pass them as build args.

FROM node:22-slim AS base
RUN npm install -g pnpm@12
WORKDIR /repo

FROM base AS build
ARG APP_NAME=APP_NAME
ARG API_URL=http://localhost:4000
ARG WEB_URL=http://localhost:3000
ARG RAZORPAY_KEY_ID=
ENV APP_NAME=$APP_NAME API_URL=$API_URL WEB_URL=$WEB_URL RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
ENV BUILD_STANDALONE=1
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN pnpm install --filter @repo/web... --frozen-lockfile=false
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/web build

FROM node:22-slim AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
