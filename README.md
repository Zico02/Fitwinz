# Fitwinz: fitwinz.ma

Storefront for **Fitwinz**, a Moroccan gym-clothing brand.
Built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

> This is a rebuild of the old site, which was a hand-patched minified bundle in `dist/`.
> The design, copy and images are carried over from the live site.

## Requirements

- Node.js 22.18 or newer (the seed/admin scripts run TypeScript directly)
- npm
- A Supabase project and a Resend account **dedicated to Fitwinz**

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev
```

Open http://localhost:3000 (store) and http://localhost:3000/admin (admin).

Without `.env.local` the store still runs in **preview mode**: it shows the catalog from
`lib/catalog.ts`, but ordering and the admin are disabled.

## Backend setup (once)

1. **Create the database schema.** In Supabase → SQL Editor → New query, paste and run each file
   in `supabase/migrations/`, oldest first.
   (Or with the Supabase CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`.)
2. **Fill `.env.local`** (see `.env.example` for where each value comes from).
3. **Seed the catalog:** `npm run db:seed` (products from `lib/catalog.ts`, 10 units per size).
   Safe to re-run: it never overwrites existing products, prices or stock.
4. **Create your admin account:** `npm run admin:create -- you@example.com` (asks for the password, hidden, twice).
   Run the same command again to reset a forgotten password.
5. Restart `npm run dev`.

### How it works

- **Catalog & settings** are read from Supabase (cached, refreshed immediately after admin edits
  and orders). Currency, delivery fee and free-delivery threshold live in `store_settings` and are
  edited in Admin → Settings.
- **One shipping rule** (`lib/pricing.ts`, mirrored by `shipping_for()` in SQL): free when the
  subtotal before discounts reaches the threshold, otherwise the flat fee. Used by the
  announcement bar, bag, checkout and the order itself.
- **Orders** are created by the `place_order()` database function, called server-side with the
  secret key. It re-checks prices and stock against the database, applies the discount and
  shipping rule, decrements stock and writes the order in one transaction.
- **Emails** (Resend, `lib/emails/`): order confirmation (customer), "on its way" (customer, sent
  once when an order is set to Shipped) and a new-order notification (`ORDER_NOTIFICATION_EMAIL`).
  Table-based HTML with inline styles plus a plain-text version. Each send is recorded in
  `order_emails` (at most once per kind per order); failures show as "email not sent" in the admin
  with a Retry button, and never block or lose an order. Logo files live in `public/email/`;
  product photos are served to mail clients as JPEG by `/email/product.jpg`.
  Preview them with `npm run email:previews` (writes `email-previews/`, gitignored).
- **Admin** (`/admin`): orders and status changes (cancelled/returned puts stock back once),
  products, sizes/stock, photos (Supabase Storage), discount codes, settings.
- **Security**: Row Level Security on every table. Visitors can only read the public catalog;
  orders/customers are readable only by admins. The secret key is only used on the server.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |
| `npm run images:optimize -- <folder> [files...]` | Convert JPG/PNG photos to WebP in `public/images` |
| `npm run email:previews` | Render the three order emails to `email-previews/` (open `index.html`) |
| `npm run test:db` | Run the database tests (schema, RLS, orders, stock) in an in-memory Postgres |
| `npm run db:seed` | Seed Supabase from `lib/catalog.ts` |
| `npm run admin:create -- email` | Create an admin, or reset an admin's password (hidden prompt) |

## Project layout

```
app/                  Routes (App Router)
  page.tsx            Home page
  checkout/           Checkout page + Server Actions (placeOrder, previewDiscount)
  order/[token]/      Order confirmation (private link)
  products/[slug]/    Product pages (server-rendered)
  admin/              Admin dashboard (protected)
  login/ signup/ wishlist/ terms/
  robots.ts sitemap.ts   Generated robots.txt and sitemap.xml
  icon.png apple-icon.png favicon.ico
components/
  Header.tsx          Nav, mega-menu, search overlay, cart drawer, mobile menu
  Footer.tsx
  CartContext.tsx     Cart + wishlist state (saved in localStorage)
  sections/           Home-page sections (hero, carousels, trending, training...)
  auth/ checkout/     Page-specific components
lib/
  catalog.ts          Seed data for the catalog (the live catalog is in Supabase)
  store.ts            Loads catalog + settings from Supabase (cached)
  pricing.ts          Shipping rule, discounts, price formatting
  email.ts            Order emails via Resend
  supabase/           Supabase clients (public, session, server-only secret)
supabase/
  migrations/         Database schema (SQL)
  tests/              Database tests (PGlite)
proxy.ts              Refreshes the admin session (Next 16 "proxy", formerly middleware)
public/images/        Optimized WebP images
scripts/
  optimize-images.mjs Image conversion script
```

## Adding or changing products

Use Admin → Products. Each product has a unique URL slug; the cart keys on `slug + size`.
`lib/catalog.ts` is only the initial seed.

## Images

Photos are stored as WebP (quality 80, max 1600 px) and served through `next/image`,
which resizes them further per device. To add a photo:

```bash
npm run images:optimize -- path/to/folder my-photo.jpg
```

Then reference `/images/my-photo.webp`.

## Deployment (Vercel)

Vercel detects Next.js automatically: no `vercel.json` is needed.
The old `vercel.json` (which served the static `dist/` folder) has been removed.
All routes (`/checkout`, `/terms`, etc.) work on refresh.

## Roadmap

- **Step 2 (done):** Supabase backend, cash-on-delivery checkout, order emails, admin dashboard.
- **Before launch:** verify fitwinz.ma in Resend and set `EMAIL_FROM=Fitwinz <orders@fitwinz.ma>`;
  add the same env variables in Vercel; set real stock in the admin.
- **Step 3:** Legal pages, footer link cleanup, social links, Open Graph tags.
