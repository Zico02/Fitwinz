"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useStore } from "@/components/StoreContext";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { StoreProduct } from "@/lib/store-types";

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

/** A cart line joined with current catalog data for display. */
export interface CartLine extends CartItem {
  product: StoreProduct;
  /** Units available for this size right now. */
  available: number;
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
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CART_KEY = "fitwinz.cart.v1";
const WISHLIST_KEY = "fitwinz.wishlist.v1";
/** Per-line cap; the database also rejects more than 20 per line. */
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
  const { getProduct } = useStore();
  const { user, ready: authReady } = useAuth();
  const syncedUserId = useRef<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load after mount so server and first client render match.
  useEffect(() => {
    const storedItems = readStorage<CartItem[]>(CART_KEY, []);
    const storedWishlist = readStorage<string[]>(WISHLIST_KEY, []);
    // One-time hydration from localStorage; it cannot run during render without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(Array.isArray(storedItems) ? storedItems.filter((i) => i && i.quantity > 0) : []);
    setWishlistIds(Array.isArray(storedWishlist) ? storedWishlist : []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(WISHLIST_KEY, wishlistIds);
  }, [wishlistIds, hydrated]);

  // Account wishlist: on sign-in, merge the browser wishlist into the account (and vice versa);
  // on sign-out, clear the browser copy so the next person on this device doesn't see it.
  useEffect(() => {
    if (!hydrated || !authReady) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    if (!user) {
      if (syncedUserId.current) {
        syncedUserId.current = null;
        setWishlistIds([]);
      }
      return;
    }
    if (syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("wishlist_items").select("product_slug");
      if (error || cancelled) return;
      const remote = data.map((r) => r.product_slug as string);
      const local = readStorage<string[]>(WISHLIST_KEY, []);
      const missingRemotely = local.filter((id) => !remote.includes(id));
      if (missingRemotely.length) {
        await supabase
          .from("wishlist_items")
          .upsert(missingRemotely.map((product_slug) => ({ user_id: user.id, product_slug })), { ignoreDuplicates: true });
      }
      if (!cancelled) setWishlistIds([...new Set([...remote, ...local])]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authReady, hydrated]);

  const limitFor = useCallback(
    (productId: string, size: string) => Math.min(MAX_QUANTITY, getProduct(productId)?.stock[size] ?? 0),
    [getProduct],
  );

  const addToCart = useCallback(
    (productId: string, size: string) => {
      const limit = limitFor(productId, size);
      if (limit <= 0) return;
      setItems((prev) =>
        prev.some((i) => i.productId === productId && i.size === size)
          ? prev.map((i) =>
              i.productId === productId && i.size === size ? { ...i, quantity: Math.min(i.quantity + 1, limit) } : i,
            )
          : [...prev, { productId, size, quantity: 1 }],
      );
    },
    [limitFor],
  );

  const removeFromCart = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, size);
        return;
      }
      const limit = limitFor(productId, size);
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, Math.min(quantity, limit)) } : i,
        ),
      );
    },
    [removeFromCart, limitFor],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const removing = wishlistIds.includes(productId);
      setWishlistIds((prev) => (removing ? prev.filter((id) => id !== productId) : [...prev, productId]));
      const supabase = getBrowserSupabase();
      if (user && supabase) {
        const request = removing
          ? supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_slug", productId)
          : supabase.from("wishlist_items").upsert({ user_id: user.id, product_slug: productId }, { ignoreDuplicates: true });
        request.then(({ error }) => error && console.warn("[wishlist] could not save to account:", error.message));
      }
    },
    [wishlistIds, user],
  );

  const isInWishlist = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds]);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    // Lines for products that no longer exist (or sizes removed) are hidden and dropped at checkout.
    const cartLines = items.flatMap((i) => {
      const product = getProduct(i.productId);
      if (!product || !product.sizes.includes(i.size)) return [];
      return [{ ...i, product, available: product.stock[i.size] ?? 0 }];
    });
    const visibleWishlist = wishlistIds.filter((id) => getProduct(id));
    return {
      cartLines,
      wishlistIds: visibleWishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartTotal: cartLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      cartCount: cartLines.reduce((sum, l) => sum + l.quantity, 0),
      isCartOpen,
      openCart,
      closeCart,
    };
  }, [
    items,
    wishlistIds,
    getProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    isCartOpen,
    openCart,
    closeCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
