import type { MetadataRoute } from "next";
import { getStorefront } from "@/lib/store";

const BASE_URL = "https://fitwinz.ma";

// Only indexable pages. Account, wishlist, checkout and order pages are intentionally excluded.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getStorefront();
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
