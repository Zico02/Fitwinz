import type { StoreSettings } from "@/lib/store-types";

// The one shipping rule, mirrored by public.shipping_for() in the database:
// free when the merchandise subtotal (before discounts) reaches the threshold.
export function shippingFor(subtotal: number, settings: StoreSettings): number {
  const { freeShippingThreshold, shippingFee } = settings;
  return freeShippingThreshold !== null && subtotal >= freeShippingThreshold ? 0 : shippingFee;
}

/** Amount still needed for free shipping, or null when there is no offer or it's already reached. */
export function amountToFreeShipping(subtotal: number, settings: StoreSettings): number | null {
  const { freeShippingThreshold } = settings;
  if (freeShippingThreshold === null || subtotal >= freeShippingThreshold) return null;
  return roundMoney(freeShippingThreshold - subtotal);
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** Mirrors public.preview_discount(): percent of the subtotal, or a fixed amount capped at the subtotal. */
export function discountAmount(
  subtotal: number,
  discount: { type: "percent" | "fixed"; value: number; minSubtotal: number } | null,
): number {
  if (!discount || subtotal < discount.minSubtotal) return 0;
  return discount.type === "percent" ? roundMoney((subtotal * discount.value) / 100) : Math.min(discount.value, subtotal);
}

export function formatPrice(amount: number, settings: Pick<StoreSettings, "currencyPrefix">): string {
  const rounded = roundMoney(amount);
  return `${settings.currencyPrefix}${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}
