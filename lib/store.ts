import "server-only";
import { unstable_cache } from "next/cache";
import { products as staticCatalog } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { StoreProduct, StoreSettings, Storefront } from "@/lib/store-types";

/** Cache tag for everything the storefront reads; mutations call updateTag(CATALOG_TAG). */
export const CATALOG_TAG = "catalog";

// Only used when Supabase isn't configured yet (local preview). Mirrors the migration defaults.
const PREVIEW_SETTINGS: StoreSettings = {
  currencyCode: "USD",
  currencyPrefix: "US$",
  shippingFee: 15,
  freeShippingThreshold: 100,
};

type ProductRow = {
  slug: string;
  name: string;
  fit: string;
  color: string;
  description: string | null;
  price: number;
  rating: number | null;
  is_new: boolean;
  category: { slug: string } | null;
  product_variants: { size: string; stock: number; is_active: boolean; sort_order: number }[];
  product_images: { url: string; alt: string | null; sort_order: number }[];
};

function toStoreProduct(row: ProductRow): StoreProduct {
  const images = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order);
  const variants = row.product_variants.filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const image = images[0]?.url ?? "";
  return {
    id: row.slug,
    name: row.name,
    fit: row.fit,
    color: row.color,
    description: row.description,
    price: Number(row.price),
    rating: row.rating === null ? null : Number(row.rating),
    isNew: row.is_new,
    category: row.category?.slug ?? null,
    image,
    hoverImage: images[1]?.url ?? image,
    images: images.map((i) => ({ url: i.url, alt: i.alt })),
    sizes: variants.map((v) => v.size),
    stock: Object.fromEntries(variants.map((v) => [v.size, v.stock])),
  };
}

async function loadStorefront(): Promise<Storefront> {
  if (!isSupabaseConfigured) {
    return {
      live: false,
      settings: PREVIEW_SETTINGS,
      products: staticCatalog.map((p) => ({
        ...p,
        description: null,
        images: [p.image, p.hoverImage].filter((u, i, a) => a.indexOf(u) === i).map((url) => ({ url, alt: null })),
        stock: Object.fromEntries(p.sizes.map((s) => [s, 10])),
      })),
    };
  }

  const supabase = createPublicClient();
  const [productsResult, settingsResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "slug, name, fit, color, description, price, rating, is_new, sort_order, category:categories(slug), " +
          "product_variants(size, stock, is_active, sort_order), product_images(url, alt, sort_order)",
      )
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at"),
    supabase.from("store_settings").select("*").eq("id", 1).single(),
  ]);

  if (productsResult.error) throw new Error(`Could not load products: ${productsResult.error.message}`);
  if (settingsResult.error) throw new Error(`Could not load store settings: ${settingsResult.error.message}`);

  const s = settingsResult.data;
  return {
    live: true,
    settings: {
      currencyCode: s.currency_code,
      currencyPrefix: s.currency_prefix,
      shippingFee: Number(s.shipping_fee),
      freeShippingThreshold: s.free_shipping_threshold === null ? null : Number(s.free_shipping_threshold),
    },
    products: (productsResult.data as unknown as ProductRow[]).map(toStoreProduct),
  };
}

/** Catalog + settings, cached for 5 minutes and refreshed immediately after admin edits or orders. */
export const getStorefront = unstable_cache(loadStorefront, ["storefront-v1"], {
  tags: [CATALOG_TAG],
  revalidate: 300,
});
