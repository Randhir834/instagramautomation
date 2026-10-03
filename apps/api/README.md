# API (NestJS)

Backend for the platform: REST API, webhook receivers and the BullMQ worker.

## Run locally

From the repo root (needs Postgres + Redis, see the root README):

```bash
pnpm dev                 # everything: shared, API, worker, web
```

Or only this app:

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/api dev          # API on :4000 + worker
pnpm --filter @repo/api dev:api      # API only
```

Check it: <http://localhost:4000/health> should return `{"status":"ok","db":true,"redis":true}`.

## Two processes

| Entry           | Start                 | Does                                                   |
| --------------- | --------------------- | ------------------------------------------------------ |
| `src/main.ts`   | `node dist/main.js`   | HTTP API + webhook receivers. Never does slow work.    |
| `src/worker.ts` | `node dist/worker.js` | BullMQ processors (sending DMs/replies) and cron jobs. |

## Database

```bash
pnpm --filter @repo/api prisma:migrate   # apply migrations (dev)
pnpm --filter @repo/api prisma:seed      # demo user
pnpm --filter @repo/api prisma:studio    # browse data
```

The schema is in `prisma/schema.prisma`. Env vars come from the root `.env`.

## Tests

```bash
pnpm --filter @repo/api test        # unit tests, no services needed
pnpm --filter @repo/api test:e2e    # needs Postgres + Redis running
```

## Layout

- `config/` env validation (Zod) and typed config
- `common/` guards, filters, decorators, crypto/HMAC helpers
- `prisma/`, `redis/`, `queue/` infrastructure modules
- `modules/` one folder per feature (see `docs/ARCHITECTURE.md`)
