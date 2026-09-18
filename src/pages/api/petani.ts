import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

/** Mark this route as server-rendered so POST requests are handled at runtime. */
export const prerender = false;

/**
 * POST /api/petani
 *
 * Creates a new farmer (petani) under the requesting admin's poktan.
 *
 * Request body (JSON):
 *   { email, password, fullName, phoneNumber, estateAreaHa }
 *
 * Auth: Bearer <access_token> — must belong to an admin_poktan user.
 *
 * Server-side env required (not PUBLIC_):
 *   SUPABASE_URL            — same as PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service_role secret
 */

export const POST: APIRoute = async ({ request }) => {
  /* ── Parse & validate body ── */
  let body: {
    email?: string;
    password?: string;
    fullName?: string;
    phoneNumber?: string;
    estateAreaHa?: number;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password, fullName, phoneNumber, estateAreaHa } = body;

  if (!email || !password || !fullName) {
    return new Response(
      JSON.stringify({ error: "email, password, dan fullName wajib diisi." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({ error: "Password minimal 6 karakter." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Verify admin identity from Bearer token ── */
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Tidak ada token autentikasi." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const accessToken = authHeader.slice(7);
  const supabaseUrl =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[/api/petani] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(
      JSON.stringify({ error: "Konfigurasi server tidak lengkap." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Use service role client so we can both verify the token and create users
  const adminClient = createClient(supabaseUrl, serviceKey);

  const {
    data: { user: adminUser },
    error: authError,
  } = await adminClient.auth.getUser(accessToken);

  console.log("[/api/petani] authError:", authError, "adminUser.id:", adminUser?.id);

  if (authError || !adminUser) {
    return new Response(
      JSON.stringify({ error: "Token tidak valid atau sudah kedaluwarsa." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Resolve admin's poktan_id & role from profiles ── */
  const { data: adminProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, role, poktan_id")
    .eq("id", adminUser.id)
    .maybeSingle();

  console.log("[/api/petani] profileError:", profileError);
  console.log("[/api/petani] adminProfile:", JSON.stringify(adminProfile));

  if (profileError) {
    return new Response(
      JSON.stringify({ error: "Gagal memuat profil admin.", reason: "profile_error", detail: profileError.message }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!adminProfile) {
    return new Response(
      JSON.stringify({ error: "Profil admin tidak ditemukan. Pastikan profil sudah dibuat di tabel profiles.", reason: "no_profile" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (adminProfile.role !== "admin_poktan") {
    return new Response(
      JSON.stringify({ error: `Role saat ini: '${adminProfile.role}'. Hanya 'admin_poktan' yang bisa menambah petani.`, reason: "not_admin" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const poktanId = adminProfile.poktan_id as string;

  /* ── Create Supabase Auth user (admin API — won't log out current session) ── */
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email verification
      user_metadata: { full_name: fullName },
    });

  if (createError || !newUser?.user) {
    // Supabase Admin API error — extract the most descriptive message available
    const raw =
      (createError as Record<string, unknown>) ??
      {};
    const msg =
      (raw.message as string) ??
      (raw.msg as string) ??
      (raw.error_description as string) ??
      "Gagal membuat akun autentikasi.";
    console.error("[/api/petani] createUser failed:", JSON.stringify(createError));
    return new Response(
      JSON.stringify({
        error: msg,
        code: (raw as Record<string, unknown>).status ?? 400,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Update the profile row created by the Supabase trigger ── */
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      full_name: fullName,
      phone_number: phoneNumber ?? null,
      estate_area_ha: estateAreaHa != null ? estateAreaHa : null,
      poktan_id: poktanId,
      role: "petani",
    })
    .eq("id", newUser.user.id);

  if (updateError) {
    console.error("[/api/petani] Profile update failed:", updateError);
    // Attempt to clean up the orphan auth user
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return new Response(
      JSON.stringify({
        error: `Gagal menyimpan profil: ${updateError.message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      userId: newUser.user.id,
      message: `Petani "${fullName}" berhasil ditambahkan.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
