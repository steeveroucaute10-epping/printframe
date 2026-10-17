# PrintFrame Local-LLM Context

## Purpose and architecture

PrintFrame is a Next.js 15 App Router storefront written in strict TypeScript. PostgreSQL is accessed through Prisma; NextAuth uses credentials plus the Prisma adapter; Stripe Payment Intents handle payment; Redis/BullMQ support background infrastructure; Resend and a local Ollama endpoint are optional integrations. Production runs the Next.js standalone output with PostgreSQL and Redis through Docker Compose.

Important locations:

- `src/app`: server/client pages and route handlers.
- `src/app/api`: authenticated and public HTTP boundaries.
- `src/lib/auth-options.ts`, `auth.ts`, and `env.ts`: shared authentication and fail-closed configuration.
- `src/lib/request-json.ts`, `rate-limit.ts`, and `security-log.ts`: request limits, throttling, and structured security events.
- `src/lib/commerce.ts`: canonical server shipping prices (integer cents) and USD formatting.
- `src/lib/cart-context.tsx`: active in-memory client cart. Cart totals shown in the browser are previews, never payment authority.
- `prisma/schema.prisma`: data model; monetary database fields are integer cents.
- `src/app/api/payments/stripe/route.ts` and `webhook/route.ts`: payment creation and authoritative payment-state transitions.
- `next.config.js`, `Dockerfile`, `docker-compose.yml`, and `.github/workflows/ci-cd.yml`: production controls.

## Security model and invariants

Assume every browser field, URL parameter, JWT claim, uploaded URL, and webhook request is attacker-controlled.

- Prices, availability, shipping cost, order totals, and Stripe amounts are derived on the server from current database variants. Never trust client `unitPrice`, subtotal, discount, or total values.
- API identity comes from a verified NextAuth token, but current role/authorization is reloaded from the database so revocation is immediate. Admin pages repeat a database-backed role check in `src/app/admin/layout.tsx`.
- Registration normalizes email, bounds input, hashes with bcrypt cost 12, returns an enumeration-resistant duplicate response, and handles uniqueness races.
- JSON/raw bodies have streaming byte limits. Zod schemas bound strings, arrays, quantities, URLs, and accepted enums.
- Login, registration, AI, order creation, and payment creation are throttled. Current throttling is process-local and memory-bounded; see residual risks.
- AI routes require authentication. Admin-only content generation is enforced server-side. Ollama destinations are restricted to explicitly allowed local hosts and requests time out.
- Stripe webhooks use the untouched raw body and `STRIPE_WEBHOOK_SECRET`. A successful event must match order ID metadata, amount, currency, and Payment Intent binding. Database transactions and conditional updates make transitions idempotent and prevent completed payments from being downgraded.
- A client-side Stripe confirmation is not proof of payment. Fulfillment must require `Payment.status === COMPLETED` (and the corresponding confirmed order state set by the signed webhook).
- Production fails closed when `NEXTAUTH_SECRET` is missing/short or required Compose variables are absent. Missing Stripe credentials disable real checkout rather than accepting an unverified payment.
- Global headers enforce CSP, frame denial, MIME sniffing protection, a restrictive permissions policy, referrer policy, and production HSTS. Keep Stripe origins aligned when changing CSP.
- Containers run as a non-root user with a read-only filesystem, dropped capabilities, `no-new-privileges`, resource limits, and pinned deployment image tags. CI third-party actions are commit-pinned.
- Security logs are structured and intentionally avoid credentials, request bodies, and other secrets.

## Remediations and optimizations completed

Security hardening:

- Centralized NextAuth options and production secret validation.
- Added database-backed request authorization and protected the admin route tree.
- Added bounded body readers, Zod request validation, throttling, and security-event logging.
- Reworked order/payment creation to ignore client prices and batch-load unique variants.
- Added Stripe Elements checkout and a signed, amount/currency/order-bound, idempotent webhook.
- Added secure headers, hardened Docker/Compose settings, CI secret placeholders, and deployment fail-closed variables.
- Added security tests for registration, orders, products, AI routes, Stripe creation/webhooks, and production configuration.

Performance and maintainability:

