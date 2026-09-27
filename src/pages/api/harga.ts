import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";

export const prerender = false;

/* ── Expected price matrix (must match the HargaModal form) ── */
const VALID_GRADES = ["A", "B"] as const;
const VALID_CATEGORIES = ["basah", "fermentasi", "kering"] as const;
const EXPECTED_COUNT = VALID_GRADES.length * VALID_CATEGORIES.length; // 6
const MIN_PRICE = 1;
const MAX_PRICE = 1_000_000_000;

export const PUT: APIRoute = async ({ request }) => {
  /* ── Rate limit: max 20 price updates / minute / IP ── */
  const ip = getClientIp(request);
  const rl = checkRateLimit(`harga:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfterSec} detik.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfterSec),
        },
      }
    );
  }

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

  /* Upsert prices — strict matrix validation */
  const seen = new Set<string>();
  const rows: Array<{ grade: string; category: string; price_per_kg: number }> = [];

  for (const p of prices) {
    const grade = p.grade as (typeof VALID_GRADES)[number];
    const category = p.category as (typeof VALID_CATEGORIES)[number];

    if (!VALID_GRADES.includes(grade) || !VALID_CATEGORIES.includes(category)) {
      return new Response(
        JSON.stringify({
          error: `Entri harga tidak valid: grade "${p.grade}" / kategori "${p.category}".`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (
      typeof p.pricePerKg !== "number" ||
      !Number.isFinite(p.pricePerKg) ||
      p.pricePerKg < MIN_PRICE ||
      p.pricePerKg > MAX_PRICE
    ) {
      return new Response(
        JSON.stringify({
          error: `Harga untuk Grade ${grade} / ${category} harus Rp ${MIN_PRICE.toLocaleString("id-ID")}–Rp ${MAX_PRICE.toLocaleString("id-ID")}.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const key = `${grade}|${category}`;
    if (seen.has(key)) {
      return new Response(
        JSON.stringify({
          error: `Entri ganda untuk Grade ${grade} / ${category}.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    seen.add(key);
    rows.push({ grade, category, price_per_kg: Math.round(p.pricePerKg) });
  }

  if (rows.length !== EXPECTED_COUNT) {
    return new Response(
      JSON.stringify({
        error: `Matriks harga harus lengkap (${EXPECTED_COUNT} entri: Grade A/B × basah/fermentasi/kering).`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

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
