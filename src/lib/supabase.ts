import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Flag indicating whether real Supabase configuration credentials are provided.
 */
export const isSupabaseConfigured: boolean = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co"
);

if (process.env.NODE_ENV === "development" && !isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.info(
    "[SubscriptIQ] Supabase environment variables not detected. Using safe fallback client with mock data provider."
  );
}

/**
 * Safe Supabase client singleton instance.
 * Safe to import anywhere in server and client components without crashing during build.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

