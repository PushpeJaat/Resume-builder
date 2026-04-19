import { getAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isProtectedDashboardPath =
    (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
    pathname !== "/dashboard/templates";
  const isProtectedAccountPath = pathname === "/account" || pathname.startsWith("/account/");
  const isProtectedAdminPath =
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/admin/dashboard/") ||
    pathname === "/admin/extracted-resumes" ||
    pathname.startsWith("/admin/extracted-resumes/");

  if (!token && (isProtectedDashboardPath || isProtectedAccountPath || isProtectedAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = isProtectedAdminPath ? "/admin" : "/login";
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (isProtectedAdminPath) {
    const tokenEmail = typeof token?.email === "string" ? token.email : null;
    if (!isAdminEmail(tokenEmail)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("forbidden", "1");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
    "/admin/dashboard",
    "/admin/dashboard/:path*",
    "/admin/extracted-resumes",
    "/admin/extracted-resumes/:path*",
  ],
};