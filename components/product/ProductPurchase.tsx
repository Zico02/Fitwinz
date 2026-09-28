"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useStore } from "@/components/StoreContext";

const LOW_STOCK = 3;

export default function ProductPurchase({ productId }: { productId: string }) {
  const { getProduct } = useStore();
  const { addToCart, openCart, toggleWishlist, isInWishlist, cartLines } = useCart();
  const product = getProduct(productId);
  const onlySize = product?.sizes.length === 1 ? product.sizes[0] : null;
  const [selected, setSelected] = useState<string | null>(onlySize);
  const [error, setError] = useState("");

  if (!product) return null;

  const stockOf = (size: string) => product.stock[size] ?? 0;
  const inBag = (size: string) => cartLines.find((l) => l.productId === product.id && l.size === size)?.quantity ?? 0;
  const soldOut = product.sizes.every((s) => stockOf(s) <= 0);
  const selectedStock = selected ? stockOf(selected) : 0;
  const reachedLimit = selected ? inBag(selected) >= Math.min(selectedStock, 10) : false;
  const wished = isInWishlist(product.id);

  const handleAdd = () => {
    if (!selected) {
      setError("Please select a size.");
      return;
    }
    addToCart(product.id, selected);
    openCart();
  };

  return (
    <div className="space-y-6">
      {!onlySize && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">SELECT SIZE</span>
            {selected && selectedStock > 0 && selectedStock <= LOW_STOCK && (
              <span className="text-sm text-amber-600">Only {selectedStock} left</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {product.sizes.map((size) => {
              const available = stockOf(size) > 0;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={selected === size}
                  aria-label={available ? `Size ${size}` : `Size ${size} sold out`}
                  disabled={!available}
                  onClick={() => {
                    setSelected(size);
                    setError("");
                  }}
                  className={`min-w-[48px] h-12 px-3 text-sm font-medium border transition-all ${
                    !available
                      ? "bg-white text-gray-300 border-gray-200 line-through cursor-not-allowed"
                      : selected === size
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}
      {onlySize && selectedStock > 0 && selectedStock <= LOW_STOCK && (
        <p className="text-sm text-amber-600">Only {selectedStock} left</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || reachedLimit}
          className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {soldOut ? "SOLD OUT" : reachedLimit ? "ALL AVAILABLE STOCK IN YOUR BAG" : "ADD TO BAG"}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="w-14 h-14 border border-gray-300 rounded-full flex items-center justify-center hover:border-black transition-colors"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${wished ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}
