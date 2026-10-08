# PrintFrame — Cline implementation brief

Work from **local `main`** (`d548461` Phase 1 scaffolding). Do **not** merge or continue GitHub PRs **#2** or **#3** — both were rejected; they invent APIs, break Prisma, and do not compile.

This is a **phase-1** Next.js 14 App Router app (TypeScript, Tailwind, Prisma, PostgreSQL). Marketing pages exist as stubs. Checkout, auth, Stripe, admin, API routes, workers, and tests are **not implemented**. Stubs are OK until a section below says to replace them.

**Issue tracker:** https://github.com/steeveroucaute10-epping/printframe/issues/1

---

## Rules (read first)

1. Only use models/fields that exist in `prisma/schema.prisma`. Never invent `prisma.coupon`, `prisma.category`, `@/lib/auth`, `paymentStatus`, `productName` on `OrderItem`, etc.
2. Never write `import { "foo" }` (quoted identifiers). Never write `minLength=8`; use `minLength={8}`.
3. Named vs default exports must match. `header.tsx` / `footer.tsx` today are **default** exports.
4. Prices: store **integer cents** in the DB. Never persist client `unitPrice`. Recompute from `ProductVariant` (or a server map that matches variants) when orders exist.
5. Do not implement Stripe, NextAuth, R2, BullMQ workers, admin, or Ollama agents until the current phase’s acceptance checks pass.
6. After each phase run: `npx prisma validate`, then `npx tsc --noEmit`, then `npm run dev`. Paste command output in the PR if you open one.
7. Prefer the smallest change. Do not rewrite `frame-configurator.tsx` into a second copy on `/customize`.

---

## Current repo (what is true on `main`)

| Area | Reality |
|---|---|
| Pages | Static marketing, cart empty state, checkout hardcoded totals, auth pages `return null` |
| Layout | `src/app/layout.tsx` renders `{children}` + toaster only — **no Header, Footer, CartProvider** |
| Cart | `src/lib/cart-context.tsx` exists; configurator does not dispatch into it |
| Prisma | `prisma/schema.prisma` **will not generate** (broken Address relations, missing back-relations) |
| Config | `next.config.js` uses `export default` in a `.js` file (invalid CJS) |
| CSS | `src/app/globals.css` is Tailwind **v4** syntax; `package.json` has Tailwind **3.4.16** |
| Deps | UI imports `sonner`, Radix, `class-variance-authority` — **not in package.json** |
| Docker | `docker-compose.yml` runs `npm run worker` (script missing); Bull Board entrypoint is wrong |
| Tests / seed | Scripts exist; no tests, no `prisma/seed.ts`, `prisma/migrations/` is gitignored |

README describes a full store. Treat README as a **product vision**, not as implemented code.

---

## Phase 0 — Make the app boot (do this first)

Goal: `npx prisma generate` and `npm run dev` work. Visible chrome. No blank auth routes.

### 0.1 Prisma schema

File: `prisma/schema.prisma`

**Order** must declare scalar FKs and **named** relations:

```prisma
shippingAddressId String?
billingAddressId  String?
shippingAddress   Address? @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
billingAddress    Address? @relation("BillingAddress", fields: [billingAddressId], references: [id])
tickets           Ticket[]
reviews           Review[]
```

**Address** must be arrays **without** `fields` (do **not** relate `Address.id` to `Order.id`):

```prisma
shippingOrders Order[] @relation("ShippingAddress")
billingOrders  Order[] @relation("BillingAddress")
```

Also:

- `NewsletterSub`: add optional `userId` + `user User?` (User already has `newsletterSubs`).
- `ProductVariant`: add `wishlist WishlistItem[]`.
- `Review`: `order Order? @relation(fields: [orderId], references: [id])` and `Order.reviews Review[]`.
- `BlogPost.authorId`: either add `author User?` **and** `User.blogPosts BlogPost[]`, or drop `authorId`.
- Money fields (`basePrice`, `price`, totals, `Payment.amount`, etc.): change `Float` → `Int` (cents). Add `// TODO(phase-2): cents` if you keep Float for now — prefer Int.

