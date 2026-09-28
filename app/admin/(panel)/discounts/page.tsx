import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { adminInput } from "@/components/admin/ProductForm";
import { createDiscount, deleteDiscount, toggleDiscount } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { dateTime } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: codes }, { settings }] = await Promise.all([
    supabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
    getStorefront(),
  ]);
  const money = (n: number) => formatPrice(n, settings);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discount codes</h1>

      <ActionForm action={createDiscount} className="bg-white rounded-lg p-6">
        <h2 className="font-semibold mb-4">New code</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <label className="block col-span-2 md:col-span-1">
            <span className="block text-sm font-medium mb-1">Code</span>
            <input name="code" required placeholder="WELCOME10" className={`${adminInput} uppercase`} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Type</span>
            <select name="type" className={adminInput}>
              <option value="percent">% off</option>
              <option value="fixed">Amount off</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Value</span>
            <input name="value" type="number" step="0.01" min="0.01" required className={adminInput} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Min. subtotal</span>
            <input name="min_subtotal" type="number" step="0.01" min="0" defaultValue="0" className={adminInput} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Max uses</span>
            <input name="max_uses" type="number" step="1" min="1" placeholder="Unlimited" className={adminInput} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Ends on</span>
            <input name="ends_at" type="date" className={adminInput} />
          </label>
        </div>
        <div className="mt-4">
          <SubmitButton>Create code</SubmitButton>
        </div>
      </ActionForm>

      <div className="bg-white rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Min. subtotal</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Ends</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(codes ?? []).map((c) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.type === "percent" ? `${Number(c.value)}%` : money(Number(c.value))}</td>
                <td className="px-4 py-3">{Number(c.min_subtotal) > 0 ? money(Number(c.min_subtotal)) : "-"}</td>
                <td className="px-4 py-3">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{c.ends_at ? dateTime(c.ends_at) : "-"}</td>
                <td className="px-4 py-3">
                  <form action={toggleDiscount}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="active" value={String(!c.is_active)} />
                    <button
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                      }`}
                      title="Click to switch"
                    >
                      {c.is_active ? "Active" : "Off"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteDiscount}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Delete code ${c.code}?`} className="text-red-600 underline text-xs">
                      Delete
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {codes?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No discount codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
