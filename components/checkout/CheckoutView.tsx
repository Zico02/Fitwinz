"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SimplePageHeader from "@/components/SimplePageHeader";
import { useCart } from "@/components/CartContext";
import { useStore } from "@/components/StoreContext";
import { placeOrder, previewDiscount, type AppliedDiscount } from "@/app/checkout/actions";
import type { CheckoutFieldErrors } from "@/lib/checkout-schema";
import { MOROCCAN_CITIES, OTHER_CITY } from "@/lib/morocco";
import { discountAmount as computeDiscount, roundMoney, shippingFor } from "@/lib/pricing";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black";
const errorInputClass = "border-red-500 focus:ring-red-500";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null;
}

export default function CheckoutView({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const { cartLines, cartTotal, updateQuantity, clearCart } = useCart();
  const { settings, formatPrice } = useStore();

  const [form, setForm] = useState({ fullName: "", phone: "", email: "", city: "", otherCity: "", address: "", notes: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [placedToken, setPlacedToken] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const [discountInput, setDiscountInput] = useState(initialCode);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, startApplying] = useTransition();
  const autoApplied = useRef(false);

  const items = cartLines.map((l) => ({ slug: l.productId, size: l.size, quantity: l.quantity }));
  const discountAmount = computeDiscount(cartTotal, discount);
  const discountBelowMinimum = Boolean(discount && cartTotal < discount.minSubtotal);
  const shipping = shippingFor(cartTotal, settings);
  const total = roundMoney(cartTotal - discountAmount + shipping);
  const stockProblem = cartLines.find((l) => l.quantity > l.available);

  const applyDiscount = (code: string) => {
    setDiscountError("");
    startApplying(async () => {
      const result = await previewDiscount(code, items);
      if (result.ok) {
        setDiscount(result.discount);
        setDiscountInput(result.discount.code);
      } else {
        setDiscount(null);
        setDiscountError(result.message);
      }
    });
  };

  // Code passed from the bag (?code=...): apply once the cart has loaded.
  useEffect(() => {
    if (!autoApplied.current && initialCode && cartLines.length > 0) {
      autoApplied.current = true;
      applyDiscount(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, cartLines.length]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fieldErrors[key as keyof CheckoutFieldErrors]) setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (stockProblem) {
      setFormError("Some items in your bag are no longer available in that quantity. Please update your bag.");
      return;
    }
    const city = form.city === OTHER_CITY ? form.otherCity : form.city;
    startSubmit(async () => {
      const result = await placeOrder({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        city,
        address: form.address,
        notes: form.notes,
        newsletter,
        discountCode: discount && !discountBelowMinimum ? discount.code : "",
        items,
        expectedTotal: total,
        company,
      });
      if (result.ok) {
        setPlacedToken(result.token);
        clearCart();
        router.push(`/order/${result.token}`);
        return;
      }
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      if (result.discountError) {
        setDiscount(null);
        setDiscountError(result.discountError);
      }
      result.adjust?.forEach((a) => updateQuantity(a.slug, a.size, a.quantity));
      if (result.refresh) router.refresh();
    });
  };

  if (placedToken) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SimplePageHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" /> Confirming your order…
          </p>
        </div>
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <SimplePageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your bag is empty</h1>
            <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-semibold">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimplePageHeader className="bg-white border-gray-200" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="bg-white p-6 rounded-lg">
              <h2 className="font-semibold mb-4">CONTACT</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full name*"
                    value={form.fullName}
                    onChange={set("fullName")}
                    className={`${inputClass} ${fieldErrors.fullName ? errorInputClass : ""}`}
                    autoComplete="name"
                    aria-label="Full name"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    required
                  />
                  <FieldError message={fieldErrors.fullName} />
                </div>
                <div>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Phone* (06 12 34 56 78)"
                    value={form.phone}
                    onChange={set("phone")}
                    className={`${inputClass} ${fieldErrors.phone ? errorInputClass : ""}`}
                    autoComplete="tel"
                    aria-label="Phone"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    required
                  />
                  <FieldError message={fieldErrors.phone} />
                  {!fieldErrors.phone && (
                    <p className="text-xs text-gray-500 mt-1">We&apos;ll call this number to confirm your delivery.</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email (for your order confirmation)"
                    value={form.email}
                    onChange={set("email")}
                    className={`${inputClass} ${fieldErrors.email ? errorInputClass : ""}`}
                    autoComplete="email"
                    aria-label="Email"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  <FieldError message={fieldErrors.email} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  Tick here to receive emails about our products, apps, sales, exclusive content and more.
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h2 className="font-semibold mb-4">DELIVERY</h2>
              <div className="space-y-4">
                <select className={`${inputClass} bg-white`} value="Morocco" disabled aria-label="Country">
                  <option>Morocco</option>
                </select>
                <div>
                  <select
                    value={form.city}
                    onChange={set("city")}
                    className={`${inputClass} bg-white ${form.city ? "" : "text-gray-400"} ${fieldErrors.city ? errorInputClass : ""}`}
                    aria-label="City"
                    aria-invalid={Boolean(fieldErrors.city)}
                    required
                  >
                    <option value="" disabled>
                      City*
                    </option>
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c} className="text-black">
                        {c}
                      </option>
                    ))}
                    <option value={OTHER_CITY} className="text-black">
                      Other town…
                    </option>
                  </select>
                  {form.city === OTHER_CITY && (
                    <input
                      type="text"
                      placeholder="Your town*"
                      value={form.otherCity}
                      onChange={set("otherCity")}
                      className={`${inputClass} mt-3 ${fieldErrors.city ? errorInputClass : ""}`}
                      autoComplete="address-level2"
                      aria-label="Town"
                    />
                  )}
                  <FieldError message={fieldErrors.city} />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Address* (street, building, apartment, district)"
                    value={form.address}
                    onChange={set("address")}
                    className={`${inputClass} ${fieldErrors.address ? errorInputClass : ""}`}
                    autoComplete="street-address"
                    aria-label="Address"
                    aria-invalid={Boolean(fieldErrors.address)}
                    required
                  />
                  <FieldError message={fieldErrors.address} />
                </div>
                <div>
                  <textarea
                    placeholder="Delivery notes (optional)"
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-none ${fieldErrors.notes ? errorInputClass : ""}`}
                    aria-label="Delivery notes"
                  />
                  <FieldError message={fieldErrors.notes} />
                </div>
              </div>
              {/* Honeypot: hidden from people, filled by bots. */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h2 className="font-semibold mb-4">PAYMENT</h2>
              <label className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <input type="radio" name="payment" checked readOnly className="w-4 h-4" />
                <span>Cash on delivery</span>
              </label>
              <p className="text-sm text-gray-500 mt-3">You pay in cash when your order is delivered.</p>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isApplying}
              className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSubmitting ? "PLACING ORDER…" : "PLACE ORDER"}
            </button>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <Link href="/terms" className="underline">
                Terms of service
              </Link>
            </div>
          </form>

          <div className="lg:pl-8">
            <div className="bg-white p-6 rounded-lg sticky top-4">
              <h2 className="font-semibold mb-4">ORDER SUMMARY</h2>
              <div className="space-y-4 mb-6">
                {cartLines.map(({ product, size, quantity, available }) => (
                  <div key={`${product.id}-${size}`} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.color} / {size}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, size, quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, size, quantity + 1)}
                            disabled={quantity >= available}
                            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                      </div>
                      {quantity > available && (
                        <p className="text-xs text-red-600 mt-1">
                          {available === 0 ? "Sold out in this size" : `Only ${available} left in this size`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountInput}
                    onChange={(e) => {
                      setDiscountInput(e.target.value);
                      setDiscountError("");
                    }}
                    className={`flex-1 ${inputClass} ${discountError ? errorInputClass : ""}`}
                    aria-label="Discount code"
                  />
                  {discount ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDiscount(null);
                        setDiscountInput("");
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyDiscount(discountInput)}
                      disabled={isApplying || !discountInput.trim()}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-60"
                    >
                      {isApplying ? "…" : "APPLY"}
                    </button>
                  )}
                </div>
                <FieldError message={discountError} />
                {discountBelowMinimum && discount && (
                  <p className="text-sm text-amber-700 mt-1">
                    {discount.code} applies from a subtotal of {formatPrice(discount.minSubtotal)}.
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {discount && discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({discount.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? "" : "text-gray-900"}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
