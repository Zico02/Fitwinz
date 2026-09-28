import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

// Admin pages depend on the signed-in user: never prerender or cache them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Fitwinz Admin" }, robots: { index: false } };

const nav = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center gap-6 overflow-x-auto">
          <Link href="/admin" className="font-extrabold tracking-widest shrink-0">
            FITWINZ ADMIN
          </Link>
          <nav className="flex gap-4 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-gray-300 hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm shrink-0">
            <Link href="/" target="_blank" className="text-gray-300 hover:text-white">
              View store ↗
            </Link>
            <span className="hidden md:inline text-gray-400">{user.email}</span>
            <form action={signOut}>
              <button className="text-gray-300 hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  );
}
