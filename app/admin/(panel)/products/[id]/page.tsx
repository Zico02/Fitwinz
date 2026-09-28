import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ProductForm, { adminInput } from "@/components/admin/ProductForm";
import { deleteImage, deleteProduct, deleteVariant, moveImage, saveVariants, uploadImage } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "Edit product" };

type Variant = { id: string; size: string; sku: string; stock: number; is_active: boolean; sort_order: number };
type ProductImage = { id: string; url: string; alt: string | null; sort_order: number };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: product }, { data: categories }, { settings }] = await Promise.all([
    supabase.from("products").select("*, product_variants(*), product_images(*)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
    getStorefront(),
  ]);
  if (!product) notFound();

  const variants = ([...product.product_variants] as Variant[]).sort((a, b) => a.sort_order - b.sort_order);
  const images = ([...product.product_images] as ProductImage[]).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
            ← Products
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {product.name} <span className="text-gray-400 font-normal">· {product.color}</span>
          </h1>
        </div>
        {product.is_active && (
          <Link href={`/products/${product.slug}`} target="_blank" className="text-sm underline">
            View in store ↗
          </Link>
        )}
      </div>

      {created && (
        <p className="text-sm bg-green-50 text-green-800 border border-green-200 rounded-lg px-3 py-2">
          Product created. Add sizes, stock and photos below, then tick &quot;Visible in store&quot;.
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Details</h2>
        <ProductForm values={product} categories={categories ?? []} currencyPrefix={settings.currencyPrefix} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Sizes &amp; stock</h2>
        <ActionForm action={saveVariants} className="bg-white rounded-lg p-6">
          <input type="hidden" name="productId" value={product.id} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Size</th>
                  <th className="py-2 pr-4 font-medium">SKU</th>
                  <th className="py-2 pr-4 font-medium w-28">Stock</th>
                  <th className="py-2 pr-4 font-medium">On sale</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 font-semibold">
                      <input type="hidden" name="variantId" value={v.id} />
                      {v.size}
                    </td>
                    <td className="py-2 pr-4">
                      <input name={`sku_${v.id}`} defaultValue={v.sku} className={adminInput} />
                    </td>
                    <td className="py-2 pr-4">
                      <input name={`stock_${v.id}`} type="number" min="0" step="1" defaultValue={v.stock} className={adminInput} />
                    </td>
                    <td className="py-2 pr-4">
                      <input type="checkbox" name={`active_${v.id}`} defaultChecked={v.is_active} className="w-4 h-4" />
                    </td>
                    <td className="py-2 text-right">
                      <ConfirmButton
                        message={`Delete size ${v.size}? Past orders keep their details.`}
                        form={`delete-variant-${v.id}`}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete size {v.size}</span>
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-gray-100">
                  <td className="py-2 pr-4">
                    <input name="new_size" placeholder="New size" className={adminInput} />
                  </td>
                  <td className="py-2 pr-4">
                    <input name="new_sku" placeholder="Auto if empty" className={adminInput} />
                  </td>
                  <td className="py-2 pr-4">
                    <input name="new_stock" type="number" min="0" step="1" placeholder="0" className={adminInput} />
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Untick &quot;On sale&quot; to hide a size without deleting it.</p>
          <div className="mt-4">
            <SubmitButton>Save sizes &amp; stock</SubmitButton>
          </div>
        </ActionForm>
      </section>

      {/* Delete buttons in the table submit these forms (a form can't contain another form). */}
      {variants.map((v) => (
        <form key={v.id} id={`delete-variant-${v.id}`} action={deleteVariant} hidden>
          <input type="hidden" name="id" value={v.id} />
          <input type="hidden" name="productId" value={product.id} />
        </form>
      ))}

      <section>
        <h2 className="text-lg font-semibold mb-1">Photos</h2>
        <p className="text-sm text-gray-500 mb-3">The first photo is the main one; the second is shown on hover.</p>
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={img.id} className="space-y-2">
                <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                  <Image src={img.url} alt={img.alt ?? ""} fill sizes="200px" className="object-cover" />
                  <span className="absolute top-2 left-2 bg-white text-xs font-semibold px-2 py-0.5 rounded">
                    {i === 0 ? "Main" : i === 1 ? "Hover" : `#${i + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button disabled={i === 0} className="p-2 border border-gray-200 rounded disabled:opacity-30" aria-label="Move earlier">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </form>
                  <form action={moveImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      disabled={i === images.length - 1}
                      className="p-2 border border-gray-200 rounded disabled:opacity-30"
                      aria-label="Move later"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </form>
                  <form action={deleteImage} className="ml-auto">
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <ConfirmButton message="Delete this photo?" className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete photo</span>
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            ))}
            {images.length === 0 && <p className="text-sm text-gray-500 col-span-full">No photos yet.</p>}
          </div>

          <ActionForm action={uploadImage} className="border-t border-gray-100 pt-6">
            <input type="hidden" name="productId" value={product.id} />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
              <input name="alt" placeholder="Description (optional, for accessibility)" className={`${adminInput} sm:max-w-xs`} />
              <SubmitButton pendingText="Uploading…">Upload photo</SubmitButton>
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP up to 7 MB. Photos are converted to WebP automatically.</p>
          </ActionForm>
        </div>
      </section>

      <section className="border-t border-gray-200 pt-6">
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton
            message={`Delete ${product.name} (${product.color}) permanently? Past orders keep their details. To hide it instead, untick "Visible in store".`}
            className="text-sm text-red-600 underline"
          >
            Delete this product
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
