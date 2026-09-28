"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SimplePageHeader from "@/components/SimplePageHeader";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black";

// Step 1 placeholder: same layout as the live site, no card fields, no order submission yet.
// Step 2 replaces this with the Morocco cash-on-delivery checkout backed by Supabase.
export default function CheckoutView() {
  const { cartLines, cartTotal, updateQuantity } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [notice, setNotice] = useState("");

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
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              setNotice("Online ordering is being set up. Please check back very soon.");
            }}
          >
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">CONTACT</h2>
                <Link href="/login" className="text-sm text-gray-600 underline">
                  Sign in
                </Link>
              </div>
              <input type="email" placeholder="Email" className={inputClass} autoComplete="email" />
              <div className="flex items-center gap-2 mt-3">
                <input type="checkbox" id="newsletter" className="w-4 h-4 rounded" />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  Tick here to receive emails about our products, apps, sales, exclusive content and more.
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h2 className="font-semibold mb-4">DELIVERY</h2>
              <div className="space-y-4">
                <select className={`${inputClass} bg-white`} defaultValue="Morocco">
                  <option>Morocco</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First name" className={inputClass} autoComplete="given-name" />
                  <input type="text" placeholder="Last name" className={inputClass} autoComplete="family-name" />
                </div>
                <input type="text" placeholder="Address" className={inputClass} autoComplete="street-address" />
                <input type="text" placeholder="City" className={inputClass} autoComplete="address-level2" />
                <input type="tel" placeholder="Phone" className={inputClass} autoComplete="tel" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h2 className="font-semibold mb-4">PAYMENT</h2>
              <label className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                <span>Cash on delivery</span>
              </label>
            </div>

            {notice && <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-3">{notice}</p>}

            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              PLACE ORDER
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
                {cartLines.map(({ product, size, quantity }) => (
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
                            onClick={() => updateQuantity(product.id, size, quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, size, quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  APPLY
                </button>
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-400">Calculated at next step</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-xl">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
