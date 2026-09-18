import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

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

  if (authError || !adminUser) {
    return new Response(
      JSON.stringify({ error: "Token tidak valid atau sudah kedaluwarsa." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Resolve admin's poktan_id & role from profiles ── */
  const { data: adminProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, poktan_id")
    .eq("id", adminUser.id)
    .single();

  if (profileError || !adminProfile || adminProfile.role !== "admin_poktan") {
    return new Response(
      JSON.stringify({ error: "Hanya admin poktan yang bisa menambah petani." }),
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
    const msg =
      createError?.message?.includes("already") ||
      createError?.message?.includes("exists")
        ? "Email sudah terdaftar."
        : createError?.message ?? "Gagal membuat akun autentikasi.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  /* ── Insert profile row ── */
  const { error: insertError } = await adminClient.from("profiles").insert({
    id: newUser.user.id,
    full_name: fullName,
    phone_number: phoneNumber ?? null,
    estate_area_ha: estateAreaHa != null ? estateAreaHa : null,
    poktan_id: poktanId,
    role: "petani",
  });

  if (insertError) {
    console.error("[/api/petani] Profile insert failed:", insertError);
    // Attempt to clean up the orphan auth user
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return new Response(
      JSON.stringify({
        error: `Gagal menyimpan profil: ${insertError.message}`,
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
