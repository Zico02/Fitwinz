# Fitwinz Official Website — Project analysis

This document answers your request for a clear breakdown of the project. It also records the **Morocco** change you asked for on the checkout **Delivery** country list.

---

## Morocco in the country dropdown

**What you wanted:** Add **Morocco** to the delivery country `<select>` on checkout (alongside United States, Canada, United Kingdom, Mexico).

**What was done:** The production bundle `dist/assets/index-Csxc0UUK.js` was updated so the checkout options include a new `<option>` with the label **Morocco**. That is a **front-end only** label; it does not connect to shipping rules, taxes, or carrier APIs by itself.

**If you rebuild from source later:** Re-apply the same option in `CheckoutPage` (or run `scripts/apply-user-tweaks.mjs` after your bundle matches the strings that script expects).

---

## 1. Project type

- **What it is:** A **single-page application (SPA)** built with **React**. The live site you ship today is primarily the **pre-built output** in **`dist/`** (HTML + one large JavaScript bundle + images), not a hand-edited static HTML-only site.
- **Frontend vs full-stack:** **Frontend-only** in this repo. There is no API server, database, or real authentication backend wired up here. “Login”, “signup”, and “checkout” are **UI flows** (forms, alerts, empty states) rather than secure server-backed accounts or payments.

---

## 2. Technologies used

| Technology | Role |
|------------|------|
| **React** | UI components, state (e.g. cart, wishlist), routing. |
| **React Router** | Paths like `/`, `/login`, `/signup`, `/wishlist`, `/checkout`, `/terms`. |
| **Vite** | Declared in `package.json` as the usual dev server and production bundler for a Vite+React app. In your current workflow, much of the **custom behavior lives in the built file** under `dist/assets/`. |
| **Tailwind CSS** (utility classes in the bundle) | Layout, spacing, typography, responsive classes (`md:`, `lg:`, etc.). |
| **esbuild** (via `npx`) | Used to **syntax-check** the minified bundle after edits. |

---

## 3. Project structure (what matters here)

| Path | Role |
|------|------|
| **`dist/index.html`** | Entry HTML for the app; loads the hashed JS bundle from `dist/assets/`. |
| **`dist/assets/index-Csxc0UUK.js`** | **Main application code** (React app) in one minified file. Most site behavior you have been changing is here. |
| **`dist/images/`** (and similar) | Product photos, logos, payment icons, etc. |
| **`scripts/patch-safe.mjs`** | Earlier batch of safe string replacements (wishlist merge, search, routes, terms HTML injection, etc.). |
| **`scripts/apply-user-tweaks.mjs`** | Follow-up tweaks (hero copy, guest links, shop anchors, Morocco, philosophy layout, footer text, etc.). |
| **`scripts/p9-function.txt`** | Snapshot of the `P9` (Our Philosophy) function as emitted in the bundle; re-read when replacing `P9` in `apply-user-tweaks.mjs`. Regenerate with **`scripts/export-p9.mjs`** after you edit philosophy in the bundle. |
| **`scripts/terms-html.txt`** | HTML body used on the Terms page (injected via `dangerouslySetInnerHTML` in the patched bundle). |
| **`package.json`** | NPM metadata, `vite` dependency, scripts `dev` / `build` / `preview`. |

**Note:** This workspace does **not** currently include a `src/` tree alongside `dist/`; day-to-day changes have been applied to the **compiled** `dist/assets/index-*.js`. If you still have the original Vite `src/` elsewhere, that would be the right place to make the same edits in a maintainable way.

---

## 4. Build system

- **Tool:** **Vite** (see `package.json` scripts: `vite`, `vite build`).
- **`dist/`:** Output of `vite build` — static files you can deploy to any static host (Netlify, Vercel static, S3, GitHub Pages, etc.).
- **Development vs production:**  
  - **Dev:** `npm run dev` runs Vite with HMR against source (when `src/` exists).  
  - **Production:** `npm run build` emits optimized assets into `dist/`.  
  Your recent workflow has been **patching `dist` directly** for speed; that works but is harder to diff and re-apply than editing `src/` and rebuilding.

---

## 5. How the website works

- **UI source:** React components are **compiled into** `dist/assets/index-Csxc0UUK.js`. Names like `LoginPage`, `CheckoutPage`, `WishlistPage` appear in `code-path` comments inside the bundle for traceability.
- **Products:** Product tiles, carousels, and “trending” data are **hardcoded arrays** in the bundle (e.g. men’s carousel `J1`, couples `W1`, trending `Tk1`). They are not loaded from a CMS or API.
- **Navigation:** React Router matches the URL and renders the matching page component. Hash links like `#section-trending-now` scroll to elements with matching `id` on the home page.
- **Global state:** A React context (e.g. cart + wishlist) is created in the bundle so the header badge, wishlist page, and checkout stay in sync in the browser.

---

## 6. Current limitations

- **No real backend:** No user accounts, password storage, order persistence, or payment capture.
- **No database:** Products and copy are fixed in the frontend bundle.
- **No inventory or pricing API:** Changing a price means editing the bundle or source data.
- **Checkout / delivery:** Country list and forms are **cosmetic** unless you integrate a payment provider and shipping API.
- **SEO / deep linking:** Fine for marketing pages; product URLs may be limited depending on how routes and content are structured.

---

## 7. Recommendations

**Do next**

1. **Recover or commit `src/`** and move edits from `dist/assets/index-*.js` back into React source files so `vite build` reproduces your site without manual patching.  
2. **Version the built bundle** or stop editing `dist` directly once `src` is restored.  
3. If you go live with sales: add a **real checkout** (Stripe, PayPal, etc.) and a **privacy policy** aligned with data you collect.

**Avoid**

1. **Editing minified JS by hand** for large features — bracket errors are easy and hard to review.  
2. **Duplicating product arrays** in multiple places without a single module — you already merge trending into wishlist search in the bundle; that should live in one data module in source.  
3. **Trusting client-only “login”** for anything sensitive — always assume the client can be bypassed.

---

## 8. Future upgrade path (toward full-stack)

A practical evolution:

1. **Backend as a service:** **Supabase** or **Firebase** for auth, profiles, and optional product catalog.  
2. **Commerce:** **Stripe Checkout** or **Snipcart** for payments; webhooks to record orders.  
3. **Admin:** Small admin UI or headless CMS (Sanity, Contentful) for products and banners.  
4. **Architecture:** Keep React SPA or move to **Next.js** if you need stronger SEO and server rendering for product pages.

You can keep hosting the marketing site as static files while APIs live on separate subdomains (`api.fitwinz.com`, etc.).

---

## Quick glossary

- **Bundle:** The single large `.js` file the browser downloads that contains almost the whole app.  
- **SPA:** One HTML shell; JavaScript swaps “pages” without full reloads.  
- **Hash / fragment:** The part of the URL after `#`; the browser scrolls to `id="..."` on the same page.

---

*Generated for Fitwinz. For bundle patch order, run `patch-safe.mjs` only on bundles that still contain its “from” strings; then run `apply-user-tweaks.mjs`. After changing philosophy markup, run `node scripts/export-p9.mjs` to refresh `p9-function.txt`.*
