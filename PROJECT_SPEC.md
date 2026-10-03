# Instagram Automation Platform: Full Project Spec

> Hand this file to Claude in your code editor (Claude Code). Put it inside your
> `instagram-automation/` folder and say:
> **"Read PROJECT_SPEC.md fully. Create the complete folder structure and every file listed, with working starter code. Then follow the build order, one phase at a time, and stop after each phase for me to test."**

---

## 1. What we are building

A creator platform for Instagram creators (same category as ManyChat), with two halves:

1. **Automation engine:** when someone comments a keyword on a post/reel, reply publicly and send a DM. Capture leads (email/phone), gate content behind "follow me first", and send buttons.
2. **Monetization suite:** a link-in-bio storefront ("store") selling digital products via Razorpay, 1:1 call booking, and a simple invoice generator.

Plans: Free (5 automations, 2,000 DMs/month), Premium, Professional. The brand name is still undecided, so use the placeholder `APP_NAME` from env/config everywhere. Never hardcode a brand name.

---

## 2. Rules for Claude while building

1. TypeScript everywhere, strict mode on.
2. Monorepo with **pnpm workspaces**.
3. Build **one phase at a time** (section 9) and stop for testing after each.
4. Never hardcode secrets. Everything goes in `.env` files, with `.env.example` committed.
5. Instagram access tokens must be **encrypted (AES-256-GCM)** before saving to the database.
6. Webhook endpoints must **verify signatures** and **respond 200 immediately**, then push work to a queue.
7. Webhook events can repeat, so processing must be **idempotent** (dedupe by event ID in Redis).
8. Check current Meta and Razorpay docs for exact endpoints and permission names before coding the integrations. Do not rely on memory.
9. Write a short README in each app explaining how to run it.
10. Keep files small and focused: one responsibility per file.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zod, React Hook Form |
| Backend API | Node.js, NestJS, TypeScript |
| Queue / workers | BullMQ on Redis |
| Database | PostgreSQL with Prisma ORM |
| Cache | Redis |
| File storage | Cloudflare R2 (S3-compatible) |
| Auth | Email/Google login with JWT (httpOnly cookies) + Instagram OAuth to connect accounts |
| Payments | Razorpay (subscriptions + store checkout + webhooks) |
| Email | Resend |
| Booking | Simple slots stored in DB, optional Google Calendar sync later |
| PDF | Puppeteer (invoice PDFs) |
| Tooling | pnpm, Docker Compose, ESLint, Prettier, Jest, GitHub Actions |
| Monitoring | Sentry |

---

## 4. Folder structure

Create exactly this tree inside `instagram-automation/`:

