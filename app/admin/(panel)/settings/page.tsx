import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { adminInput } from "@/components/admin/ProductForm";
import { saveSettings } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: s, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  if (error || !s) return <p className="text-red-700">Could not load settings: {error?.message}</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Store settings</h1>
      <ActionForm action={saveSettings} className="bg-white rounded-lg p-6 space-y-5">
        <div>
          <h2 className="font-semibold mb-3">Currency</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Currency code</span>
              <input name="currency_code" defaultValue={s.currency_code} required maxLength={3} className={adminInput} />
              <span className="block text-xs text-gray-500 mt-1">USD now; MAD when you switch.</span>
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Price prefix</span>
              <input name="currency_prefix" defaultValue={s.currency_prefix} required maxLength={8} className={adminInput} />
              <span className="block text-xs text-gray-500 mt-1">Shown before prices, e.g. &quot;US$&quot; or &quot;MAD &quot;.</span>
            </label>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            Changing the currency does not convert prices: update product prices at the same time.
          </p>
        </div>
        <div>
          <h2 className="font-semibold mb-3">Delivery</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Delivery fee</span>
              <input name="shipping_fee" type="number" step="0.01" min="0" defaultValue={s.shipping_fee} required className={adminInput} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">Free delivery from</span>
              <input
                name="free_shipping_threshold"
                type="number"
                step="0.01"
                min="0"
                defaultValue={s.free_shipping_threshold ?? ""}
                className={adminInput}
              />
              <span className="block text-xs text-gray-500 mt-1">Subtotal before discounts. Empty = no free delivery.</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Used by the announcement bar, the bag, checkout and the order total.</p>
        </div>
        <SubmitButton>Save settings</SubmitButton>
      </ActionForm>
    </div>
  );
}
