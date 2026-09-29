import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import AddressForm, { accountInput } from "@/components/account/AddressForm";
import LogoutButton from "@/components/account/LogoutButton";
import ActionForm, { SubmitButton } from "@/components/admin/ActionForm";
import { deleteAddress, setDefaultAddress, updateProfile } from "@/app/account/actions";
import { dateTime } from "@/lib/admin/labels";
import { CUSTOMER_STATUS_TEXT } from "@/lib/order-status";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  full_name: string;
  phone: string;
  city: string;
  address_line: string;
  subtotal: number;
  discount_code: string | null;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  order_items: { id: string; product_name: string; color: string | null; size: string; quantity: number; line_total: number; image_url: string | null }[];
  shipments: { carrier: string | null; tracking_number: string | null; tracking_url: string | null } | null;
};

const NOTICES: Record<string, string> = {
  welcome: "Your email is confirmed. Welcome to Fitwinz!",
  "password-updated": "Your password was updated.",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  returned: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-100 rounded-lg p-6">
      <h2 className="text-sm font-bold tracking-wider mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { notice } = await searchParams;
  const [{ data: profileRow }, { data: addresses }, { data: orders }, { settings }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, phone").eq("id", user.id).maybeSingle(),
    supabase.from("saved_addresses").select("id, full_name, phone, city, address_line, is_default").order("created_at"),
    supabase
      .from("orders")
      .select(
        "id, order_number, created_at, status, full_name, phone, city, address_line, subtotal, discount_code, discount_amount, shipping_fee, total, " +
          "order_items(id, product_name, color, size, quantity, line_total, image_url), shipments(carrier, tracking_number, tracking_url)",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    getStorefront(),
  ]);

  const profile = profileRow ?? { first_name: "", last_name: "", phone: null };
  const money = (n: number) => formatPrice(Number(n), settings);
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <>
      <SiteChrome />
      <main className="mt-[108px] px-6 lg:px-10 py-10 bg-gray-50 min-h-[70vh]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">MY ACCOUNT</h1>
              <p className="text-gray-600 mt-1">
                {profile.first_name ? `Hello ${profile.first_name}` : "Hello"} · {user.email}
              </p>
            </div>
            <LogoutButton />
          </div>

          {notice && NOTICES[notice] && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">{NOTICES[notice]}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="PROFILE">
              <ActionForm action={updateProfile} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="first_name" defaultValue={profile.first_name} placeholder="First name*" required className={accountInput} aria-label="First name" />
                  <input name="last_name" defaultValue={profile.last_name} placeholder="Last name*" required className={accountInput} aria-label="Last name" />
                </div>
                <input name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="Phone (06 12 34 56 78)" className={accountInput} aria-label="Phone" />
                <input value={user.email ?? ""} disabled className={`${accountInput} bg-gray-50 text-gray-500`} aria-label="Email" />
                <SubmitButton pendingText="SAVING..." className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
                  SAVE PROFILE
                </SubmitButton>
              </ActionForm>
              <Link href="/forgot-password" className="inline-block mt-4 text-sm underline text-gray-600 hover:text-black">
                Change my password
              </Link>
            </Card>

            <Card title="SAVED ADDRESSES">
              <ul className="space-y-3 mb-6">
                {(addresses ?? []).map((a) => (
                  <li key={a.id} className="border border-gray-200 rounded-lg p-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="leading-relaxed">
                        <strong>{a.full_name}</strong>
                        {a.is_default && <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Default</span>}
                        <br />
                        {a.address_line}
                        <br />
                        {a.city} · {a.phone}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      {!a.is_default && (
                        <form action={setDefaultAddress}>
                          <input type="hidden" name="id" value={a.id} />
                          <button className="underline text-gray-600 hover:text-black">Make default</button>
                        </form>
                      )}
                      <form action={deleteAddress}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="underline text-gray-600 hover:text-red-600">Delete</button>
                      </form>
                    </div>
                  </li>
                ))}
                {addresses?.length === 0 && <li className="text-sm text-gray-500">No saved addresses yet.</li>}
              </ul>
              <h3 className="text-sm font-semibold mb-3">Add an address</h3>
              <AddressForm defaultName={fullName} defaultPhone={profile.phone ?? ""} />
            </Card>
          </div>

          <Card title="MY ORDERS">
            {orders?.length ? (
              <ul className="space-y-3">
                {(orders as unknown as OrderRow[]).map((o) => {
                  const shipment = Array.isArray(o.shipments) ? o.shipments[0] : o.shipments;
                  return (
                    <li key={o.id} className="border border-gray-200 rounded-lg">
                      <details className="group">
                        <summary className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer list-none">
                          <div>
                            <p className="font-semibold">{o.order_number}</p>
                            <p className="text-sm text-gray-500">{dateTime(o.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[o.status] ?? "bg-gray-100"}`}>
                              {CUSTOMER_STATUS_TEXT[o.status] ?? o.status}
                            </span>
                            <span className="font-semibold">{money(o.total)}</span>
                            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                          </div>
                        </summary>
                        <div className="border-t border-gray-100 p-4 space-y-4 text-sm">
                          <div className="space-y-3">
                            {o.order_items.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="relative w-14 h-[74px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                  {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="56px" className="object-cover" />}
                                </div>
                                <div className="flex-1 flex justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">{item.product_name}</p>
                                    <p className="text-gray-500">
                                      {[item.color, item.size].filter(Boolean).join(" / ")} × {item.quantity}
                                    </p>
                                  </div>
                                  <span className="font-semibold">{money(item.line_total)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-100 pt-3 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span>{money(o.subtotal)}</span>
                            </div>
                            {Number(o.discount_amount) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Discount ({o.discount_code})</span>
                                <span>-{money(o.discount_amount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping</span>
                              <span>{Number(o.shipping_fee) === 0 ? "Free" : money(o.shipping_fee)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Total (cash on delivery)</span>
                              <span>{money(o.total)}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            <strong className="text-black">Delivery:</strong> {o.full_name}, {o.address_line}, {o.city} · {o.phone}
                          </p>
                          {shipment?.tracking_number && (
                            <p className="text-gray-600">
                              <strong className="text-black">Tracking:</strong> {shipment.carrier ? `${shipment.carrier} · ` : ""}
                              {shipment.tracking_url ? (
                                <a href={shipment.tracking_url} target="_blank" rel="noreferrer" className="underline">
                                  {shipment.tracking_number}
                                </a>
                              ) : (
                                shipment.tracking_number
                              )}
                            </p>
                          )}
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven&apos;t placed an order with this account yet.</p>
                <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800">
                  START SHOPPING
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
