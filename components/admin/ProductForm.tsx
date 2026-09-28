import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { saveProduct } from "@/app/admin/actions";

export const adminInput =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

export interface ProductFormValues {
  id?: string;
  slug: string;
  name: string;
  fit: string;
  color: string;
  description: string | null;
  price: number | string;
  rating: number | string | null;
  category_id: string | null;
  sort_order: number;
  is_new: boolean;
  is_active: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

export default function ProductForm({
  values,
  categories,
  currencyPrefix,
}: {
  values: ProductFormValues;
  categories: { id: string; name: string }[];
  currencyPrefix: string;
}) {
  return (
    <ActionForm action={saveProduct} className="bg-white rounded-lg p-6 space-y-4">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <input name="name" defaultValue={values.name} required className={adminInput} />
        </Field>
        <Field label="Color">
          <input name="color" defaultValue={values.color} className={adminInput} />
        </Field>
        <Field label="Fit / material" hint='Shown under the name, e.g. "Thermal Wool Blend".'>
          <input name="fit" defaultValue={values.fit} className={adminInput} />
        </Field>
        <Field label="URL slug" hint="Used in /products/… Changing it breaks old links and saved carts.">
          <input name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={adminInput} />
        </Field>
        <Field label={`Price (${currencyPrefix.trim()})`}>
          <input name="price" type="number" step="0.01" min="0" defaultValue={values.price} required className={adminInput} />
        </Field>
        <Field label="Rating shown on the card" hint="0 to 5. Leave empty to hide the stars.">
          <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={values.rating ?? ""} className={adminInput} />
        </Field>
        <Field label="Home page section">
          <select name="category_id" defaultValue={values.category_id ?? ""} className={adminInput}>
            <option value="">None (product page only)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Position" hint="Lower numbers are shown first.">
          <input name="sort_order" type="number" step="1" defaultValue={values.sort_order} className={adminInput} />
        </Field>
      </div>
      <Field label="Description" hint="Optional. Shown on the product page.">
        <textarea name="description" rows={4} defaultValue={values.description ?? ""} className={adminInput} />
      </Field>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={values.is_active} className="w-4 h-4" /> Visible in store
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_new" defaultChecked={values.is_new} className="w-4 h-4" /> Show &quot;NEW&quot; badge
        </label>
      </div>
      <SubmitButton>{values.id ? "Save product" : "Create product"}</SubmitButton>
    </ActionForm>
  );
}
