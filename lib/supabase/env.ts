export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until .env.local is filled in; the storefront then falls back to lib/catalog.ts. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
