"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

/**
 * Browser client for customer accounts. Sign-in/sign-up run from the browser on purpose: Supabase
 * Auth then rate-limits per visitor IP (a server-side call would share one IP for everyone).
 * The session is kept in cookies, so server pages (/account, checkout) can read it too.
 * Returns null when Supabase isn't configured (preview mode).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabasePublishableKey) return null;
  client ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return client;
}
