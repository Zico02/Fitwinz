import "server-only";
import { formatPrice } from "@/lib/pricing";

export interface OrderEmailData {
  orderNumber: string;
  publicToken: string;
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
  items: { name: string; color: string | null; size: string; quantity: number; unitPrice: number; lineTotal: number }[];
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(message: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] RESEND_API_KEY or EMAIL_FROM missing; skipped "${message.subject}" to ${message.to}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
    }),
  });
  if (!res.ok) {
    console.error(`[email] Resend rejected "${message.subject}" to ${message.to}: ${res.status} ${await res.text()}`);
  }
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function itemsTable(order: OrderEmailData) {
  const money = (n: number) => escapeHtml(formatPrice(n, order));
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(i.name)}<br><span style="color:#666;font-size:13px">${escapeHtml(
          [i.color, i.size].filter(Boolean).join(" / "),
        )} &times; ${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${money(i.lineTotal)}</td>
      </tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:700" : "color:#555"}">${label}</td><td style="padding:4px 0;text-align:right;${bold ? "font-weight:700" : ""}">${value}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
    ${line("Subtotal", money(order.subtotal))}
    ${order.discountAmount > 0 ? line(`Discount (${escapeHtml(order.discountCode ?? "")})`, `-${money(order.discountAmount)}`) : ""}
    ${line("Shipping", order.shippingFee === 0 ? "Free" : money(order.shippingFee))}
    ${line("Total (cash on delivery)", money(order.total), true)}
  </table>`;
}

function itemsText(order: OrderEmailData) {
  const money = (n: number) => formatPrice(n, order);
  return [
    ...order.items.map((i) => `- ${i.name} (${[i.color, i.size].filter(Boolean).join(" / ")}) x${i.quantity}: ${money(i.lineTotal)}`),
    `Subtotal: ${money(order.subtotal)}`,
    ...(order.discountAmount > 0 ? [`Discount (${order.discountCode}): -${money(order.discountAmount)}`] : []),
    `Shipping: ${order.shippingFee === 0 ? "Free" : money(order.shippingFee)}`,
    `Total (cash on delivery): ${money(order.total)}`,
  ].join("\n");
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#000;color:#fff;padding:16px 24px;font-weight:800;letter-spacing:2px">FITWINZ</div>
    <div style="background:#fff;padding:24px">
      <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#888;text-align:center">Fitwinz · Time to Dress Healthy</p>
  </div></body></html>`;
}

export async function sendOrderConfirmation(order: OrderEmailData) {
  if (!order.email) return;
  const link = `${siteUrl()}/order/${order.publicToken}`;
  const html = layout(
    `Thank you, ${escapeHtml(order.fullName.split(" ")[0])}! Your order is confirmed.`,
    `<p style="font-size:14px;line-height:1.6">We received your order <strong>${escapeHtml(order.orderNumber)}</strong>.
     We will call you on <strong>${escapeHtml(order.phone)}</strong> to confirm delivery.
     You pay in cash when your order arrives.</p>
     ${itemsTable(order)}
     <h2 style="font-size:14px;margin:24px 0 8px">Delivery address</h2>
     <p style="font-size:14px;line-height:1.6;margin:0">${escapeHtml(order.fullName)}<br>${escapeHtml(order.addressLine)}<br>${escapeHtml(order.city)}</p>
     <p style="margin-top:24px"><a href="${escapeHtml(link)}" style="background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">View your order</a></p>`,
  );
  const text = `Thank you for your order ${order.orderNumber}!\n\nWe will call you on ${order.phone} to confirm delivery. You pay in cash when your order arrives.\n\n${itemsText(order)}\n\nDelivery: ${order.fullName}, ${order.addressLine}, ${order.city}\n\nView your order: ${link}`;
  await sendEmail({
    to: order.email,
    subject: `Your Fitwinz order ${order.orderNumber}`,
    html,
    text,
    replyTo: process.env.EMAIL_REPLY_TO,
  });
}

export async function sendNewOrderNotification(order: OrderEmailData, adminOrderId: string) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[email] ORDER_NOTIFICATION_EMAIL missing; skipped admin notification");
    return;
  }
  const link = `${siteUrl()}/admin/orders/${adminOrderId}`;
  const html = layout(
    `New order ${escapeHtml(order.orderNumber)}: ${escapeHtml(formatPrice(order.total, order))}`,
    `<p style="font-size:14px;line-height:1.6;margin:0 0 16px">
       <strong>${escapeHtml(order.fullName)}</strong><br>
       Phone: <a href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a><br>
       ${order.email ? `Email: ${escapeHtml(order.email)}<br>` : ""}
       ${escapeHtml(order.addressLine)}, ${escapeHtml(order.city)}
       ${order.notes ? `<br><br><strong>Notes:</strong> ${escapeHtml(order.notes)}` : ""}
     </p>
     ${itemsTable(order)}
     <p style="margin-top:24px"><a href="${escapeHtml(link)}" style="background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">Open in admin</a></p>`,
  );
  const text = `New order ${order.orderNumber}\n\n${order.fullName}\n${order.phone}\n${order.email ?? ""}\n${order.addressLine}, ${order.city}\n${order.notes ? `Notes: ${order.notes}\n` : ""}\n${itemsText(order)}\n\n${link}`;
  await sendEmail({
    to,
    subject: `New order ${order.orderNumber} (${formatPrice(order.total, order)}), ${order.city}`,
    html,
    text,
    replyTo: order.email ?? undefined,
  });
}
