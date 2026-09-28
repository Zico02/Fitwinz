import type { MetadataRoute } from "next";

const BASE_URL = "https://fitwinz.ma";

// Only indexable pages. Account, wishlist and checkout pages are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
