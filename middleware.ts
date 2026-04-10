import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretBytes } from "@/server/auth/jwt-secret";
import { SESSION_COOKIE_NAME } from "@/server/auth/session-cookie";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) return true;
  return false;
}

function isProtectedPath(pathname: string) {
  const prefixes = [
    "/dashboard",
    "/transactions",
    "/categories",
    "/reports",
    "/voice",
    "/profile",
    "/settings",
    "/admin",
  ];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function readPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const admin = Boolean(payload.admin);
    if (!sub) return null;
    return { sub, admin };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  const session = token ? await readPayload(token) : null;

  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!session.admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
