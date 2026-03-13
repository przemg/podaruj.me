"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

const MAIL_PROVIDERS: Record<string, string> = {
  "gmail.com": "https://mail.google.com",
  "googlemail.com": "https://mail.google.com",
  "outlook.com": "https://outlook.live.com",
  "hotmail.com": "https://outlook.live.com",
  "live.com": "https://outlook.live.com",
  "yahoo.com": "https://mail.yahoo.com",
  "wp.pl": "https://poczta.wp.pl",
  "onet.pl": "https://poczta.onet.pl",
  "interia.pl": "https://poczta.interia.pl",
  "o2.pl": "https://poczta.o2.pl",
  "icloud.com": "https://www.icloud.com/mail",
  "protonmail.com": "https://mail.proton.me",
  "proton.me": "https://mail.proton.me",
};

function getMailUrl(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  return MAIL_PROVIDERS[domain] ?? null;
}

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

  if (status === "success") {
    const mailUrl = getMailUrl(email);

    return (
      <div
        className="text-center"
        style={{ animation: "fade-in-up 0.4s ease-out" }}
      >
        {/* Animated mail icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-landing-mint/20 to-landing-mint/10">
          <Mail className="h-8 w-8 text-landing-mint" />
        </div>

        <h2 className="text-xl font-bold text-landing-text">
          {t("successTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-landing-text-muted">
          {t("successMessage")}
        </p>

        {/* Email pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-landing-peach-wash px-4 py-1.5 text-sm font-medium text-landing-text">
          <Mail className="h-3.5 w-3.5 text-landing-coral" />
          {email}
        </div>

        {/* Open mail button */}
        {mailUrl && (
          <div className="mt-6">
            <a
              href={mailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-landing-coral-dark px-6 py-3 font-semibold text-white transition-all hover:bg-landing-coral-hover hover:shadow-lg"
            >
              {t("openMail")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Cooldown / resend */}
        <div className="mt-5">
          {cooldown > 0 ? (
            <p className="text-sm text-landing-text-muted">
              {t("resendIn", { seconds: cooldown })}
            </p>
          ) : (
            <button
              onClick={() => sendMagicLink(email)}
              className="text-sm font-medium text-landing-coral-dark transition-colors hover:text-landing-coral-hover hover:underline"
            >
              {t("resend")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-landing-text sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-landing-text-muted">{t("subtitle")}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (status !== "loading" && cooldown <= 0) {
            sendMagicLink(email);
          }
        }}
      >
        {/* Email input with icon */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Mail className="h-5 w-5 text-landing-text-muted/40" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            autoFocus
            className="w-full rounded-xl border border-landing-text/10 bg-white py-3.5 pr-5 pl-12 text-landing-text placeholder:text-landing-text-muted/40 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
            style={{ animation: "fade-in-up 0.3s ease-out" }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "loading" || cooldown > 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-landing-coral-dark px-8 py-3.5 font-semibold text-white transition-all hover:bg-landing-coral-hover hover:shadow-lg hover:shadow-landing-coral/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("sending")}
            </>
          ) : (
            t("sendLink")
          )}
        </button>

        {/* Divider with trust note */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-landing-text/5" />
          <div className="flex items-center gap-1.5 text-xs text-landing-text-muted/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("noPassword")}
          </div>
          <div className="h-px flex-1 bg-landing-text/5" />
        </div>
      </form>
    </>
  );
}