```
instagram-automation/
├── PROJECT_SPEC.md
├── README.md
├── package.json                  # root scripts: dev, build, lint, test
├── pnpm-workspace.yaml           # apps/*, packages/*
├── tsconfig.base.json
├── .gitignore
├── .prettierrc
├── .eslintrc.cjs
├── .env.example                  # all variables, no real values
├── docker-compose.yml            # postgres + redis (+ optional mailhog)
│
├── .github/
│   └── workflows/
│       └── ci.yml                # install, lint, test, build
│
├── packages/
│   └── shared/                   # code used by both web and api
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── constants/
│           │   ├── plans.ts      # plan limits (automations, DMs/month)
│           │   └── events.ts     # queue + event names
│           ├── schemas/          # Zod schemas shared by web + api
│           │   ├── automation.ts
│           │   ├── contact.ts
│           │   ├── product.ts
│           │   ├── booking.ts
│           │   └── invoice.ts
│           └── types/
│               └── index.ts
│
├── apps/
│   ├── api/                      # NestJS backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # see section 5
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   ├── test/
│   │   │   └── app.e2e-spec.ts
│   │   └── src/
│   │       ├── main.ts           # API entry
│   │       ├── worker.ts         # separate entry that runs BullMQ workers
│   │       ├── app.module.ts
│   │       ├── config/
│   │       │   ├── configuration.ts
│   │       │   └── env.validation.ts   # Zod validation of env vars
│   │       ├── common/
│   │       │   ├── decorators/current-user.decorator.ts
│   │       │   ├── guards/jwt-auth.guard.ts
│   │       │   ├── guards/plan-limit.guard.ts
│   │       │   ├── filters/http-exception.filter.ts
│   │       │   ├── interceptors/logging.interceptor.ts
│   │       │   └── utils/
│   │       │       ├── crypto.ts       # AES-256-GCM encrypt/decrypt tokens
│   │       │       ├── hmac.ts         # webhook signature verification
│   │       │       └── dates.ts
│   │       ├── prisma/
│   │       │   ├── prisma.module.ts
│   │       │   └── prisma.service.ts
│   │       ├── redis/
│   │       │   ├── redis.module.ts
│   │       │   └── redis.service.ts    # cache + webhook dedupe
│   │       ├── queue/
│   │       │   ├── queue.module.ts
│   │       │   └── queue.constants.ts
│   │       └── modules/
│   │           ├── auth/               # signup, login, JWT, Google login
│   │           │   ├── auth.module.ts
│   │           │   ├── auth.controller.ts
│   │           │   ├── auth.service.ts
│   │           │   ├── strategies/jwt.strategy.ts
│   │           │   └── dto/
│   │           ├── users/
│   │           │   ├── users.module.ts
│   │           │   ├── users.controller.ts
│   │           │   └── users.service.ts
│   │           ├── instagram/          # connect account + Meta API client
│   │           │   ├── instagram.module.ts
│   │           │   ├── instagram.controller.ts   # OAuth start + callback
│   │           │   ├── instagram.service.ts      # accounts, token refresh
│   │           │   ├── instagram-api.client.ts   # all calls to Meta Graph API
│   │           │   └── token-refresh.cron.ts     # refresh before ~60-day expiry
│   │           ├── webhooks/           # lightweight receivers, queue only
│   │           │   ├── webhooks.module.ts
│   │           │   ├── meta-webhook.controller.ts      # GET verify + POST events
│   │           │   ├── razorpay-webhook.controller.ts
│   │           │   └── webhook-dedupe.service.ts
│   │           ├── automations/        # CRUD + rule matching
│   │           │   ├── automations.module.ts
│   │           │   ├── automations.controller.ts
│   │           │   ├── automations.service.ts
│   │           │   ├── matcher.service.ts        # keyword/post/reel matching
│   │           │   └── dto/
│   │           ├── flows/              # conversation steps + per-contact state
│   │           │   ├── flows.module.ts
│   │           │   ├── flow-engine.service.ts    # trigger -> steps -> actions
│   │           │   ├── steps/
│   │           │   │   ├── send-message.step.ts
│   │           │   │   ├── quick-replies.step.ts
│   │           │   │   ├── follow-gate.step.ts
│   │           │   │   └── collect-input.step.ts # email / phone capture
│   │           │   └── flow-state.service.ts
│   │           ├── messaging/          # BullMQ processors that send
│   │           │   ├── messaging.module.ts
│   │           │   ├── private-reply.processor.ts  # comment -> DM
│   │           │   ├── comment-reply.processor.ts  # public reply
│   │           │   ├── dm.processor.ts             # follow-up DMs
│   │           │   └── rate-limiter.service.ts
│   │           ├── contacts/           # leads CRM
│   │           │   ├── contacts.module.ts
│   │           │   ├── contacts.controller.ts
│   │           │   └── contacts.service.ts
│   │           ├── billing/            # plans, limits, subscriptions
│   │           │   ├── billing.module.ts
│   │           │   ├── billing.controller.ts
│   │           │   ├── billing.service.ts
│   │           │   ├── usage.service.ts          # monthly DM counters
│   │           │   └── razorpay.service.ts
│   │           ├── store/              # products + orders
│   │           │   ├── store.module.ts
│   │           │   ├── products.controller.ts
│   │           │   ├── orders.controller.ts
│   │           │   ├── public-store.controller.ts  # public store page data
│   │           │   ├── store.service.ts
│   │           │   └── delivery.service.ts       # signed download links
│   │           ├── booking/
│   │           │   ├── booking.module.ts
│   │           │   ├── booking.controller.ts
│   │           │   ├── booking.service.ts
│   │           │   └── availability.service.ts
│   │           ├── invoices/
│   │           │   ├── invoices.module.ts
│   │           │   ├── invoices.controller.ts
│   │           │   ├── invoices.service.ts
│   │           │   └── templates/invoice.hbs     # HTML template for PDF
│   │           ├── storage/            # R2 uploads + signed URLs
│   │           │   ├── storage.module.ts
│   │           │   └── storage.service.ts
│   │           ├── email/
│   │           │   ├── email.module.ts
│   │           │   ├── email.service.ts
│   │           │   └── templates/
│   │           ├── analytics/          # basic counts only
│   │           │   ├── analytics.module.ts
│   │           │   ├── analytics.controller.ts
│   │           │   └── analytics.service.ts
│   │           └── compliance/         # required by Meta
│   │               ├── compliance.module.ts
│   │               └── data-deletion.controller.ts   # data deletion callback
│   │
│   └── web/                      # Next.js frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       ├── components.json       # shadcn/ui config
│       ├── Dockerfile
│       ├── README.md
│       ├── public/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── globals.css
│           │   ├── (marketing)/
│           │   │   ├── page.tsx              # landing page
│           │   │   ├── pricing/page.tsx
│           │   │   ├── privacy/page.tsx      # required by Meta
│           │   │   ├── terms/page.tsx
│           │   │   └── data-deletion/page.tsx
│           │   ├── (auth)/
│           │   │   ├── login/page.tsx
│           │   │   └── signup/page.tsx
│           │   ├── (dashboard)/
│           │   │   ├── layout.tsx            # sidebar + topbar
│           │   │   ├── dashboard/page.tsx    # overview counts
│           │   │   ├── accounts/page.tsx     # connect Instagram
│           │   │   ├── automations/
│           │   │   │   ├── page.tsx          # list
│           │   │   │   ├── new/page.tsx      # step-by-step builder form
│           │   │   │   └── [id]/page.tsx     # edit
│           │   │   ├── contacts/page.tsx
│           │   │   ├── store/
│           │   │   │   ├── page.tsx          # my products
│           │   │   │   ├── products/new/page.tsx
│           │   │   │   └── orders/page.tsx
│           │   │   ├── bookings/page.tsx
│           │   │   ├── invoices/
│           │   │   │   ├── page.tsx
│           │   │   │   └── new/page.tsx
│           │   │   └── billing/page.tsx
│           │   └── (public)/
│           │       ├── s/[username]/page.tsx       # public store (link in bio)
│           │       ├── s/[username]/[product]/page.tsx
│           │       ├── book/[username]/page.tsx    # public booking page
│           │       ├── invoice/[id]/page.tsx       # public invoice view
│           │       └── download/[token]/page.tsx   # product download
│           ├── components/
│           │   ├── ui/                 # shadcn components
│           │   ├── layout/             # Sidebar, Topbar, PageHeader
│           │   ├── automations/        # AutomationForm, StepEditor, PostPicker
│           │   ├── contacts/           # ContactsTable
│           │   ├── store/              # ProductForm, ProductCard
│           │   └── billing/            # PlanCard, UsageMeter
│           ├── lib/
│           │   ├── api.ts              # fetch wrapper for backend
│           │   ├── auth.ts
│           │   ├── utils.ts
│           │   └── razorpay.ts         # checkout script loader
│           ├── hooks/                  # useAutomations, useContacts, etc.
│           └── middleware.ts           # protects dashboard routes
│
└── docs/
    ├── ARCHITECTURE.md
    ├── META_APP_REVIEW.md        # permissions, demo-video checklist
    └── DEPLOYMENT.md
```

