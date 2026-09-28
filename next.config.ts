import type { NextConfig } from "next";

// Product photos uploaded from the admin are served from Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    // Admin photo uploads go through a Server Action (default limit is 1 MB).
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
