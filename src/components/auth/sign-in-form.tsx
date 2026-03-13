"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signIn");
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const hasAutoSubmitted = useRef(false);

  // Handle error from callback redirect
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setStatus("error");
      switch (error) {
        case "expired":
          setErrorMessage(t("errorExpired"));
          break;
        case "invalid":
          setErrorMessage(t("errorInvalid"));
          break;
        default:
          setErrorMessage(t("errorGeneric"));
      }
    }
  }, [searchParams, t]);

  const sendMagicLink = useCallback(
    async (targetEmail: string) => {
      if (!targetEmail) return;

      setStatus("loading");
      setErrorMessage("");

      // Forward ?next param so callback can redirect back
      const next = searchParams.get("next");
      const callbackUrl = new URL(
        `/${locale}/auth/callback`,
        window.location.origin
      );
      if (next) callbackUrl.searchParams.set("next", next);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setStatus("error");
        if (error.message?.includes("rate") || error.status === 429) {
          setErrorMessage(t("errorRateLimit"));
        } else {
          setErrorMessage(t("errorGeneric"));
        }
        return;
      }

      setStatus("success");
      setCooldown(60);
    },
    [locale, searchParams, t]
  );

  // Auto-fill and auto-submit from hero email param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam && !hasAutoSubmitted.current) {
      setEmail(emailParam);
      hasAutoSubmitted.current = true;
      sendMagicLink(emailParam);
    }
  }, [searchParams, sendMagicLink]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className="w-full max-w-md">
      {status === "success" ? (
        <div className="rounded-2xl border border-landing-mint/20 bg-landing-mint/10 p-6 text-center">
          <p className="text-lg font-medium text-landing-text">
            {t("successTitle")}
          </p>
          <p className="mt-2 text-landing-text-muted">
            {t("successMessage")}
          </p>
          {cooldown > 0 ? (
            <p className="mt-4 text-sm text-landing-text-muted">
              {t("resendIn", { seconds: cooldown })}
            </p>
          ) : (
            <button
              onClick={() => sendMagicLink(email)}
              className="mt-4 text-sm font-medium text-landing-coral-dark hover:underline"
            >
              {t("resend")}
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (status !== "loading" && cooldown <= 0) {
              sendMagicLink(email);
            }
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            autoFocus
            className="w-full rounded-xl border border-landing-text/10 bg-white px-5 py-3.5 text-landing-text placeholder:text-landing-text-muted/50 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none"
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || cooldown > 0}
            className="mt-4 w-full rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:bg-landing-coral-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? t("sending") : t("sendLink")}
          </button>
        </form>
      )}
    </div>
  );
}