- Product/order APIs use bounded pagination and run list/count queries concurrently.
- Admin order management loads 50 rows per page, performs status aggregation in PostgreSQL, and selects only rendered relation fields instead of loading every item/payment/address.
- Dashboard queries run concurrently and recent-order/product queries select/count only rendered data.
- Public active-product responses allow a 60-second shared cache with stale-while-revalidate; authenticated/order responses remain uncached.
- Shipping prices are centralized in integer cents, and admin currency display now converts cents correctly.
- Cart context derives totals once per render and memoizes its provider value.
- Removed duplicate toast mounts, unused imports/dependencies, obsolete duplicate root layouts, and legacy cart code that referenced nonexistent Prisma tables. The active cart remains `src/lib/cart-context.tsx`; there is intentionally no server `/api/cart` until a real persistent model is designed.
- Added `/api/health` database readiness for the existing Docker health checks.
- Added non-interactive ESLint flat configuration compatible with Next.js 15. The lint script treats warnings as failures.

## Environment and deployment

Start from `.env.example`; never commit values.

Required for the production Compose stack:

- `DATABASE_URL` (constructed in Compose from required `POSTGRES_PASSWORD`)
- `POSTGRES_PASSWORD`
- `NEXTAUTH_SECRET` (random, at least 32 characters)
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` (public HTTPS origin)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (also passed at image build time)

Integration-specific variables:

- `REDIS_URL`
- `RESEND_API_KEY`
- `OLLAMA_BASE_URL` and optional `OLLAMA_MODEL`
- R2 variables in `.env.example` when object storage is implemented.

Stripe setup:

1. Create an endpoint for `https://<host>/api/payments/stripe/webhook`.
2. Subscribe at minimum to `payment_intent.succeeded`, `payment_intent.payment_failed`, and `payment_intent.canceled`.
3. Put that endpoint's signing secret in `STRIPE_WEBHOOK_SECRET`; do not use an API key as the webhook secret.
4. Set matching test/live publishable and secret keys, then exercise a signed webhook before accepting orders.

Deploy by generating/applying reviewed Prisma migrations, building the standalone image with the publishable Stripe key, setting `PRINTFRAME_IMAGE_TAG` to an immutable image tag, and running `docker compose up -d`. Confirm `/api/health`, container health, webhook delivery, and a test payment before routing production traffic.

## Verification

Run from a Node 20 environment:

```bash
npx prisma validate
npx prisma generate
npm run lint
npx tsc --noEmit
npm test
npm run build
npm audit
docker compose config
git diff --check
```

## Residual risks and safe-change guidance

- Rate limiting is in-memory and per process. Replace it with Redis-backed atomic limits before horizontal scaling; preserve fail-closed behavior on sensitive routes.
- The cart is client-memory-only and not durable. Treat it as display state. A future server cart needs explicit ownership, expiration, database models/migrations, and server-side repricing.
- Tax, discounts, inventory reservation, saved checkout addresses, password reset, and production image storage are incomplete. Do not imply these are enforced until their server workflows exist.
- CSP still permits inline scripts/styles as required by the current Next.js/Stripe setup. Tighten with a tested nonce strategy rather than deleting directives blindly.
- Product catalog caching can be stale for up to five minutes. Add explicit invalidation if immediate publication is required.
- Health readiness checks PostgreSQL, not Redis, Stripe, Ollama, or Resend.
- Security logs currently go to stdout. Production should collect, retain, alert on, and access-control them.
- `npm audit --omit=dev` is clean. The full audit currently reports a high-severity `braces` denial-of-service advisory only through the ESLint/Next lint toolchain; npm offers only a breaking forced downgrade. Reassess when a compatible patched lint chain is released rather than forcing an incompatible production change.
- Before changing checkout or fulfillment, trace both payment creation and webhook transitions, keep all money in integer cents, and add mismatch/idempotency tests.
- Before changing auth, keep role checks database-backed at privileged boundaries. Do not authorize from UI state or stale JWT role claims alone.
- Prefer narrow Prisma `select`, bounded pagination, parallel independent queries, server components by default, and cache only public data whose staleness is acceptable.
