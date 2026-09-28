import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products, error }, { settings }] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, color, price, is_active, sort_order, category:categories(name), product_variants(size, stock), product_images(url, sort_order)")
      .order("sort_order")
      .order("created_at"),
    getStorefront(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800">
          + New product
        </Link>
      </div>
      {error && <p className="text-red-700">Could not load products: {error.message}</p>}

      <div className="bg-white rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium">Stock by size</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => {
              const image = [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
              const total = p.product_variants.reduce((s, v) => s + v.stock, 0);
              const category = (p.category as unknown as { name: string } | null)?.name;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {image && <Image src={image} alt="" fill sizes="40px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="font-semibold underline underline-offset-2">{p.name}</span>
                        <span className="block text-gray-500">{p.color}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{category ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatPrice(Number(p.price), settings)}</td>
                  <td className="px-4 py-3">
                    <span className={total === 0 ? "text-red-600 font-semibold" : ""}>{total} total</span>
                    <span className="block text-xs text-gray-500">
                      {p.product_variants.map((v) => `${v.size}: ${v.stock}`).join(" · ") || "No sizes"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {products?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No products yet. Run <code>npm run db:seed</code> or create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
