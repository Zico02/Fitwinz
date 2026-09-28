// Renders the three order emails with a sample order into email-previews/ (gitignored).
//
//   npm run email:previews
//
// Images load from the local dev server by default, so keep `npm run dev` running while you look
// at them. Use --site=https://fitwinz.ma to preview against the live site instead.
import fs from "node:fs";
import path from "node:path";
import {
  renderAdminNotification,
  renderOrderCancelled,
  renderOrderConfirmation,
  renderOrderShipped,
  type OrderEmailData,
} from "../lib/emails/templates.ts";

const siteArg = process.argv.find((a) => a.startsWith("--site="))?.slice("--site=".length);
const site = (siteArg ?? "http://localhost:3000").replace(/\/$/, "");
const urls = { site, admin: "http://localhost:3000" };

const sample: OrderEmailData = {
  orderNumber: "FW-1042",
  publicToken: "3f2b8c1e-5d4a-4e7b-9c1a-2b3c4d5e6f70",
  adminOrderId: "8a7b6c5d-4e3f-4a1b-9c8d-7e6f5a4b3c2d",
  createdAt: "2026-09-29T14:32:00Z",
  fullName: "Yasmine El Amrani",
  phone: "+212612345678",
  email: "yasmine@example.com",
  city: "Casablanca",
  addressLine: "24 Rue Ibn Battouta, Résidence Al Andalous, Apt 7, Maârif",
  notes: "Please call 30 minutes before arriving.",
  currencyPrefix: "US$",
  subtotal: 123,
  discountCode: "WELCOME10",
  discountAmount: 12.3,
  shippingFee: 0,
  total: 110.7,
  items: [
    { name: "Oversized Fit", color: "Ice Blue", size: "M", quantity: 1, unitPrice: 44, lineTotal: 44, imageUrl: "/images/ice_front.webp" },
    { name: "Compression Top", color: "Black/Grey", size: "L", quantity: 1, unitPrice: 35, lineTotal: 35, imageUrl: "/images/compressor_fit.webp" },
    { name: "Pro Shaker", color: "Black", size: "OS", quantity: 1, unitPrice: 20, lineTotal: 20, imageUrl: "/images/shaker_fitwinz.webp" },
    { name: "Performance Socks", color: "White", size: "OS", quantity: 2, unitPrice: 12, lineTotal: 24, imageUrl: "/images/sock_Fitwinz.webp" },
  ],
  carrier: "Amana",
  trackingNumber: "RR123456789MA",
  trackingUrl: "https://www.poste.ma/fr/suivi-envoi",
  cancellationReason: "The Ice Blue Oversized Fit in size M is no longer available. We're sorry for the inconvenience.",
};

const outDir = path.join(process.cwd(), "email-previews");
fs.mkdirSync(outDir, { recursive: true });

const emails = [
  ["1-order-confirmation", renderOrderConfirmation(sample, urls)],
  ["2-order-shipped", renderOrderShipped(sample, urls)],
  ["3-new-order-notification", renderAdminNotification(sample, urls)],
  ["4-order-cancelled", renderOrderCancelled(sample, urls)],
] as const;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const [name, email] of emails) {
  fs.writeFileSync(path.join(outDir, `${name}.html`), email.html);
  fs.writeFileSync(path.join(outDir, `${name}.txt`), `Subject: ${email.subject}\n\n${email.text}`);
}

fs.writeFileSync(
  path.join(outDir, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Fitwinz email previews</title>
<body style="font-family:system-ui;margin:24px;background:#eee">
<h1>Fitwinz email previews</h1>
<p>Images load from <code>${escape(site)}</code>. Widths: desktop (620px) and phone (375px).</p>
${emails
  .map(
    ([name, email]) => `<h2>${escape(email.subject)}</h2>
<p><a href="${name}.html">Open HTML</a> · <a href="${name}.txt">Plain-text version</a></p>
<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
<iframe src="${name}.html" style="width:620px;height:900px;border:1px solid #ccc;background:#fff"></iframe>
<iframe src="${name}.html" style="width:375px;height:900px;border:1px solid #ccc;background:#fff"></iframe>
</div>`,
  )
  .join("\n")}
</body>`,
);

console.log(`Wrote ${emails.length} emails (HTML + text) to ${outDir}`);
console.log(`Open: ${path.join(outDir, "index.html")}`);
