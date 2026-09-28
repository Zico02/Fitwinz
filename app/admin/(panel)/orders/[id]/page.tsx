import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { saveShipment, updateOrderStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { dateTime, ORDER_STATUSES, STATUS_STYLES, type OrderStatus } from "@/lib/admin/labels";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";

export const metadata = { title: "Order" };

const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: order }, { settings }] = await Promise.all([
    supabase.from("orders").select("*, order_items(*), shipments(*)").eq("id", id).maybeSingle(),
    getStorefront(),
  ]);
  if (!order) notFound();

  const money = (n: number | string) => formatPrice(Number(n), settings);
  const shipment = Array.isArray(order.shipments) ? order.shipments[0] : order.shipments;
  const status = order.status as OrderStatus;
  const whatsapp = `https://wa.me/${order.phone.replace("+", "")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black">
          ← Orders
        </Link>
        <h1 className="text-2xl font-bold">{order.order_number}</h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>{status}</span>
        <span className="text-sm text-gray-500">{dateTime(order.created_at)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.order_items.map(
              (item: {
                id: string;
                product_name: string;
                product_slug: string;
                color: string | null;
                size: string;
                sku: string | null;
                quantity: number;
                unit_price: number;
                line_total: number;
                image_url: string | null;
              }) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image_url && <Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1 flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-gray-500">
                        {[item.color, item.size].filter(Boolean).join(" / ")} · SKU {item.sku ?? "-"}
                      </p>
                      <p className="text-gray-500">
                        {item.quantity} × {money(item.unit_price)}
                      </p>
                    </div>
                    <span className="font-semibold">{money(item.line_total)}</span>
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="border-t border-gray-100 mt-6 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount ({order.discount_code})</span>
                <span>-{money(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{Number(order.shipping_fee) === 0 ? "Free" : money(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2">
              <span>To collect (cash on delivery)</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 text-sm space-y-1">
            <h2 className="font-semibold mb-3 text-base">Customer</h2>
            <p className="font-semibold">{order.full_name}</p>
            <p>
              <a href={`tel:${order.phone}`} className="underline">
                {order.phone}
              </a>{" "}
              ·{" "}
              <a href={whatsapp} target="_blank" rel="noreferrer" className="underline">
                WhatsApp
              </a>
            </p>
            {order.email && (
              <p>
                <a href={`mailto:${order.email}`} className="underline">
                  {order.email}
                </a>
              </p>
            )}
            <p className="pt-2 text-gray-700">
              {order.address_line}
              <br />
              {order.city}
            </p>
            {order.notes && (
              <p className="pt-2">
                <span className="font-semibold">Notes:</span> {order.notes}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="font-semibold mb-3">Status</h2>
            <ActionForm action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" defaultValue={status} className={input} disabled={order.restocked}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {order.restocked ? (
                <p className="text-sm text-gray-500">This order is closed; its items were put back in stock.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500">Cancelled or returned puts the items back in stock.</p>
                  <SubmitButton>Update status</SubmitButton>
                </>
              )}
            </ActionForm>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="font-semibold mb-3">Shipment</h2>
            <ActionForm action={saveShipment} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input name="carrier" defaultValue={shipment?.carrier ?? ""} placeholder="Carrier (e.g. Amana, CTM)" className={input} />
              <input name="tracking" defaultValue={shipment?.tracking_number ?? ""} placeholder="Tracking number" className={input} />
              {shipment?.shipped_at && <p className="text-xs text-gray-500">Shipped {dateTime(shipment.shipped_at)}</p>}
              {shipment?.delivered_at && <p className="text-xs text-gray-500">Delivered {dateTime(shipment.delivered_at)}</p>}
              <SubmitButton>Save shipment</SubmitButton>
            </ActionForm>
          </div>
        </div>
      </div>
    </div>
  );
}
