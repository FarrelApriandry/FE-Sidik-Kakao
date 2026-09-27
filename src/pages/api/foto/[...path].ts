import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

/**
 * GET /api/foto/[...path]
 *
 * Serves harvest photos from the PRIVATE `beans` bucket after verifying
 * ownership — replaces the old permanent public URLs:
 * - petani  → only files under `<own_user_id>/…`
 * - admin   → only files owned by farmers in their own poktan
 *
 * Auth uses the `sb-access-token` cookie (browsers send it automatically on
 * `<img>` requests) and the token is validated against Supabase Auth here —
 * the cookie value itself is never trusted.
 */

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params, cookies }) => {
  const relPath = params.path;

  if (!relPath || relPath.split("/").some((seg) => seg === ".." || seg === "")) {
    return json(400, { error: "Path foto tidak valid." });
  }

  const ext = relPath.split(".").pop()?.toLowerCase() ?? "";
  if (!(ext in EXT_MIME)) {
    return json(400, { error: "Format foto tidak didukung." });
  }

  const token = cookies.get("sb-access-token")?.value;
  if (!token) {
    return json(401, { error: "Sesi tidak ditemukan. Silakan login kembali." });
  }

  const supabaseUrl =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[/api/foto] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json(500, { error: "Konfigurasi server storage belum lengkap." });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return json(401, {
      error: "Sesi autentikasi tidak valid atau sudah kedaluwarsa.",
    });
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, poktan_id")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as string | undefined;

  // Owner = first path segment for new uploads (`<userId>/…`).
  // Legacy files (pre-auth, flat `<farmerId>_<ts>.<ext>`) carry the owner
  // as the filename prefix before the first underscore.
  const firstSeg = relPath.split("/")[0];
  const ownerId = relPath.includes("/") ? firstSeg : firstSeg.split("_")[0];

  if (role === "petani") {
    // Farmers may only view their own photos.
    if (ownerId !== user.id) {
      return json(404, { error: "Foto tidak ditemukan." });
    }
  } else if (role === "admin_poktan" && profile?.poktan_id) {
    // Admins may only view photos of farmers in their own poktan.
    const { data: owner } = await adminClient
      .from("profiles")
      .select("poktan_id")
      .eq("id", ownerId)
      .maybeSingle();
    if (!owner || owner.poktan_id !== profile.poktan_id) {
      return json(404, { error: "Foto tidak ditemukan." });
    }
  } else {
    return json(403, { error: "Akses ditolak." });
  }

  const { data: blob, error: dlError } = await adminClient.storage
    .from("beans")
    .download(relPath);

  if (dlError || !blob) {
    return json(404, { error: "Foto tidak ditemukan." });
  }

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": blob.type || EXT_MIME[ext],
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(blob.size),
    },
  });
};
