# Web (Next.js)

Marketing site, creator dashboard and the public pages (store, booking, invoice, download).

## Run locally

From the repo root:

```bash
pnpm dev                          # everything
pnpm --filter @repo/web dev       # only the web app, on http://localhost:3000
```

The web app reads `APP_NAME`, `API_URL`, `WEB_URL` and `RAZORPAY_KEY_ID` from the
root `.env` (see `next.config.mjs`). Nothing secret is exposed to the browser.

## Route groups (`src/app`)

| Group         | URLs                                                                                                   | Notes                            |
| ------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `(marketing)` | `/`, `/pricing`, `/privacy`, `/terms`, `/data-deletion`                                                | Legal pages are required by Meta |
| `(auth)`      | `/login`, `/signup`                                                                                    |                                  |
| `(dashboard)` | `/dashboard`, `/accounts`, `/automations`, `/contacts`, `/store`, `/bookings`, `/invoices`, `/billing` | Protected by `src/middleware.ts` |
| `(public)`    | `/s/[username]`, `/book/[username]`, `/invoice/[id]`, `/download/[token]`                              | No login                         |

## Conventions

- All backend calls go through `src/lib/api.ts` (sends the auth cookie).
- Data fetching uses TanStack Query hooks in `src/hooks/`.
- Forms use React Hook Form + the Zod schemas from `@repo/shared`.
- UI primitives live in `src/components/ui` (shadcn/ui). Add more with
  `pnpm dlx shadcn@latest add <component>` from `apps/web`.
- Never hardcode the brand: use `APP_NAME` from `src/lib/utils.ts`.
