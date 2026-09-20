import { defineMiddleware } from "astro:middleware";

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

  const roleCookie = context.cookies.get("sb-user-role")?.value;
  const tokenCookie = context.cookies.get("sb-access-token")?.value;

  // Protect /dashboard routes (Only admin_poktan)
  if (pathname.startsWith("/dashboard")) {
    if (!tokenCookie || roleCookie !== "admin_poktan") {
      return context.redirect("/");
    }
  }

  // Protect /petani routes (Only petani)
  if (pathname.startsWith("/petani")) {
    if (!tokenCookie || roleCookie !== "petani") {
      return context.redirect("/");
    }
  }

  // If already logged in and visiting login page (/), redirect to respective portal
  if (pathname === "/" && tokenCookie && roleCookie) {
    if (roleCookie === "admin_poktan") {
      return context.redirect("/dashboard");
    } else if (roleCookie === "petani") {
      return context.redirect("/petani");
    }
  }

  return next();
});
