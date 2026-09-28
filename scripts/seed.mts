// Seeds the Supabase catalog from lib/catalog.ts.
//
//   npm run db:seed
//
// Safe to re-run: it only inserts what is missing. Existing products, prices and stock
// (for example values you changed in the admin) are never overwritten.
import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/catalog.ts";

const INITIAL_STOCK = 10;

const CATEGORIES = [
  { slug: "men", name: "Men", sort_order: 0 },
  { slug: "accessories", name: "Accessories", sort_order: 1 },
  { slug: "couples", name: "Couples Collection", sort_order: 2 },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

function check<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) {
    console.error(`Failed to ${what}: ${result.error.message}`);
    process.exit(1);
  }
  return result.data;
}

check(await supabase.from("categories").upsert(CATEGORIES, { onConflict: "slug", ignoreDuplicates: true }), "insert categories");
const categories = check(await supabase.from("categories").select("id, slug"), "read categories");
const categoryId = new Map(categories.map((c) => [c.slug, c.id]));

const existing = check(await supabase.from("products").select("slug"), "read products");
const existingSlugs = new Set(existing.map((p) => p.slug));

let createdProducts = 0;
let createdVariants = 0;
let createdImages = 0;

for (const [index, p] of products.entries()) {
  if (!existingSlugs.has(p.id)) {
    check(
      await supabase.from("products").insert({
        slug: p.id,
        category_id: categoryId.get(p.category) ?? null,
        name: p.name,
        fit: p.fit,
        color: p.color,
        price: p.price,
        rating: p.rating,
        is_new: p.isNew,
        sort_order: index,
      }),
      `insert product ${p.id}`,
    );
    createdProducts += 1;
  }

  const product = check(await supabase.from("products").select("id").eq("slug", p.id).single(), `read product ${p.id}`);

  const variants = p.sizes.map((size, i) => ({
    product_id: product.id,
    size,
    color: p.color,
    sku: `${p.id}-${size}`.toUpperCase(),
    stock: INITIAL_STOCK,
    sort_order: i,
  }));
  const inserted = check(
    await supabase
      .from("product_variants")
      .upsert(variants, { onConflict: "product_id,size", ignoreDuplicates: true })
      .select("id"),
    `insert variants for ${p.id}`,
  );
  createdVariants += inserted?.length ?? 0;

  const images = check(
    await supabase.from("product_images").select("id").eq("product_id", product.id),
    `read images for ${p.id}`,
  );
  if (images.length === 0) {
    const rows = [{ product_id: product.id, url: p.image, alt: `${p.name} - ${p.color}`, sort_order: 0 }];
    if (p.hoverImage !== p.image) {
      rows.push({ product_id: product.id, url: p.hoverImage, alt: `${p.name} - ${p.color} (alternate view)`, sort_order: 1 });
    }
    check(await supabase.from("product_images").insert(rows), `insert images for ${p.id}`);
    createdImages += rows.length;
  }
}

console.log(
  `Seed complete: ${createdProducts} products, ${createdVariants} size variants (stock ${INITIAL_STOCK} each), ` +
    `${createdImages} images created. ${products.length - createdProducts} products already existed and were left unchanged.`,
);
