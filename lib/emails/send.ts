import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import {
  renderAdminNotification,
  renderOrderConfirmation,
  renderOrderShipped,
  type EmailUrls,
  type OrderEmailData,
  type RenderedEmail,
} from "@/lib/emails/templates";

export type OrderEmailKind = "confirmation" | "admin_notification" | "shipped";

type SendResult = { ok: true; id: string | null } | { ok: false; error: string };

/**
 * Public URLs used inside emails. Images and customer links must point at the live site even when
 * an email is sent from a local dev server (mail clients can't load http://localhost).
 */
export function emailUrls(): EmailUrls {
  const site = (process.env.EMAIL_SITE_URL ?? "https://fitwinz.ma").trim().replace(/\/$/, "");
  const admin = (process.env.NEXT_PUBLIC_SITE_URL ?? site).trim().replace(/\/$/, "");
  return { site, admin };
}

async function sendViaResend(to: string, email: RenderedEmail, orderNumber: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { ok: false, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM missing)" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: process.env.EMAIL_REPLY_TO?.trim() || undefined,
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: { "X-Entity-Ref-ID": `${orderNumber}-${Date.now()}` },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${body.message ?? body.name ?? "unknown error"}` };
    return { ok: true, id: body.id ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function loadOrder(orderId: string): Promise<OrderEmailData | null> {
  const supabase = createServiceClient();
  const [{ data: order }, { data: settings }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*), shipments(*)").eq("id", orderId).maybeSingle(),
    supabase.from("store_settings").select("currency_prefix").eq("id", 1).single(),
  ]);
  if (!order) return null;
  const shipment = Array.isArray(order.shipments) ? order.shipments[0] : order.shipments;
  return {
    orderNumber: order.order_number,
    publicToken: order.public_token,
    adminOrderId: order.id,
    createdAt: order.created_at,
    fullName: order.full_name,
    phone: order.phone,
    email: order.email,
    city: order.city,
    addressLine: order.address_line,
    notes: order.notes,
    currencyPrefix: settings?.currency_prefix ?? "US$",
    subtotal: Number(order.subtotal),
    discountCode: order.discount_code,
    discountAmount: Number(order.discount_amount),
    shippingFee: Number(order.shipping_fee),
    total: Number(order.total),
    items: (order.order_items ?? []).map(
      (i: {
        product_name: string;
        color: string | null;
        size: string;
        quantity: number;
        unit_price: number;
        line_total: number;
        image_url: string | null;
      }) => ({
        name: i.product_name,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        lineTotal: Number(i.line_total),
        imageUrl: i.image_url,
      }),
    ),
    carrier: shipment?.carrier ?? null,
    trackingNumber: shipment?.tracking_number ?? null,
    trackingUrl: shipment?.tracking_url ?? null,
  };
}

/**
 * Sends one order email and records the outcome in order_emails. Never throws: an email problem
 * must never block or lose an order. Each kind is sent at most once per order (enforced by a unique
 * index), so calling this twice is safe. Returns a short status for the admin UI.
 */
export async function sendOrderEmail(orderId: string, kind: OrderEmailKind): Promise<"sent" | "skipped" | "failed" | "already-sent"> {
  const supabase = createServiceClient();
  let logId: string | null = null;

  const finish = async (status: "sent" | "failed" | "skipped", fields: { recipient?: string | null; provider_id?: string | null; error?: string | null }) => {
    if (status === "failed") console.error(`[email] ${kind} for order ${orderId} failed: ${fields.error}`);
    if (logId) {
      await supabase.from("order_emails").update({ status, ...fields }).eq("id", logId);
    } else {
      // Nothing was claimed (e.g. skipped before sending): still leave a trace for the admin.
      await supabase.from("order_emails").insert({ order_id: orderId, kind, status, ...fields });
    }
    return status;
  };

  try {
    const order = await loadOrder(orderId);
    if (!order) {
      console.error(`[email] ${kind}: order ${orderId} not found`);
      return "failed";
    }

    const to = kind === "admin_notification" ? process.env.ORDER_NOTIFICATION_EMAIL?.trim() || null : order.email;
    if (!to) {
      return await finish("skipped", {
        error: kind === "admin_notification" ? "ORDER_NOTIFICATION_EMAIL is not set" : "The customer did not give an email address",
      });
    }

    // Claim this email. A second attempt (double click, retry race) hits the unique index.
    const claim = await supabase
      .from("order_emails")
      .insert({ order_id: orderId, kind, status: "sending", recipient: to })
      .select("id")
      .single();
    if (claim.error) {
      if (claim.error.code === "23505") return "already-sent";
      // Log table unavailable (migration not applied yet): send anyway, just without a record.
      console.warn(`[email] could not record ${kind} for order ${orderId}: ${claim.error.message}`);
    } else {
      logId = claim.data.id;
    }

    const urls = emailUrls();
    const rendered =
      kind === "confirmation"
        ? renderOrderConfirmation(order, urls)
        : kind === "shipped"
          ? renderOrderShipped(order, urls)
          : renderAdminNotification(order, urls);

    const result = await sendViaResend(to, rendered, order.orderNumber);
    return result.ok
      ? await finish("sent", { recipient: to, provider_id: result.id, error: null })
      : await finish("failed", { recipient: to, error: result.error });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    try {
      return await finish("failed", { error: message });
    } catch {
      console.error(`[email] ${kind} for order ${orderId} failed and could not be recorded: ${message}`);
      return "failed";
    }
  }
}
