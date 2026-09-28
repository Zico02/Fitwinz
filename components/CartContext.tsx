"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type Product } from "@/lib/catalog";

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

/** A cart line joined with current catalog data for display. */
export interface CartLine extends CartItem {
  product: Product;
}

interface CartContextValue {
  cartLines: CartLine[];
  wishlistIds: string[];
  addToCart: (productId: string, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
}

const CART_KEY = "fitwinz.cart.v1";
const WISHLIST_KEY = "fitwinz.wishlist.v1";
const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota); the cart still works for this visit.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load after mount so server and first client render match.
  useEffect(() => {
    const storedItems = readStorage<CartItem[]>(CART_KEY, []);
    const storedWishlist = readStorage<string[]>(WISHLIST_KEY, []);
    // Drop anything that no longer exists in the catalog.
    // One-time hydration from localStorage; it cannot run during render without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(
      Array.isArray(storedItems)
        ? storedItems.filter((i) => getProduct(i.productId)?.sizes.includes(i.size) && i.quantity > 0)
        : [],
    );
    setWishlistIds(Array.isArray(storedWishlist) ? storedWishlist.filter((id) => getProduct(id)) : []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(WISHLIST_KEY, wishlistIds);
  }, [wishlistIds, hydrated]);

  const addToCart = useCallback((productId: string, size: string) => {
    setItems((prev) =>
      prev.some((i) => i.productId === productId && i.size === size)
        ? prev.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
              : i,
          )
        : [...prev, { productId, size, quantity: 1 }],
    );
  }, []);

  const removeFromCart = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) }
            : i,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds]);

  const value = useMemo<CartContextValue>(() => {
    const cartLines = items.flatMap((i) => {
      const product = getProduct(i.productId);
      return product ? [{ ...i, product }] : [];
    });
    return {
      cartLines,
      wishlistIds,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartTotal: cartLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      cartCount: cartLines.reduce((sum, l) => sum + l.quantity, 0),
    };
  }, [items, wishlistIds, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
