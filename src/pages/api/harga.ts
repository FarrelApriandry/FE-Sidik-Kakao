import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  let body: {
    prices?: Array<{ grade: string; category: string; pricePerKg: number }>;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Format payload tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { prices } = body;
  if (!prices || !Array.isArray(prices) || prices.length === 0) {
    return new Response(
      JSON.stringify({ error: "Daftar harga acuan wajib diisi." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* Verify Bearer token & Admin role */
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
    return new Response(
      JSON.stringify({ error: "Konfigurasi server tidak lengkap." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(accessToken);

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Sesi autentikasi tidak valid." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin_poktan") {
    return new Response(
      JSON.stringify({ error: "Akses ditolak. Hanya Admin Poktan yang dapat memperbarui harga acuan." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  /* Upsert prices */
  const rows = prices.map((p) => ({
    grade: p.grade,
    category: p.category,
    price_per_kg: p.pricePerKg,
  }));

  const { error: upsertError } = await adminClient
    .from("grade_prices")
    .upsert(rows, { onConflict: "grade,category" });

  if (upsertError) {
    console.error("[/api/harga] Upsert error:", upsertError.message);
    return new Response(
      JSON.stringify({ error: "Gagal memperbarui matriks harga acuan." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Matriks harga acuan berhasil diperbarui." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
