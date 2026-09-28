// Client-safe types for storefront data loaded from the database.

export interface StoreSettings {
  currencyCode: string;
  currencyPrefix: string;
  shippingFee: number;
  /** null = no free-shipping offer */
  freeShippingThreshold: number | null;
}

export interface StoreImage {
  url: string;
  alt: string | null;
}

export interface StoreProduct {
  /** Product slug, used in URLs and the cart. */
  id: string;
  name: string;
  fit: string;
  color: string;
  description: string | null;
  price: number;
  rating: number | null;
  isNew: boolean;
  category: string | null;
  image: string;
  hoverImage: string;
  images: StoreImage[];
  /** Sizes in display order. */
  sizes: string[];
  /** Units available per size. */
  stock: Record<string, number>;
}

export interface Storefront {
  products: StoreProduct[];
  settings: StoreSettings;
  /** False when Supabase isn't configured and the static catalog is shown instead. */
  live: boolean;
}
