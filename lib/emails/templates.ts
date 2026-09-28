// Transactional email templates: table-based HTML with inline styles (Gmail, Outlook, Apple Mail,
// Yahoo) plus a plain-text version of every email. Pure functions with no server imports, so
// scripts/email-previews.mts can render them too.
import { formatPrice } from "../pricing.ts";

export interface EmailItem {
  name: string;
  color: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Site path ("/images/x.webp") or Supabase Storage URL, as stored on the order. */
  imageUrl: string | null;
}

export interface OrderEmailData {
  orderNumber: string;
  publicToken: string;
  adminOrderId: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string;
  addressLine: string;
  notes: string | null;
  currencyPrefix: string;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  items: EmailItem[];
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export interface EmailUrls {
  /** Public site: logo, product photos and customer links (must be reachable by mail clients). */
  site: string;
  /** Base for the "Open in admin" link in the owner notification. */
  admin: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export const INSTAGRAM_URL = "https://www.instagram.com/fitwinz_store/";
export const INSTAGRAM_HANDLE = "@fitwinz_store";

const FONT = "Helvetica, Arial, sans-serif";
const INK = "#111111";
const MUTED = "#666666";
const LINE = "#e5e5e5";

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? "";

export function formatOrderDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" }).format(
    new Date(iso),
  );
}

