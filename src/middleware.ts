import { getAuthSecret } from "@/lib/auth-secret";
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

  const isProtectedDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isProtectedAccountPath = pathname === "/account" || pathname.startsWith("/account/");

  if (!token && (isProtectedDashboardPath || isProtectedAccountPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/account", "/account/:path*"],
};