import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

/* ── Upload constraints ── */
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Allowed MIME → safe extension + magic-byte signature.
 * NOTE: `file.type` is client-controlled, so the magic-byte check below
 * is the real gate — a renamed .svg/.html will be rejected here.
 */
const ALLOWED_TYPES: Record<string, { ext: string; magic: number[][] }> = {
  "image/jpeg": { ext: "jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: "png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { ext: "webp", magic: [] }, // "RIFF....WEBP" — checked separately
};

function hasValidSignature(buf: Uint8Array, mime: string): boolean {
  if (mime === "image/webp") {
    return (
      buf.length > 12 &&
      buf[0] === 0x52 && // R
      buf[1] === 0x49 && // I
      buf[2] === 0x46 && // F
      buf[3] === 0x46 && // F
      buf[8] === 0x57 && // W
      buf[9] === 0x45 && // E
      buf[10] === 0x42 && // B
      buf[11] === 0x50 // P
    );
  }
  const check = ALLOWED_TYPES[mime];
  if (!check) return false;
  return check.magic.some((sig) => sig.every((b, i) => buf[i] === b));
}

function json(
  status: number,
  body: Record<string, unknown>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  /* ── 1. Verify Bearer token (same pattern as /api/petani & /api/harga) ── */
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json(401, { error: "Sesi tidak ditemukan. Silakan login kembali." });
  }
  const accessToken = authHeader.slice(7);

  const supabaseUrl =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[/api/upload] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json(500, { error: "Konfigurasi server storage belum lengkap." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(accessToken);

  if (authError || !user) {
    return json(401, {
      error: "Sesi autentikasi tidak valid atau sudah kedaluwarsa.",
    });
  }

  /* ── 2. Role check: only petani & admin_poktan may upload harvest photos ── */
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as string | undefined;
  if (role !== "petani" && role !== "admin_poktan") {
    console.warn(`[/api/upload] Forbidden upload attempt by user ${user.id}`);
    return json(403, {
      error: "Akses ditolak. Akun Anda tidak diizinkan mengunggah foto.",
    });
  }

  /* ── 3. Parse & validate file ── */
  let file: File | null;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File | null;
    // NOTE: `farmerId` from the client is intentionally ignored —
    // the storage path is derived from the authenticated user below.
  } catch {
    return json(400, { error: "Format data permintaan tidak valid." });
  }

  if (!file || file.size === 0) {
    return json(400, { error: "Berkas foto tidak ditemukan." });
  }

  if (file.size > MAX_FILE_BYTES) {
    return json(413, { error: "Ukuran foto melebihi batas 5 MB." });
  }

  if (!(file.type in ALLOWED_TYPES)) {
    return json(400, {
      error: "Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.",
    });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) {
    console.warn(
      `[/api/upload] Signature mismatch from user ${user.id} (claimed ${file.type})`
    );
    return json(400, { error: "Berkas bukan foto yang valid." });
  }

  /* ── 4. Upload — path derived from the authenticated user ID ── */
  const ext = ALLOWED_TYPES[file.type].ext;
  const rand = crypto.randomUUID().slice(0, 8);
  const fileName = `${user.id}/${Date.now()}_${rand}.${ext}`;

  const { error: uploadError } = await adminClient.storage
    .from("beans")
    .upload(fileName, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    // Log the real cause server-side, return a generic message client-side.
    console.error("[/api/upload] Storage error:", uploadError.message);
    return json(500, { error: "Gagal mengunggah foto. Coba lagi." });
  }

  const { data: publicUrlData } = adminClient.storage
    .from("beans")
    .getPublicUrl(fileName);

  return json(200, {
    url: publicUrlData.publicUrl,
    fileName,
  });
};
