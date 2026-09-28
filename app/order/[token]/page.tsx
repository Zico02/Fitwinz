import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import SimplePageHeader from "@/components/SimplePageHeader";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_TEXT: Record<string, string> = {
  pending: "Received: we will call you to confirm",
  confirmed: "Confirmed: being prepared",
  shipped: "Shipped: on its way",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token) || !process.env.SUPABASE_SECRET_KEY?.trim()) notFound();

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("public_token", token)
    .maybeSingle();
  if (!order) notFound();

  const { settings } = await getStorefront();
  const money = (n: number | string) => formatPrice(Number(n), settings);
  const items: {
    id: string;
    product_name: string;
    color: string | null;
    size: string;
    quantity: number;
    line_total: number;
    image_url: string | null;
  }[] = order.order_items;

  return (
    <div className="min-h-screen bg-gray-50">
      <SimplePageHeader className="bg-white border-gray-200" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white p-6 rounded-lg text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank you, {order.full_name.split(" ")[0]}!</h1>
          <p className="text-gray-600">
            Your order <span className="font-semibold text-black">{order.order_number}</span> has been received.
          </p>
          <p className="text-gray-600 mt-1">
            We will call you on <span className="font-semibold text-black">{order.phone}</span> to confirm delivery.
          </p>
          {order.email && <p className="text-sm text-gray-500 mt-3">A confirmation email is on its way to {order.email}.</p>}
        </div>

        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">ORDER SUMMARY</h2>
            <span className="text-sm text-gray-500">{STATUS_TEXT[order.status] ?? order.status}</span>
          </div>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm">{item.product_name}</h3>
                    <p className="text-sm text-gray-500">
                      {[item.color, item.size].filter(Boolean).join(" / ")} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">{money(item.line_total)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-gray-200 pt-4">
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
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-lg">To pay on delivery</span>
              <span className="font-bold text-xl">{money(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <h2 className="font-semibold mb-2">DELIVERY</h2>
          <p className="text-gray-700 leading-relaxed">
            {order.full_name}
            <br />
            {order.address_line}
            <br />
            {order.city}, Morocco
          </p>
          {order.notes && <p className="text-sm text-gray-500 mt-3">Notes: {order.notes}</p>}
          <p className="text-sm text-gray-500 mt-3">Payment: cash on delivery</p>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}