function productImage(urls: EmailUrls, imageUrl: string | null) {
  if (!imageUrl) return null;
  return `${urls.site}/email/product.jpg?src=${encodeURIComponent(imageUrl)}&w=128`;
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------
function layout(urls: EmailUrls, opts: { title: string; preheader: string; body: string; footerNote: string }) {
  const site = esc(urls.site);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(opts.title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .stack { display: block !important; width: 100% !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;">
  <tr>
    <td align="center" style="padding:32px 24px 8px 24px;background-color:#ffffff;">
      <a href="${site}" style="text-decoration:none;"><img src="${site}/email/fitwinz-logo@2x.png" width="160" height="116" alt="Fitwinz" style="display:block;border:0;outline:none;width:160px;height:116px;font-family:${FONT};font-size:24px;font-weight:bold;color:${INK};"></a>
    </td>
  </tr>
  <tr>
    <td class="px" style="padding:16px 40px 32px 40px;font-family:${FONT};font-size:15px;line-height:24px;color:${INK};">
${opts.body}
    </td>
  </tr>
  <tr>
    <td class="px" style="padding:24px 40px;border-top:1px solid ${LINE};font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="padding-right:12px;"><a href="${site}"><img src="${site}/email/fitwinz-logo-small@2x.png" width="32" height="23" alt="Fitwinz" style="display:block;border:0;width:32px;height:23px;"></a></td>
          <td valign="middle" style="font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">
            <strong style="color:${INK};">Fitwinz, Morocco</strong><br>
            <a href="${INSTAGRAM_URL}" style="color:${MUTED};text-decoration:underline;">Instagram ${INSTAGRAM_HANDLE}</a> &middot;
            <a href="${site}" style="color:${MUTED};text-decoration:underline;">${esc(urls.site.replace(/^https?:\/\//, ""))}</a>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0 0;">${esc(opts.footerNote)}</p>
    </td>
  </tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 8px 0;font-family:${FONT};font-size:22px;line-height:30px;font-weight:bold;color:${INK};">${text}</h1>`;
}

function paragraph(html: string, style = "") {
  return `<p style="margin:0 0 16px 0;font-family:${FONT};font-size:15px;line-height:24px;color:${INK};${style}">${html}</p>`;
}

function sectionTitle(text: string) {
  return `<h2 style="margin:28px 0 8px 0;font-family:${FONT};font-size:13px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${INK};">${text}</h2>`;
}

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px 0;">
  <tr><td align="center" bgcolor="#000000" style="border-radius:999px;background-color:#000000;">
    <a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:14px;font-weight:bold;letter-spacing:0.5px;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)}</a>
  </td></tr>
</table>`;
}

function itemsTable(order: OrderEmailData, urls: EmailUrls, withPhotos: boolean) {
  const money = (n: number) => esc(formatPrice(n, order));
  const rows = order.items
    .map((item) => {
      const img = withPhotos ? productImage(urls, item.imageUrl) : null;
      const details = [item.color ? `Color: ${esc(item.color)}` : "", `Size: ${esc(item.size)}`, `Qty: ${item.quantity}`]
        .filter(Boolean)
        .join(" &middot; ");
      return `<tr>
  ${
    withPhotos
      ? `<td width="76" valign="top" style="width:76px;padding:12px 12px 12px 0;border-bottom:1px solid ${LINE};">${
          img
            ? `<img src="${esc(img)}" width="64" height="85" alt="${esc(item.name)}" style="display:block;border:0;width:64px;height:85px;background-color:#f5f5f5;">`
            : ""
        }</td>`
      : ""
  }
  <td valign="top" style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:14px;line-height:20px;color:${INK};">
    <strong>${esc(item.name)}</strong><br>
    <span style="color:${MUTED};font-size:13px;">${details}</span>
  </td>
  <td valign="top" align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:14px;line-height:20px;color:${INK};white-space:nowrap;"><strong>${money(item.lineTotal)}</strong></td>
</tr>`;
    })
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
${rows}
</table>`;
}

function totalsTable(order: OrderEmailData) {
  const money = (n: number) => esc(formatPrice(n, order));
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-family:${FONT};font-size:${strong ? 16 : 14}px;line-height:22px;color:${strong ? INK : MUTED};${strong ? "font-weight:bold;" : ""}">${label}</td>
<td align="right" style="padding:4px 0;font-family:${FONT};font-size:${strong ? 16 : 14}px;line-height:22px;color:${INK};${strong ? "font-weight:bold;" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
${row("Subtotal", money(order.subtotal))}
${order.discountAmount > 0 ? row(`Discount (${esc(order.discountCode ?? "")})`, `-${money(order.discountAmount)}`) : ""}
${row("Shipping", order.shippingFee === 0 ? "Free" : money(order.shippingFee))}
${row("Total", money(order.total), true)}
${row("Payment", "Cash on delivery")}
</table>`;
}

function deliveryBlock(order: OrderEmailData, phoneAsLink = false) {
  const phone = phoneAsLink
    ? `<a href="tel:${esc(order.phone)}" style="color:${INK};text-decoration:underline;">${esc(order.phone)}</a>`
    : esc(order.phone);
  return `${sectionTitle("Delivery")}
${paragraph(`${esc(order.fullName)}<br>${esc(order.addressLine)}<br>${esc(order.city)}, Morocco<br>Phone: ${phone}`, "margin-bottom:0;")}
${order.notes ? paragraph(`<span style="color:${MUTED};">Notes: ${esc(order.notes)}</span>`, "margin-top:8px;") : ""}`;
}

function contactLine() {
  return paragraph(
    `Questions? Just reply to this email or message us on Instagram <a href="${INSTAGRAM_URL}" style="color:${INK};text-decoration:underline;">${INSTAGRAM_HANDLE}</a>.`,
    "margin-top:24px;",
  );
}

// Plain-text helpers
const textItems = (order: OrderEmailData) =>
  order.items
    .map(
      (i) =>
        `- ${i.name}${i.color ? `, ${i.color}` : ""}, size ${i.size}, qty ${i.quantity}: ${formatPrice(i.lineTotal, order)}`,
    )
    .join("\n");

const textTotals = (order: OrderEmailData) =>
  [
    `Subtotal: ${formatPrice(order.subtotal, order)}`,
    ...(order.discountAmount > 0 ? [`Discount (${order.discountCode}): -${formatPrice(order.discountAmount, order)}`] : []),
    `Shipping: ${order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee, order)}`,
    `Total: ${formatPrice(order.total, order)}`,
    "Payment: cash on delivery",
  ].join("\n");

const textDelivery = (order: OrderEmailData) =>
  `${order.fullName}\n${order.addressLine}\n${order.city}, Morocco\nPhone: ${order.phone}${order.notes ? `\nNotes: ${order.notes}` : ""}`;

const textFooter = (urls: EmailUrls, note: string) =>
  `--\nFitwinz, Morocco\nInstagram ${INSTAGRAM_HANDLE}: ${INSTAGRAM_URL}\n${urls.site}\n\n${note}`;

// ---------------------------------------------------------------------------
// 1. Customer order confirmation
// ---------------------------------------------------------------------------
export function renderOrderConfirmation(order: OrderEmailData, urls: EmailUrls): RenderedEmail {
  const name = firstName(order.fullName);
  const date = formatOrderDate(order.createdAt);
  const orderLink = `${urls.site}/order/${order.publicToken}`;
  const footerNote = "You received this email because you placed an order at fitwinz.ma.";

  const body = [
    heading(`Thank you for your order, ${esc(name)}!`),
    paragraph(`<span style="color:${MUTED};">Order <strong style="color:${INK};">${esc(order.orderNumber)}</strong> &middot; ${esc(date)}</span>`),
    paragraph("We have received your order and are getting it ready. We'll call you to confirm before shipping."),
    sectionTitle("Your order"),
    itemsTable(order, urls, true),
    totalsTable(order),
    deliveryBlock(order),
    button("View your order", orderLink),
    contactLine(),
  ].join("\n");

  return {
    subject: `Your Fitwinz order ${order.orderNumber} is confirmed`,
    html: layout(urls, {
      title: `Order ${order.orderNumber} confirmed`,
      preheader: `Thanks ${name}! We'll call you to confirm before shipping. Total ${formatPrice(order.total, order)}, cash on delivery.`,
      body,
      footerNote,
    }),
    text: `Thank you for your order, ${name}!

Order ${order.orderNumber} - ${date}

We have received your order and are getting it ready. We'll call you to confirm before shipping.

YOUR ORDER
${textItems(order)}

${textTotals(order)}

DELIVERY
${textDelivery(order)}

View your order: ${orderLink}

Questions? Just reply to this email or message us on Instagram ${INSTAGRAM_HANDLE} (${INSTAGRAM_URL}).

${textFooter(urls, footerNote)}
`,
  };
}

