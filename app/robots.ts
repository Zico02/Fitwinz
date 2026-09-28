import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/login", "/signup", "/wishlist", "/order/", "/admin"] },
    sitemap: "https://fitwinz.ma/sitemap.xml",
  };
}
