import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side session resolution.
 *
 * The `sb-access-token` cookie is only a *hint* — it is set from client-side
 * JS so it can be forged. The source of truth is established here by
 * validating the token against Supabase Auth and reading the role from the
 * `profiles` table. Never trust the `sb-user-role` cookie value.
 */

type PortalRole = "admin_poktan" | "petani";

function getAdminClient() {
  const supabaseUrl =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

/** Validate the token and return the DB role, or null if invalid. */
async function resolveRole(token: string): Promise<PortalRole | null> {
  try {
    const admin = getAdminClient();
    if (!admin) return null;
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(token);
    if (error || !user) return null;
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role as string | undefined;
    return role === "admin_poktan" || role === "petani" ? role : null;
  } catch {
    return null;
  }
}

function portalFor(role: PortalRole): string {
  return role === "admin_poktan" ? "/dashboard" : "/petani";
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Bypass static assets and internal/api routes
  if (
    pathname.startsWith("/_") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/Ico") ||
    pathname.includes(".")
  ) {
    return next();
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isPetani = pathname.startsWith("/petani");
  const isLogin = pathname === "/";

  // Public non-portal pages need no session check
  if (!isDashboard && !isPetani && !isLogin) {
    return next();
  }

  const token = context.cookies.get("sb-access-token")?.value;

  if (!token) {
    if (isLogin) return next();
    return context.redirect("/");
  }

  const role = await resolveRole(token);

  if (!role) {
    // Invalid / expired / unverifiable session — fail closed.
    // (Also covers missing server-side Supabase config.)
    context.cookies.delete("sb-access-token", { path: "/" });
    context.cookies.delete("sb-refresh-token", { path: "/" });
    context.cookies.delete("sb-user-role", { path: "/" });
    if (isLogin) return next();
    return context.redirect("/");
  }

  // Re-assert the role cookie from the DB truth so any client-forged
  // value is corrected on every navigation. Not HttpOnly on purpose:
  // LoginForm/logoutUser manage these cookies from client JS, and this
  // value is never trusted for authorization — only resolveRole() is.
  context.cookies.set("sb-user-role", role, {
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  // Already logged in and visiting login page → send to own portal
  if (isLogin) {
    return context.redirect(portalFor(role));
  }

  // Portal guard by DB role
  if (isDashboard && role !== "admin_poktan") {
    return context.redirect(portalFor(role));
  }
  if (isPetani && role !== "petani") {
    return context.redirect(portalFor(role));
  }

  return next();
});
