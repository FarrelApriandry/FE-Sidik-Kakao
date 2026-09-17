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

/* ── Current User Helper ── */
export interface AppUser {
  id: string;
  fullName: string;
  avatar: string;
  role: "admin_poktan" | "petani";
  poktanId?: string;
}

/**
 * Returns the currently authenticated Supabase user, or null if no session.
 * Fetches role & poktan_id from the `profiles` table (source of truth).
 * Safe for client-side only (uses persisted session from localStorage).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch role + poktan_id from profiles table (source of truth)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, poktan_id")
      .eq("id", user.id)
      .single();

    const fullName: string = profile?.full_name ?? user.user_metadata?.full_name ?? "Petani";
    const initials = fullName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: user.id,
      fullName,
      avatar: initials,
      role: (profile?.role as "admin_poktan" | "petani") ?? "petani",
      poktanId: profile?.poktan_id ?? (user.user_metadata?.poktan_id as string | undefined),
    };
  } catch {
    return null;
  }
}

/* ── Seed IDs (for development / fallback) ── */
export const SEED_POKTAN_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
export const SEED_PETANI_ID = "22222222-2222-2222-2222-222222222222";
export const SEED_ADMIN_ID = "11111111-1111-1111-1111-111111111111";
