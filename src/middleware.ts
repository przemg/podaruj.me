// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATHS = ["/dashboard", "/my-lists"];

export async function middleware(request: NextRequest) {
  const { supabase, applyCookies } = createMiddlewareClient(request);

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check protected routes
  const pathname = request.nextUrl.pathname;
  const pathWithoutLocale = pathname.replace(/^\/(en|pl)/, "") || "/";

  if (PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p)) && !user) {
    const locale =
      pathname.match(/^\/(en|pl)/)?.[1] || routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
    signInUrl.searchParams.set("next", pathname);
    return applyCookies(NextResponse.redirect(signInUrl));
  }

  // Delegate to next-intl
  const response = intlMiddleware(request);
  return applyCookies(response);
}

export const config = {
  matcher: ["/", "/(en|pl)/:path*"],
};