---

## 5. Database schema (Prisma, `apps/api/prisma/schema.prisma`)

Create these models (add indexes on foreign keys and on `igAccountId`, `keyword`, `contactId`):

- **User**: id, email (unique), passwordHash?, googleId?, name, username (unique, for public store URL), plan (FREE | TRIAL | PREMIUM | PROFESSIONAL), planExpiresAt?, razorpayCustomerId?, createdAt
- **InstagramAccount**: id, userId, igUserId (unique), username, encryptedAccessToken, tokenExpiresAt, isActive, connectedAt
- **Automation**: id, igAccountId, name, isActive, triggerType (COMMENT | DM_KEYWORD | STORY_REPLY), postId? (null = all posts), keywords (string[]), matchType (CONTAINS | EXACT), publicReplies (string[]), createdAt
- **AutomationStep**: id, automationId, order, type (SEND_MESSAGE | QUICK_REPLIES | FOLLOW_GATE | COLLECT_EMAIL | COLLECT_PHONE), payload (Json)
- **Contact**: id, igAccountId, igScopedUserId, username?, email?, phone?, tags (string[]), lastInteractionAt, createdAt. Unique on (igAccountId, igScopedUserId)
- **FlowState**: id, contactId, automationId, currentStep, status (ACTIVE | WAITING_INPUT | DONE), expiresAt
- **MessageLog**: id, igAccountId, contactId, automationId?, direction, kind (PRIVATE_REPLY | COMMENT_REPLY | DM), status, error?, createdAt (used for usage counting)
- **UsageCounter**: id, userId, month (YYYY-MM), dmCount. Unique on (userId, month)
- **Subscription**: id, userId, razorpaySubscriptionId, plan, status, currentPeriodEnd
- **Product**: id, userId, title, description, priceInPaise, fileKey (R2), coverImageUrl?, isPublished, slug
- **Order**: id, productId, buyerEmail, buyerName?, amountInPaise, razorpayOrderId, razorpayPaymentId?, status (CREATED | PAID | FAILED), downloadToken, createdAt
- **BookingSlot**: id, userId, startsAt, endsAt, isBooked
- **Booking**: id, slotId, guestName, guestEmail, note?, status
- **Invoice**: id, userId, number, clientName, clientEmail?, items (Json), currency, taxPercent, total, status, issuedAt, pdfKey?
- **ProcessedWebhook**: id (the event id, unique), source (META | RAZORPAY), createdAt (backup to the Redis dedupe)

