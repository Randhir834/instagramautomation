# Deployment

## Target setup

| Piece            | Host                                          | Start command                                                    |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Web (`apps/web`) | Vercel                                        | default (`next build` / `next start`), root directory `apps/web` |
| API              | Railway or Render, from `apps/api/Dockerfile` | `node dist/main.js` (image default)                              |
| Worker           | Same image as the API                         | `node dist/worker.js`                                            |
| Postgres         | Managed (Railway, Render, Neon)               |                                                                  |
| Redis            | Managed (Railway, Render, Upstash)            | must allow long-lived connections for BullMQ                     |
| Files            | Cloudflare R2, one **private** bucket         |                                                                  |

Run exactly **one** worker to start with. Crons (token refresh, plan expiry) run in the worker;
two workers would run them twice. Scale the API freely.

## Domains

Use one parent domain so the login cookie works on both apps, for example:

- `app.example.com` -> web
- `api.example.com` -> API

## Environment variables

Set everything from `.env.example` on the API and the worker. The web build needs only
`APP_NAME`, `API_URL`, `WEB_URL` and `RAZORPAY_KEY_ID` (all public values).

Production values to double-check:

- `NODE_ENV=production` (secure cookies, proxy-aware rate limiting)
- `WEB_URL`, `API_URL`, `META_REDIRECT_URI` use the real HTTPS domains
- `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY` are new random values, not the local ones.
  **Losing `TOKEN_ENCRYPTION_KEY` makes every stored Instagram token unreadable**; creators
  would have to reconnect. Keep it in your password manager.
- Leave `META_GRAPH_URL`, `META_OAUTH_URL`, `META_AUTHORIZE_URL`, `RAZORPAY_API_URL` and
  `RESEND_API_URL` empty. They exist only for tests.
- `PUPPETEER_EXECUTABLE_PATH` is set inside the API Docker image already.

## Third-party setup

- **Razorpay**: create two monthly plans and put their ids in `RAZORPAY_PLAN_PREMIUM_ID` and
  `RAZORPAY_PLAN_PROFESSIONAL_ID`. Add a webhook to `{API_URL}/webhooks/razorpay` with a secret
  (`RAZORPAY_WEBHOOK_SECRET`) and these events: `subscription.*`, `order.paid`,
  `payment.captured`, `payment.failed`.
- **R2**: create an API token with read and write on the bucket. Add a CORS rule on the
  bucket allowing `PUT` from `WEB_URL` with header `Content-Type`, so browsers can upload
  directly.
- **Resend**: verify your sending domain; `EMAIL_FROM` must use it.
- **Meta**: see [META_APP_REVIEW.md](META_APP_REVIEW.md).
- **Google login**: OAuth client of type "Web application", redirect URI
  `{API_URL}/auth/google/callback`.

## Release steps

1. Run migrations: `pnpm --filter @repo/api prisma:deploy`
2. Deploy API and worker
3. Deploy web
4. Check `GET {API_URL}/health` returns `"status":"ok"`

## Docker

```bash
docker build -f apps/api/Dockerfile -t app-api .
docker build -f apps/web/Dockerfile -t app-web \
  --build-arg APP_NAME=... --build-arg API_URL=... --build-arg WEB_URL=... .
```
