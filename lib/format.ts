// All price display goes through here so the currency switch (USD -> MAD) is a one-line change.
export const CURRENCY_PREFIX = "US$";

export function formatPrice(amount: number): string {
  return `${CURRENCY_PREFIX}${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}
