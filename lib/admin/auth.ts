import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Returns a session-bound Supabase client for a signed-in admin, or redirects to the login page.
 * Every admin page and Server Action calls this: Server Actions are public HTTP endpoints,
 * so the check must not rely on the page having been rendered first.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login?error=not-configured");
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not-admin");

  return { supabase, user };
}

export type ActionState = { ok: boolean; message: string } | null;