---

## 6. Environment variables (`.env.example`)

```
# General
APP_NAME=YourBrandHere
NODE_ENV=development
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000

# Database / Redis
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/igauto
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Security
TOKEN_ENCRYPTION_KEY=            # 32 bytes, base64: used for AES-256-GCM

# Meta / Instagram
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
META_REDIRECT_URI=http://localhost:4000/instagram/callback

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PREMIUM_ID=
RAZORPAY_PLAN_PROFESSIONAL_ID=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# Monitoring
SENTRY_DSN=
```

---

## 7. How the main flow works (comment to DM)

1. Creator signs in with Instagram (OAuth). The API stores the **encrypted** long-lived token.
2. Creator creates an automation: "On reel X, if the comment contains PRICE, reply 'Check your DMs' and DM this link."
3. A follower comments. Meta POSTs to `/webhooks/meta`.
4. `meta-webhook.controller` verifies the signature, dedupes by event ID, pushes a job to the queue, and returns **200 immediately**.
5. A worker (`worker.ts`) takes the job, runs `matcher.service` to find matching automations, checks the plan limit, then enqueues `private-reply` and `comment-reply` jobs.
6. `private-reply.processor` sends the DM through the Meta API using the comment ID. `comment-reply.processor` posts the public reply.
7. If the automation has more steps (follow-gate, collect email), `flow-engine` stores a `FlowState`. When the user replies, the webhook resumes the flow at the next step.
8. Every send is written to `MessageLog` and increments `UsageCounter`.

**Meta platform rules to respect** (verify against current docs):
- Only Instagram Business or Creator accounts work.
- The app needs Meta **App Review** for messaging and comments permissions before public use. Until then only tester accounts work.
- A private reply to a comment can be sent only once per comment and only within 7 days.
- Free-form DMs are only allowed within 24 hours of the user's last message.
- Webhooks need a public HTTPS URL (use ngrok or Cloudflare Tunnel in development).
- Long-lived tokens expire after about 60 days, so refresh them on a schedule.

---

## 8. Scope for the first release (8 weeks)

**Include:** auth, Instagram connect, comment-to-DM, public comment reply, keyword/post matching, form-based builder, follow-gate, quick-reply buttons, email capture, contacts list, plans and limits, Razorpay subscriptions, simple store, simple booking, one invoice template, basic counts dashboard, legal pages, data-deletion endpoint.

**Defer:** visual flow canvas (React Flow), carousels, advanced menu bots, full analytics, custom invoice templates, Google Calendar sync.

---

## 9. Build order (stop after each phase for testing)

**Phase 0: Scaffold**
Create the whole folder tree above with placeholder files and working configs. Docker Compose should start Postgres and Redis. `pnpm dev` should start both apps. Add the Prisma schema and the first migration.

**Phase 1: Foundation**
Auth (signup, login, Google), user model, dashboard shell with sidebar, Instagram OAuth connect, token encryption, token refresh cron.

**Phase 2: Core engine**
Meta webhook receiver (verify, signature check, dedupe, queue), worker entry, private-reply and comment-reply processors, `MessageLog`. Test end to end on your own tester account.

**Phase 3: Automation builder**
Automation CRUD, matcher service, the form-based builder UI, post/reel picker.

**Phase 4: Flows and leads**
Flow engine, quick-reply buttons, follow-gate, email and phone capture, contacts page, basic dashboard counts.

**Phase 5: Plans and billing**
Plan limits, `UsageCounter`, `plan-limit.guard`, Razorpay subscriptions and webhook, billing page.

**Phase 6: Store**
Products CRUD, R2 upload, public store page, Razorpay checkout, order webhook, signed download links, delivery email.

**Phase 7: Booking and invoices**
Slots, public booking page, confirmation emails, invoice CRUD, HTML-to-PDF generation, public invoice view.

**Phase 8: Hardening and launch**
Tests, rate limits, error monitoring, privacy/terms/data-deletion pages, `docs/META_APP_REVIEW.md` (permissions and demo-video checklist), Dockerfiles, CI, deployment guide.

---

## 10. Accounts you must create yourself (Claude cannot do this)

1. **Meta developer account**, a Meta app, and Instagram product setup. Start business verification early.
2. **Razorpay account** with KYC done (needed for subscriptions and store payments).
3. **Cloudflare account** for R2 storage.
4. **Resend account** for email, and a domain for sending.
5. A **domain**, plus hosting accounts (Vercel for web, Railway/Render for API and worker).
6. **Sentry** project (optional but recommended).

Put all keys into your local `.env`. Never paste them into chat.
