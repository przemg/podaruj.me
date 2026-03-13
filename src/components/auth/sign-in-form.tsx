"use client";

import { useState, useEffect, useRef } from "react";
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getCallbackError(
  errorCode: string | null,
  t: (key: string) => string
): string {
  if (!errorCode) return "";
  switch (errorCode) {
    case "expired":
      return t("errorExpired");
    case "invalid":
      return t("errorInvalid");
    default:
      return t("errorGeneric");
  }
}

export function SignInForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.signIn");
  const searchParams = useSearchParams();
  const errorFromCallback = searchParams.get("error");
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam ?? "");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(errorFromCallback ? "error" : "idle");
  const [errorMessage, setErrorMessage] = useState(
    getCallbackError(errorFromCallback, t)
  );
  const [cooldown, setCooldown] = useState(0);
  const hasAutoSubmitted = useRef(false);

  const formRef = useRef<HTMLFormElement>(null);

  async function sendMagicLink(targetEmail: string) {
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
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    const next = searchParams.get("next");
    const callbackUrl = new URL(
      `/${locale}/auth/callback`,
      window.location.origin
    );
    if (next) callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(t("errorGeneric"));
    }
  }

  // Auto-submit from hero email param via form submit (avoids setState in effect)
  useEffect(() => {
    if (emailParam && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      formRef.current?.requestSubmit();
    }
  }, [emailParam]);

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

      {/* Google sign-in button */}
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-landing-text/10 bg-white px-8 py-3.5 font-semibold text-landing-text shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
      >
        <GoogleIcon className="h-5 w-5" />
        {t("googleButton")}
      </button>

      {/* Separator */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-landing-text/10" />
        <span className="text-sm text-landing-text-muted">
          {t("orContinueWithEmail")}
        </span>
        <div className="h-px flex-1 bg-landing-text/10" />
      </div>

      {/* Error message (show above form, covers both Google and magic link errors) */}
      {errorMessage && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
          style={{ animation: "fade-in-up 0.3s ease-out" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        ref={formRef}
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
            className="w-full rounded-xl border border-landing-text/10 bg-white py-3.5 pr-5 pl-12 text-landing-text placeholder:text-landing-text-muted/40 focus:border-landing-coral focus:ring-2 focus:ring-landing-coral/20 focus:outline-none"
          />
        </div>

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
