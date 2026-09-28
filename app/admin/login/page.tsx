import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg">
        <Logo className="h-16 w-auto mx-auto object-contain bg-transparent mb-4" />
        <h1 className="text-xl font-bold text-center mb-6">FITWINZ ADMIN</h1>
        {!isSupabaseConfigured || error === "not-configured" ? (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Supabase is not configured. Fill in .env.local and restart the dev server.
          </p>
        ) : (
          <>
            {error === "not-admin" && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                This account does not have admin access.
              </p>
            )}
            <AdminLoginForm next={next ?? "/admin"} />
          </>
        )}
      </div>
    </div>
  );
}
