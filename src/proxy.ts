import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATHS = ["/dashboard"];

export async function proxy(request: NextRequest) {
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

  // Slug history redirect for public list pages — redirect old slugs before page renders
  const listMatch = pathWithoutLocale.match(/^\/lists\/([^/]+)$/);
  if (listMatch) {
    const slug = listMatch[1];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const serviceClient = createClient(url, key);
      // Check if this slug exists as a current list
      const { data: currentList } = await serviceClient
        .from("lists")
        .select("id")
        .eq("slug", slug)
        .single();

      // Only check history if list not found by current slug
      if (!currentList) {
        const { data: historyEntry } = await serviceClient
          .from("list_slug_history")
          .select("list_id, lists:list_id(slug)")
          .eq("slug", slug)
          .single();

        if (historyEntry?.lists && typeof historyEntry.lists === "object" && "slug" in historyEntry.lists) {
          const locale = pathname.match(/^\/(en|pl)/)?.[1] || routing.defaultLocale;
          const newUrl = new URL(`/${locale}/lists/${(historyEntry.lists as { slug: string }).slug}`, request.url);
          return applyCookies(NextResponse.redirect(newUrl));
        }
      }
    }
  }

  // Delegate to next-intl
  const response = intlMiddleware(request);
  return applyCookies(response);
}

export const config = {
  matcher: ["/", "/(en|pl)/:path*"],
};
