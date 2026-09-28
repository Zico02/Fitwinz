# Fitwinz: fitwinz.ma

Storefront for **Fitwinz**, a Moroccan gym-clothing brand.
Built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

> This is a rebuild of the old site, which was a hand-patched minified bundle in `dist/`.
> The design, copy and images are carried over from the live site.

## Requirements

- Node.js 20 or newer (tested with Node 22)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To test a production build locally:

```bash
npm run build
npm start
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |
| `npm run images:optimize -- <folder> [files...]` | Convert JPG/PNG photos to WebP in `public/images` |

## Project layout

```
app/                  Routes (App Router)
  page.tsx            Home page
  checkout/ login/ signup/ wishlist/ terms/
  robots.ts sitemap.ts   Generated robots.txt and sitemap.xml
  icon.png apple-icon.png favicon.ico
components/
  Header.tsx          Nav, mega-menu, search overlay, cart drawer, mobile menu
  Footer.tsx
  CartContext.tsx     Cart + wishlist state (saved in localStorage)
  sections/           Home-page sections (hero, carousels, trending, training...)
  auth/ checkout/     Page-specific components
lib/
  catalog.ts          The single product/catalog data source
  format.ts           Price formatting (currency lives here)
public/images/        Optimized WebP images
scripts/
  optimize-images.mjs Image conversion script
```

## Adding or changing products

Every product lives in `lib/catalog.ts`. Each product has a unique `id` (a URL-safe slug).
The cart keys on `id + size`, so ids must never be reused.

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

- **Step 2:** Supabase backend (products, stock, orders), cash-on-delivery checkout for Morocco,
  order emails via Resend, admin dashboard.
- **Step 3:** Legal pages, footer link cleanup, social links, Open Graph tags.
