import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[SIDIK-KAKAO] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

// ── Singleton (lazy-initialized, SSR-safe) ──
let _supabase: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client.
 * Safe for Astro SSR — only called from client-side React components (`client:load`).
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "sidik_kakao_auth",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabase;
}

/* ── Seed IDs (for development / fallback) ── */
export const SEED_POKTAN_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
export const SEED_PETANI_ID = "22222222-2222-2222-2222-222222222222";
export const SEED_ADMIN_ID = "11111111-1111-1111-1111-111111111111";
