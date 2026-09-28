import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { settings }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    getStorefront(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold mt-1">New product</h1>
        <p className="text-sm text-gray-500">After creating it you can add sizes, stock and photos.</p>
      </div>
      <ProductForm
        values={{
          slug: "",
          name: "",
          fit: "",
          color: "",
          description: null,
          price: "",
          rating: null,
          category_id: null,
          sort_order: 100,
          is_new: true,
          is_active: false,
        }}
        categories={categories ?? []}
        currencyPrefix={settings.currencyPrefix}
      />
    </div>
  );
}