// ---------------------------------------------------------------------------
// 2. "Your order is on its way"
// ---------------------------------------------------------------------------
export function renderOrderShipped(order: OrderEmailData, urls: EmailUrls): RenderedEmail {
  const name = firstName(order.fullName);
  const total = formatPrice(order.total, order);
  const footerNote = "You received this email because you placed an order at fitwinz.ma.";
  const trackingUrl = order.trackingUrl && /^https?:\/\//.test(order.trackingUrl) ? order.trackingUrl : null;

  const shippingRows = [
    order.carrier ? `Carrier: <strong>${esc(order.carrier)}</strong>` : "",
    order.trackingNumber
      ? `Tracking number: ${
          trackingUrl
            ? `<a href="${esc(trackingUrl)}" style="color:${INK};text-decoration:underline;"><strong>${esc(order.trackingNumber)}</strong></a>`
            : `<strong>${esc(order.trackingNumber)}</strong>`
        }`
      : "",
  ].filter(Boolean);

  const body = [
    heading(`Your order is on its way, ${esc(name)}!`),
    paragraph(`<span style="color:${MUTED};">Order <strong style="color:${INK};">${esc(order.orderNumber)}</strong></span>`),
    paragraph("Good news: your order has left our hands and is on its way to you."),
    shippingRows.length ? paragraph(shippingRows.join("<br>")) : "",
    trackingUrl ? button("Track your package", trackingUrl) : "",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px 0;">
  <tr><td style="padding:16px 20px;border:2px solid ${INK};font-family:${FONT};font-size:15px;line-height:22px;color:${INK};">
    <strong>Have the cash ready: ${esc(total)} to pay on delivery.</strong>
  </td></tr>
</table>`,
    sectionTitle("Items"),
    itemsTable(order, urls, false),
    deliveryBlock(order),
    contactLine(),
  ].join("\n");

  const textShipping = [
    order.carrier ? `Carrier: ${order.carrier}` : "",
    order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : "",
    trackingUrl ? `Track your package: ${trackingUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Your Fitwinz order ${order.orderNumber} is on its way`,
    html: layout(urls, {
      title: `Order ${order.orderNumber} shipped`,
      preheader: `Your order is on its way. Please have ${total} ready to pay on delivery.`,
      body,
      footerNote,
    }),
    text: `Your order is on its way, ${name}!

Order ${order.orderNumber}

Good news: your order has left our hands and is on its way to you.
${textShipping ? `\n${textShipping}\n` : ""}
Have the cash ready: ${total} to pay on delivery.

ITEMS
${textItems(order)}

DELIVERY
${textDelivery(order)}

Questions? Just reply to this email or message us on Instagram ${INSTAGRAM_HANDLE} (${INSTAGRAM_URL}).

${textFooter(urls, footerNote)}
`,
  };
}

// ---------------------------------------------------------------------------
// 3. New-order notification for the shop owner
// ---------------------------------------------------------------------------
export function renderAdminNotification(order: OrderEmailData, urls: EmailUrls): RenderedEmail {
  const total = formatPrice(order.total, order);
  const adminLink = `${urls.admin}/admin/orders/${order.adminOrderId}`;
  const date = formatOrderDate(order.createdAt);
  const footerNote = "Internal notification for the Fitwinz team.";
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  const body = [
    heading(`New order ${esc(order.orderNumber)}`),
    paragraph(`<span style="color:${MUTED};">${esc(date)} &middot; ${itemCount} item${itemCount === 1 ? "" : "s"}</span>`),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px 0;background-color:#f5f5f5;">
  <tr><td style="padding:16px 20px;font-family:${FONT};font-size:15px;line-height:24px;color:${INK};">
    <span style="font-size:13px;color:${MUTED};">To collect (cash on delivery)</span><br>
    <strong style="font-size:22px;line-height:30px;">${esc(total)}</strong>
  </td></tr>
</table>`,
    sectionTitle("Customer"),
    paragraph(
      `<strong>${esc(order.fullName)}</strong><br>
Phone: <a href="tel:${esc(order.phone)}" style="color:${INK};text-decoration:underline;"><strong>${esc(order.phone)}</strong></a><br>
${order.email ? `Email: <a href="mailto:${esc(order.email)}" style="color:${INK};">${esc(order.email)}</a><br>` : ""}
City: <strong>${esc(order.city)}</strong><br>
${esc(order.addressLine)}`,
    ),
    order.notes ? paragraph(`<strong>Notes:</strong> ${esc(order.notes)}`) : "",
    sectionTitle("Items"),
    itemsTable(order, urls, true),
    totalsTable(order),
    button("Open order in admin", adminLink),
  ].join("\n");

  return {
    subject: `New order ${order.orderNumber}: ${total}, ${order.city}`,
    html: layout(urls, {
      title: `New order ${order.orderNumber}`,
      preheader: `${order.fullName}, ${order.city}, ${total}. Call ${order.phone} to confirm.`,
      body,
      footerNote,
    }),
    text: `New order ${order.orderNumber}
${date} - ${itemCount} item${itemCount === 1 ? "" : "s"}

To collect (cash on delivery): ${total}

CUSTOMER
${order.fullName}
Phone: ${order.phone}
${order.email ? `Email: ${order.email}\n` : ""}City: ${order.city}
${order.addressLine}
${order.notes ? `Notes: ${order.notes}\n` : ""}
ITEMS
${textItems(order)}

${textTotals(order)}

Open in admin: ${adminLink}

${textFooter(urls, footerNote)}
`,
  };
}