`.gitignore`: **stop ignoring** `prisma/migrations/`. **Do ignore** `.env` (not only `.env.local`).

Run: `npx prisma validate` then `npx prisma generate`.

### 0.2 Next config

File: `next.config.js`

- Use `module.exports = nextConfig` **or** rename to `next.config.mjs`. Do not `export default` in `.js` without `"type": "module"`.
- Restrict `images.remotePatterns` (no `hostname: '**'`). Localhost / your R2 host only.
- Delete the no-op `/api/health` rewrite (route does not exist).
- Do **not** set `output: 'standalone'` until `public/` exists and Docker needs it.

### 0.3 Tailwind — pick one stack

**Recommended:** keep Tailwind **3** (`package.json` already has it).

- `src/app/globals.css`: replace `@import "tailwindcss"` / `@theme inline` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Keep CSS variables if needed via `:root` + `tailwind.config.js` `theme.extend`.

- Add missing Tailwind plugins **or** remove them from `tailwind.config.js`: `@tailwindcss/forms`, `@tailwindcss/typography`.

If you upgrade to Tailwind 4 instead, add `tailwindcss@4` **and** `@tailwindcss/postcss`, and update `postcss.config.js`. Do not remove `tailwindcss` from `package.json`.

### 0.4 Missing packages

Add (do not fake imports):

```
sonner
@radix-ui/react-slot
@radix-ui/react-label
@radix-ui/react-select
@radix-ui/react-toast
class-variance-authority
```

Commit a lockfile. Layout toaster: keep `@/components/ui/sonner-toaster` (client). `sonner.tsx` currently returns `null` — do not switch layout to that file.

### 0.5 Layout chrome

File: `src/app/layout.tsx`

- Client wrapper `src/lib/providers.tsx` with `CartProvider`.
- Render `Header`, `<main>{children}</main>`, `Footer`, toaster inside `Providers`.
- Import Header/Footer as **defaults**: `import Header from "@/components/header"`.
- Delete or stop using `src/components/app-root.tsx` (second `<html>`/`<body>`).
- `src/components/not-found.tsx` → move to `src/app/not-found.tsx` if you want App Router 404.

Header: wire `itemCount` from `useCart` (Header must be `"use client"`). Remove links to missing routes (`/wishlist`, `/gifts`) or add stub pages. Mobile menu needs state.

### 0.6 `/customize` import

`src/app/customize/page.tsx` dynamically imports a **default** export. `FrameConfigurator` is a **named** export.

Keep a **server** page with `metadata` that renders `<FrameConfigurator />` via named import (same as `src/app/create/page.tsx`). Do not turn the page into `"use client"` and do not duplicate the configurator into the page file.

### 0.7 Auth pages (stubs, not NextAuth)

Files: `src/app/(auth)/login|register|forgot-password|reset-password/page.tsx`

They `return null`. Replace with visible forms (email/password). Submit may no-op or `TODO`. No `useEffect` on a server component. No unused `headers`/`redirect`.

### 0.8 Input types

`src/components/ui/input.tsx`: `forwardRef<HTMLInputElement, InputProps>`.

### 0.9 Docker (phase 0 only)

- Comment out or remove compose **`worker`** (`npm run worker` does not exist).
- Comment out **`bull-board`** (wrong API, wrong path, `bull` vs `bullmq`).
- Bind Postgres/Redis to `127.0.0.1` if you keep host ports. Default password is OK for local only.

### Phase 0 acceptance

- [ ] `npx prisma validate` succeeds
- [ ] `npm install` && `npx tsc --noEmit` succeed
- [ ] `npm run dev` starts
- [ ] `/`, `/create` or `/customize`, `/cart`, `/login` show UI (stubs OK)
- [ ] Header and footer visible; cart badge can go above 0 after add-to-cart (next phase if not yet wired)

---

## Phase 1 — One vertical slice (after boot)

Configurator → cart → cart page. Still **no Stripe**.

