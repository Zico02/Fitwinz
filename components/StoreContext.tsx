"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { formatPrice as format } from "@/lib/pricing";
import type { StoreProduct, Storefront } from "@/lib/store-types";

interface StoreContextValue extends Storefront {
  getProduct: (id: string) => StoreProduct | undefined;
  formatPrice: (amount: number) => string;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ storefront, children }: { storefront: Storefront; children: React.ReactNode }) {
  const byId = useMemo(() => new Map(storefront.products.map((p) => [p.id, p])), [storefront.products]);
  const getProduct = useCallback((id: string) => byId.get(id), [byId]);
  const formatPrice = useCallback((amount: number) => format(amount, storefront.settings), [storefront.settings]);

  const value = useMemo(
    () => ({ ...storefront, getProduct, formatPrice }),
    [storefront, getProduct, formatPrice],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
