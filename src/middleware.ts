import { routing } from "@/i18n/routing";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = process.env.COOKIE_NAME ?? "agropulse_token";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/sales",
  "/debts",
  "/expenses",
  "/employees",
  "/tasks",
  "/daily-reports",
] as const;

function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  );
}

function pathnameHasLocale(pathname: string): boolean {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || "/";
}

function getLocaleFromPath(pathname: string): (typeof routing.locales)[number] {
  const match = pathname.match(/^\/(en|ar)(\/|$)/);
  if (match?.[1] === "ar" || match?.[1] === "en") return match[1];
  return routing.defaultLocale;
}

function detectLocale(request: NextRequest): (typeof routing.locales)[number] {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie === "ar" || cookie === "en") return cookie;

  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ar") ? "ar" : "en";
}

function setLocaleCookie(
  response: NextResponse,
  locale: (typeof routing.locales)[number]
) {
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

function isProtectedPath(pathWithoutLocale: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`)
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (pathname === "/") {
    const target = token ? `/${locale}/dashboard` : `/${locale}/login`;
    const response = NextResponse.redirect(new URL(target, request.url));
    setLocaleCookie(response, locale);
    return response;
  }

  // Prevent /login, /dashboard, etc. from being treated as [locale] segments.
  if (!pathnameHasLocale(pathname)) {
    const localized = request.nextUrl.clone();
    localized.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(localized);
    setLocaleCookie(response, locale);
    return response;
  }

  const pathLocale = getLocaleFromPath(pathname);
  const pathWithoutLocale = stripLocale(pathname);

  if (pathWithoutLocale === "/login" && token) {
    return NextResponse.redirect(new URL(`/${pathLocale}/dashboard`, request.url));
  }

  if (isProtectedPath(pathWithoutLocale) && !token) {
    const loginUrl = new URL(`/${pathLocale}/login`, request.url);
    loginUrl.searchParams.set("from", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(ar|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