1. `FrameConfigurator` `dispatch({ type: 'ADD_ITEM', ... })` into `useCart`. Prices displayed in dollars; when you later persist orders, convert to cents **on the server**.
2. `src/app/cart/page.tsx`: list items, quantity, remove, shipping method. Empty state only when `items.length === 0`.
3. Persist cart in `localStorage` (client) so refresh does not wipe it.
4. One source of shipping rates (`src/lib/utils.ts` vs `cart-context.tsx` vs “free over $50” copy).
5. Upload: enforce JPG/PNG/WebP (not `image/*` / SVG), max 10MB as advertised. Preview with `<img>` or blob URL, not `next/image` + data URLs.
6. Hide or wire no-op buttons (Crop / Rotate / Apply Changes). Do not leave unlabeled dead controls.
7. `src/app/page.tsx`: drop `ssr: false` on the homepage. Remove or label fake “4.9/5 from 2,400+ reviews”.
8. Dead account links (`/account/addresses`, `/settings`, `/support`): stub pages or remove from nav.

**`createOrder`** (`src/lib/server-actions.ts`):

- Add `"use server"` only if this is a real server action.
- Do **not** take `unitPrice` / totals from the client. Load `ProductVariant.price`.
- If money is cents, shipping is `599` not `5.99`.
- Leave unwired until checkout exists if easier — but do not add `auth.getUserId()` until NextAuth exists.

### Phase 1 acceptance

- [ ] Add to cart from `/create` updates header count and `/cart`
- [ ] Cart survives refresh
- [ ] No Prisma/client field mismatches

---

## Phase 2 — Auth + account (after phase 1)

- NextAuth (credentials and/or OAuth) with `NEXTAUTH_SECRET`.
- `src/app/api/auth/[...nextauth]/route.ts`.
- `middleware.ts` protecting `/account/**`.
- Real login/register using `User.passwordHash` (hash with bcrypt/argon2 — never store plaintext).
- Account orders list from Prisma for the session user only (no IDOR).
- Do not trust `User.role` from the client. No admin UI until middleware checks `ADMIN` / `MANAGER` on the **session**.

---

## Phase 3 — Checkout + payments

- Checkout form bound to cart; create `Address` + `Order` in a transaction.
- Stripe PaymentIntent / Checkout Session; amount from **server** cents total.
- Webhook route verifying `STRIPE_WEBHOOK_SECRET`; update `Payment` + `Order.status`.
- Guest checkout via `guestEmail` is already on `Order`.
- Tax: stub 0 or a simple rate; document it.
- Discount codes: `DiscountCode` model only. Validate `active`, `expiresAt`, `usageLimit` on the server. Never `SET_DISCOUNT` with an arbitrary dollar amount from the client.

---

## Phase 4 — Catalog, photos, production

- Seed products/variants (`prisma/seed.ts`); `getProducts` / `getProductBySlug` (filter `status: ACTIVE`).
- `/frames` reads Prisma, not a placeholder grid.
- Upload originals to Cloudflare R2; store URLs on `OrderPhoto` / `SavedPhoto`.
- Print queue: BullMQ worker **after** adding `npm run worker` and a real worker file. Use **bullmq**, not `bull`. Protect Bull Board with auth or bind to localhost.
- Order tracking: `/track` looks up `orderNumber`; do not show fake “Order Placed” for every query.

---

## Phase 5 — Back office + the rest

- `src/app/admin/**` behind role middleware.
- Order management, inventory on `ProductVariant.inventoryCount`.
- Resend emails (order confirmation).
- Contact form → email or `Ticket`.
- Tests: Jest for price/cart helpers; Playwright for configurator → cart.
- `generateOrderNumber`: unique constraint + retry; do not rely on `Math.random()` alone.
- Compose: Redis AUTH before any non-localhost use. Ollama optional.

---

## Explicitly out of scope until the matching phase

- Full rewrite of the configurator / extra mount types not in Prisma enums (`FrameColor`, `MattingOption`).
- Hardcoded client promo codes as the source of truth.
- Unauthenticated `updateOrderStatus`.
- Fabricated social proof.
- Implementing the five Ollama agents in `agents/config.yaml`.

---

## Suggested first commit message (phase 0 only)

```
fix: make Prisma generate and the Next.js app boot

Align schema relations, Tailwind 3, next.config, UI deps, and root layout chrome.
```
