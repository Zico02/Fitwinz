import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { dateTime, ORDER_STATUSES, STATUS_STYLES, type OrderStatus } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 50;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const { supabase } = await requireAdmin();
  const { status, page } = await searchParams;
  const activeStatus = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;
  const pageNumber = Math.max(1, Number(page) || 1);
  const { settings } = await getStorefront();

  let query = supabase
    .from("orders")
    .select("id, order_number, created_at, full_name, phone, city, total, status", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE - 1);
  if (activeStatus) query = query.eq("status", activeStatus);
  const { data: orders, count, error } = await query;

  // Orders whose latest attempt for some email failed get an "email not sent" note.
  const emailFailed = new Set<string>();
  if (orders?.length) {
    const { data: logs } = await supabase
      .from("order_emails")
      .select("order_id, kind, status")
      .in("order_id", orders.map((o) => o.id))
      .order("created_at", { ascending: false });
    const seen = new Set<string>();
    for (const log of logs ?? []) {
      const key = `${log.order_id}:${log.kind}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (log.status === "failed") emailFailed.add(log.order_id);
    }
  }

  const tab = (value: OrderStatus | null, label: string) => (
    <Link
      key={label}
      href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
        activeStatus === value ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-black"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tab(null, "All")}
        {ORDER_STATUSES.map((s) => tab(s, s[0].toUpperCase() + s.slice(1)))}
      </div>

      {error && <p className="text-red-700">Could not load orders: {error.message}</p>}

      <div className="bg-white rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-2">
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateTime(o.created_at)}</td>
                <td className="px-4 py-3">
                  {o.full_name}
                  <div className="text-gray-500">{o.phone}</div>
                </td>
                <td className="px-4 py-3">{o.city}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatPrice(Number(o.total), settings)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status as OrderStatus]}`}>
                    {o.status}
                  </span>
                  {emailFailed.has(o.id) && <span className="block mt-1 text-xs text-red-600">email not sent</span>}
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No orders{activeStatus ? ` with status "${activeStatus}"` : " yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count !== null && count > PAGE_SIZE && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-gray-500">
            {count} orders · page {pageNumber} of {Math.ceil(count / PAGE_SIZE)}
          </span>
          <div className="flex gap-2">
            {pageNumber > 1 && (
              <Link href={`/admin/orders?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(pageNumber - 1) })}`} className="underline">
                Previous
              </Link>
            )}
            {pageNumber * PAGE_SIZE < count && (
              <Link href={`/admin/orders?${new URLSearchParams({ ...(activeStatus ? { status: activeStatus } : {}), page: String(pageNumber + 1) })}`} className="underline">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
