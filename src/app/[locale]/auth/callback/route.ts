import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Extract locale from URL path
  const locale = request.url.match(/\/(en|pl)\//)?.[1] || "en";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectPath =
        next.startsWith("/en") || next.startsWith("/pl")
          ? next
          : `/${locale}${next}`;
      return NextResponse.redirect(new URL(redirectPath, origin));
    }

    // Map Supabase error to user-friendly code
    let errorCode = "unknown";
    if (error.message?.includes("expired")) errorCode = "expired";
    else if (
      error.message?.includes("invalid") ||
      error.message?.includes("used")
    )
      errorCode = "invalid";

    return NextResponse.redirect(
      new URL(`/${locale}/auth/sign-in?error=${errorCode}`, origin)
    );
  }

  // No code provided
  return NextResponse.redirect(
    new URL(`/${locale}/auth/sign-in?error=invalid`, origin)
  );
}
