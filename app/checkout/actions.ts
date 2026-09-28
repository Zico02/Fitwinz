"use server";

import { after } from "next/server";
import { updateTag } from "next/cache";
import { checkoutSchema, type CheckoutFieldErrors, type CheckoutInput } from "@/lib/checkout-schema";
import { sendNewOrderNotification, sendOrderConfirmation, type OrderEmailData } from "@/lib/email";
import { formatPrice } from "@/lib/pricing";
import { CATALOG_TAG, getStorefront } from "@/lib/store";
import { createServiceClient } from "@/lib/supabase/service";

export type PlaceOrderResult =
  | { ok: true; token: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: CheckoutFieldErrors;
      discountError?: string;
      /** Cart lines the client should adjust (quantity 0 = remove). */
      adjust?: { slug: string; size: string; quantity: number }[];
      /** Catalog data changed; the client should refresh prices/stock. */
      refresh?: boolean;
    };

type DbError = { message: string; hint?: string | null };

function backendReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

async function describeDiscountError(error: DbError) {
  if (error.message.includes("DISCOUNT_MIN_SUBTOTAL")) {
    const { settings } = await getStorefront();
    return `This code needs a subtotal of at least ${formatPrice(Number(error.hint), settings)}.`;
  }
  return "This discount code is not valid.";
}

export type AppliedDiscount = { code: string; type: "percent" | "fixed"; value: number; minSubtotal: number };

/** Checks a code and returns its rule; the checkout computes the amount as the bag changes. */
export async function previewDiscount(
  code: string,
  items: CheckoutInput["items"],
): Promise<{ ok: true; discount: AppliedDiscount } | { ok: false; message: string }> {
  const trimmed = code.trim();
  if (!trimmed || trimmed.length > 32) return { ok: false, message: "This discount code is not valid." };
  if (!backendReady()) return { ok: false, message: "Discount codes are not available right now." };

  // Subtotal from current catalog prices, never from the client.
  const { products } = await getStorefront();
  const subtotal = items.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.slug);
    return sum + (p ? p.price * Math.min(Math.max(i.quantity, 0), 20) : 0);
  }, 0);

  const supabase = createServiceClient();
  const { error } = await supabase.rpc("preview_discount", { p_code: trimmed, p_subtotal: subtotal }).single();
  if (error) return { ok: false, message: await describeDiscountError(error) };

  const { data } = await supabase
    .from("discount_codes")
    .select("code, type, value, min_subtotal")
    .eq("code", trimmed.toUpperCase())
    .single();
  if (!data) return { ok: false, message: "This discount code is not valid." };
  return {
    ok: true,
    discount: { code: data.code, type: data.type, value: Number(data.value), minSubtotal: Number(data.min_subtotal) },
  };
}

export async function placeOrder(input: CheckoutInput & { company?: string }): Promise<PlaceOrderResult> {
  // Honeypot field: real customers never see or fill it.
  if (input.company) return { ok: false, message: "Something went wrong. Please try again." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: CheckoutFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof CheckoutFieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }
  if (!backendReady()) {
    return { ok: false, message: "Ordering is not available yet: the store database is not configured." };
  }

  const data = parsed.data;
  const supabase = createServiceClient();
  const { data: placed, error } = await supabase
    .rpc("place_order", {
      p_full_name: data.fullName,
      p_phone: data.phone,
      p_email: data.email || null,
      p_city: data.city,
      p_address: data.address,
      p_notes: data.notes || null,
      p_items: data.items,
      p_discount_code: data.discountCode || null,
      p_newsletter: data.newsletter,
      p_expected_total: data.expectedTotal,
    })
    .single<{ order_id: string; order_number: string; public_token: string; total: number }>();

  if (error || !placed) return mapOrderError(error ?? { message: "UNKNOWN" }, data.items);

  // Stock changed: refresh the cached catalog for everyone.
  updateTag(CATALOG_TAG);

  after(async () => {
    try {
      const emailData = await loadOrderEmailData(placed.order_id);
      if (!emailData) return;
      await Promise.allSettled([sendOrderConfirmation(emailData), sendNewOrderNotification(emailData, placed.order_id)]);
    } catch (e) {
      console.error("[checkout] sending order emails failed", e);
    }
  });

  return { ok: true, token: placed.public_token };
}

async function mapOrderError(error: DbError, items: CheckoutInput["items"]): Promise<PlaceOrderResult> {
  const { products } = await getStorefront();
  const nameOf = (slug: string) => products.find((p) => p.id === slug)?.name ?? "An item";
  const [slug = "", size = "", available = "0"] = (error.hint ?? "").split("|");

  if (error.message.includes("OUT_OF_STOCK")) {
    updateTag(CATALOG_TAG);
    const left = Number(available);
    return {
      ok: false,
      refresh: true,
      message:
        left > 0
          ? `Only ${left} left of ${nameOf(slug)} in size ${size}. We updated your bag; please review and place your order again.`
          : `${nameOf(slug)} in size ${size} just sold out. We removed it from your bag.`,
      adjust: [{ slug, size, quantity: Math.max(0, left) }],
    };
  }
  if (error.message.includes("PRODUCT_UNAVAILABLE")) {
    updateTag(CATALOG_TAG);
    return {
      ok: false,
      refresh: true,
      message: `${nameOf(slug)} (size ${size}) is no longer available. We removed it from your bag.`,
      adjust: [{ slug, size, quantity: 0 }],
    };
  }
  if (error.message.includes("PRICE_CHANGED")) {
    updateTag(CATALOG_TAG);
    return { ok: false, refresh: true, message: "Prices have been updated. Please review your new total and place your order again." };
  }
  if (error.message.includes("DISCOUNT_")) {
    return { ok: false, message: "Please check your discount code.", discountError: await describeDiscountError(error) };
  }
  if (error.message.includes("EMPTY_CART")) return { ok: false, message: "Your bag is empty." };
  if (error.message.includes("INVALID_QUANTITY")) return { ok: false, message: "Please reduce the quantity of an item in your bag." };
  if (error.message.includes("INVALID_INPUT")) return { ok: false, message: "Please check your delivery details." };

  console.error("[checkout] place_order failed", error, { lines: items.length });
  return { ok: false, message: "We couldn't place your order. Please try again in a moment." };
}

async function loadOrderEmailData(orderId: string): Promise<OrderEmailData | null> {
  const supabase = createServiceClient();
  const [{ data: order }, { data: items }, { settings }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", orderId).single(),
    supabase.from("order_items").select("*").eq("order_id", orderId),
    getStorefront(),
  ]);
  if (!order) return null;
  return {
    orderNumber: order.order_number,
    publicToken: order.public_token,
    createdAt: order.created_at,
    fullName: order.full_name,
    phone: order.phone,
    email: order.email,
    city: order.city,
    addressLine: order.address_line,
    notes: order.notes,
    currencyPrefix: settings.currencyPrefix,
    subtotal: Number(order.subtotal),
    discountCode: order.discount_code,
    discountAmount: Number(order.discount_amount),
    shippingFee: Number(order.shipping_fee),
    total: Number(order.total),
    items: (items ?? []).map((i) => ({
      name: i.product_name,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    })),
  };
}
