import { getAuthSecret } from "@/lib/auth-secret";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  console.log("Middleware: pathname:", pathname);
  console.log("Middleware: token found:", !!token);
  if (token) {
    console.log("Middleware: token.sub:", token.sub);
  }

  const isProtectedEditorPath = pathname.startsWith("/editor/");
  const isProtectedDashboardPath = pathname.startsWith("/dashboard");

  if (!token && (isProtectedDashboardPath || isProtectedEditorPath)) {
    console.log("Middleware: redirecting to login");
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
};