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
    return new Response(
      JSON.stringify({ error: "Format data permintaan tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password, fullName, phoneNumber, estateAreaHa } = body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return new Response(
      JSON.stringify({ error: "Format email tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!password || password.length < 6) {
    return new Response(
      JSON.stringify({ error: "Password minimal 6 karakter." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!fullName || fullName.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Nama lengkap wajib diisi." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (estateAreaHa != null && (typeof estateAreaHa !== "number" || estateAreaHa < 0)) {
    return new Response(
      JSON.stringify({ error: "Luas lahan harus berupa angka positif." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Verify admin identity from Bearer token ── */
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Sesi tidak ditemukan. Silakan login kembali." }),
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
      JSON.stringify({ error: "Konfigurasi layanan server tidak lengkap." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  const {
    data: { user: adminUser },
    error: authError,
  } = await adminClient.auth.getUser(accessToken);

  if (authError || !adminUser) {
    console.error("[/api/petani] Auth verification failed:", authError?.message);
    return new Response(
      JSON.stringify({ error: "Sesi autentikasi tidak valid atau sudah kedaluwarsa." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Resolve admin's poktan_id & role from profiles ── */
  const { data: adminProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, role, poktan_id")
    .eq("id", adminUser.id)
    .maybeSingle();

  if (profileError || !adminProfile) {
    console.error("[/api/petani] Profile fetch error:", profileError?.message);
    return new Response(
      JSON.stringify({ error: "Profil akun admin tidak ditemukan." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (adminProfile.role !== "admin_poktan") {
    return new Response(
      JSON.stringify({ error: "Akses ditolak. Hanya Admin Poktan yang diizinkan." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const poktanId = adminProfile.poktan_id as string;

  /* ── Create Supabase Auth user ── */
  const { data: newUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    });

  if (createError || !newUser?.user) {
    console.error("[/api/petani] createUser error:", createError?.message);

    let userFriendlyMsg = "Gagal mendaftarkan akun petani.";
    const rawMsg = createError?.message?.toLowerCase() ?? "";
    if (rawMsg.includes("already registered") || rawMsg.includes("unique")) {
      userFriendlyMsg = "Email sudah terdaftar. Gunakan email lain.";
    } else if (rawMsg.includes("password")) {
      userFriendlyMsg = "Password terlalu lemah. Minimal 6 karakter.";
    }

    return new Response(
      JSON.stringify({ error: userFriendlyMsg }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Update profile created by database trigger ── */
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      phone_number: phoneNumber?.trim() || null,
      estate_area_ha: estateAreaHa != null ? estateAreaHa : null,
      poktan_id: poktanId,
      role: "petani",
    })
    .eq("id", newUser.user.id);

  if (updateError) {
    console.error("[/api/petani] Profile update error:", updateError.message);
    // Cleanup orphaned auth user
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return new Response(
      JSON.stringify({ error: "Gagal menyimpan data profil petani." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      userId: newUser.user.id,
      message: `Petani "${fullName.trim()}" berhasil ditambahkan.`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
