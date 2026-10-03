# Architecture

## Processes

```
Browser ──> Next.js (apps/web) ──> NestJS API (apps/api, main.ts) ──> Postgres
                                        │                               ▲
Meta / Razorpay ── webhooks ────────────┤                               │
                                        ▼                               │
                                   Redis (BullMQ) ──> Worker (worker.ts)┘
                                                          │
                                                          └──> Meta Graph API, Resend, R2
```

| Process | Entry                    | Responsibility                                            |
| ------- | ------------------------ | --------------------------------------------------------- |
| Web     | `apps/web`               | Marketing, dashboard, public store/booking/invoice pages  |
| API     | `apps/api/src/main.ts`   | REST API and webhook receivers. Never does slow work.     |
| Worker  | `apps/api/src/worker.ts` | BullMQ processors (sending) and cron jobs (token refresh) |

The API and worker share one codebase and one Docker image; only the start command differs.
`MessagingModule` (the processors) and `ScheduleModule` are imported by the worker only, so
scaling the API never duplicates sends or crons.

## Comment to DM flow

1. A follower comments. Meta POSTs to `POST /webhooks/meta`.
2. `meta-webhook.controller` verifies `X-Hub-Signature-256` over the raw body, dedupes the
   event, pushes a job to the `meta-events` queue and returns **200 immediately**.
3. The worker runs `matcher.service` to find active automations for that account, post and
   keyword, checks the plan limit (`usage.service`), then enqueues `private-reply` and
   `comment-reply` jobs.
4. `private-reply.processor` sends the DM using the comment id; `comment-reply.processor`
   posts the public reply.
5. If the automation has more steps, `flow-engine` stores a `FlowState`. When the follower
   replies, the webhook resumes the flow at the waiting step.
6. Every send is written to `MessageLog` and increments `UsageCounter`.

## Rules the code must keep

- **Idempotent webhooks.** `WebhookDedupeService` claims each event id in Redis (`SET NX`,
  24h) and records it in `ProcessedWebhook` as a durable backup.
- **Encrypted tokens.** Instagram tokens are stored only as AES-256-GCM ciphertext
  (`common/utils/crypto.ts`). They are decrypted in memory right before a Meta API call.
- **One client per provider.** Only `instagram-api.client.ts` calls Meta and only
  `razorpay.service.ts` calls Razorpay.
- **Validation at the edge.** Request bodies are parsed with Zod schemas from
  `packages/shared`, the same schemas the web forms use.
- **Ownership checks.** Every dashboard query is scoped by the logged-in `userId`.
- **Money as integers.** Amounts are stored in paise.

## Meta platform limits

- Only Business or Creator accounts work.
- A private reply to a comment can be sent once, within 7 days of the comment.
- Free-form DMs are allowed only within 24 hours of the follower's last message, so
  `FlowState` expires after 24 hours.
- Long-lived tokens last about 60 days; `token-refresh.cron.ts` refreshes them early.

## Auth

Email/password or Google login issues a JWT in an httpOnly cookie (`access_token`).
`JwtAuthGuard` protects API routes. The web `middleware.ts` only checks that the cookie
exists to redirect logged-out visitors; the API is the real gate.

In production the web app and API must share a parent domain (for example `app.example.com`
and `api.example.com`) so the cookie is sent to both.

## Data model

See `apps/api/prisma/schema.prisma`. Main relations:

```
User ─┬─ InstagramAccount ─┬─ Automation ── AutomationStep
      │                    ├─ Contact ── FlowState
      │                    └─ MessageLog
      ├─ UsageCounter, Subscription
      ├─ Product ── Order
      ├─ BookingSlot ── Booking
      └─ Invoice
```
