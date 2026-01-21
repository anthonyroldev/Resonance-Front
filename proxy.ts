import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/library", "/profile"];

const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("AUTH_TOKEN")?.value;
  const { pathname } = request.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // If no token, redirect to login
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
