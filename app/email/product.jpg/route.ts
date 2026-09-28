import sharp from "sharp";
import type { NextRequest } from "next/server";
import { supabaseUrl } from "@/lib/supabase/env";

// Product photos for emails: the site stores WebP, which Outlook can't display.
// GET /email/product.jpg?src=/images/ice_front.webp&w=128  ->  3:4 JPEG thumbnail.
// Only site images and our Supabase Storage bucket are accepted (no open image proxy).

const LOCAL_IMAGE = /^\/images\/[A-Za-z0-9._-]+\.(webp|jpe?g|png)$/;
const MAX_BYTES = 8 * 1024 * 1024;

function resolveSource(src: string): URL | null {
  if (LOCAL_IMAGE.test(src) && !src.includes("..")) {
    // Fixed base (not the request Host header) so the route can't be pointed at another server.
    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitwinz.ma").trim();
    return new URL(src, base);
  }
  const bucket = `${supabaseUrl}/storage/v1/object/public/product-images/`;
  if (supabaseUrl && src.startsWith(bucket) && !src.includes("..")) return new URL(src);
  return null;
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src") ?? "";
  const width = Math.min(400, Math.max(40, Number(request.nextUrl.searchParams.get("w")) || 128));
  const source = resolveSource(src);
  if (!source) return new Response("Not found", { status: 404 });

  const upstream = await fetch(source, { cache: "force-cache" });
  if (!upstream.ok) return new Response("Not found", { status: 404 });
  const input = Buffer.from(await upstream.arrayBuffer());
  if (input.length > MAX_BYTES) return new Response("Too large", { status: 413 });

  try {
    const jpeg = await sharp(input)
      .rotate()
      .resize({ width, height: Math.round((width * 4) / 3), fit: "cover" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not an image", { status: 415 });
  }
}
