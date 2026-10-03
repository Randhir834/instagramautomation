# Instagram Automation Platform

Creator platform with two halves: an **automation engine** (comment a keyword, get a public
reply and a DM, capture leads) and a **monetization suite** (link-in-bio store, 1:1 bookings,
invoices). The brand name is not final, so it is read from `APP_NAME` everywhere.

Full spec: [PROJECT_SPEC.md](PROJECT_SPEC.md). Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requirements

- Node.js 20+ and pnpm
- Docker Desktop (for local Postgres + Redis)
- Chrome or Edge installed (only for invoice PDFs; found automatically)

## First-time setup

```bash
pnpm install

# 1. Create your local env file and fill in the two required secrets
cp .env.example .env
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
# paste both lines into .env

# 2. Start Postgres + Redis
pnpm db:up

# 3. Create the tables and a demo user
pnpm db:migrate
pnpm db:seed
```

## Run

```bash
pnpm dev
```

| What       | URL                            |
| ---------- | ------------------------------ |
| Web        | <http://localhost:3000>        |
| API health | <http://localhost:4000/health> |

`pnpm dev` runs the shared package in watch mode, the API, the worker and the web app.

Without any third-party keys you can already sign up, log in, build automations, use contacts,
bookings and invoices. Each integration switches on when its keys are in `.env`:

| Feature                                  | Needs                                                             |
| ---------------------------------------- | ----------------------------------------------------------------- |
| Connect Instagram, comment-to-DM         | `META_*` (and a public HTTPS URL for webhooks, see below)         |
| Google login                             | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                        |
| Paid plans, store checkout               | `RAZORPAY_*`                                                      |
| Product uploads and downloads            | `R2_*`                                                            |
| Emails (delivery, booking confirmations) | `RESEND_API_KEY`, `EMAIL_FROM` (otherwise emails are only logged) |
| Error monitoring                         | `SENTRY_DSN`                                                      |

Meta and Razorpay send webhooks, which need a public HTTPS URL. In development run a tunnel to
port 4000 (ngrok or Cloudflare Tunnel) and register `{tunnel}/webhooks/meta` and
`{tunnel}/webhooks/razorpay`. See [docs/META_APP_REVIEW.md](docs/META_APP_REVIEW.md).

## Scripts

| Command                       | Does                           |
| ----------------------------- | ------------------------------ |
| `pnpm dev`                    | Start everything in watch mode |
| `pnpm build`                  | Build all packages             |
| `pnpm lint`                   | ESLint                         |
| `pnpm test`                   | Unit tests                     |
| `pnpm typecheck`              | TypeScript check, no output    |
| `pnpm format`                 | Prettier                       |
| `pnpm db:up` / `pnpm db:down` | Start / stop Postgres + Redis  |
| `pnpm db:migrate`             | Apply Prisma migrations        |
| `pnpm db:seed`                | Seed a demo user               |

Building the web app while `pnpm dev` is running? Use a separate output folder so the two do
not overwrite each other: `NEXT_DIST_DIR=.next-build pnpm --filter @repo/web build`.

## Layout

```
apps/api         NestJS API + BullMQ worker      (apps/api/README.md)
apps/web         Next.js frontend                (apps/web/README.md)
packages/shared  Zod schemas, plan limits, queue names used by both
docs/            Architecture, Meta App Review, deployment
```

## Build phases

All phases from spec section 9 are built.

- [x] Phase 0: Scaffold
- [x] Phase 1: Foundation (auth, Google login, dashboard shell, Instagram connect, token encryption and refresh)
- [x] Phase 2: Core engine (signed webhooks, dedupe, queue, worker, private and public replies, MessageLog)
- [x] Phase 3: Automation builder (CRUD, matcher, form builder, post picker)
- [x] Phase 4: Flows and leads (buttons, follow gate, email and phone capture, contacts, dashboard counts)
- [x] Phase 5: Plans and billing (limits, usage counter, Razorpay subscriptions and webhook, billing page)
- [x] Phase 6: Store (products, R2 uploads, public store, checkout, order webhook, signed downloads, delivery email)
- [x] Phase 7: Booking and invoices (slots, public booking, emails, invoice PDFs, public invoice view)
- [x] Phase 8: Hardening (rate limits, Sentry, data deletion callback, legal pages, docs, Docker, CI)

What still needs you: the accounts in spec section 10 (Meta app and App Review, Razorpay KYC,
Cloudflare R2, Resend domain, hosting), final prices for paid plans, and a legal review of the
privacy and terms pages.
