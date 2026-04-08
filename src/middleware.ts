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

  console.log("Middleware: pathname:", pathname);
  console.log("Middleware: token found:", !!token);
  if (token) {
    console.log("Middleware: token.sub:", token.sub);
  }

  const isProtectedEditorPath = pathname === "/editor" || pathname.startsWith("/editor/");
  const isProtectedDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (!token && (isProtectedDashboardPath || isProtectedEditorPath)) {
    console.log("Middleware: redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/editor", "/editor/:path*"],
};