import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const supabaseUrl =
      import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Konfigurasi server storage belum lengkap." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const farmerId = (formData.get("farmerId") as string) || "anonymous";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Berkas foto tidak ditemukan." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${farmerId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await adminClient.storage
      .from("beans")
      .upload(fileName, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: `Gagal mengunggah foto: ${uploadError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = adminClient.storage
      .from("beans")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({
        url: publicUrlData.publicUrl,
        fileName,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kesalahan server";
    return new Response(
      JSON.stringify({ error: `Terjadi kesalahan saat unggah: ${msg}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};