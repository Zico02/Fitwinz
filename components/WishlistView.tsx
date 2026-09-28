"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/components/CartContext";
import { products } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export default function WishlistView() {
  const { wishlistIds, toggleWishlist, addToCart, cartCount } = useCart();
  const items = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Logo priority className="h-16 w-auto object-contain bg-transparent" />
        </Link>
        <div className="flex items-center gap-4 ml-auto">
          <Link href="/wishlist" className="p-2" aria-label="Wishlist">
            <Heart className="w-5 h-5 fill-black" />
          </Link>
          <Link href="/checkout" className="p-2 relative" aria-label="Bag">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">YOUR WISHLIST</h1>
        <p className="text-gray-600 mb-8">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save your favorite items to your wishlist and they&apos;ll be here when you come back.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group">
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToCart(item.id, item.sizes[Math.min(2, item.sizes.length - 1)])}
                    className="absolute bottom-0 left-0 right-0 bg-black text-white py-3 text-sm font-semibold translate-y-full group-hover:translate-y-0 transition-transform"
                  >
                    ADD TO BAG
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.fit}</p>
                  <p className="text-sm text-gray-500">{item.color}</p>
                  <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-black text-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2026 Fitwinz Limited | All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
