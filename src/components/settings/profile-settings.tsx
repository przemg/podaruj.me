"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateDisplayName, deleteAccount } from "@/app/[locale]/dashboard/settings/actions";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, AlertCircle } from "lucide-react";
import Image from "next/image";

export function ProfileSettings({
  profile,
  email,
  googleEmail,
}: {
  profile: { display_name: string | null; avatar_url: string | null };
  email: string;
  googleEmail: string | null;
}) {
  const t = useTranslations("settings");
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  const initials = (profile.display_name ?? email ?? "?").charAt(0).toUpperCase();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    const result = await updateDisplayName(displayName);
    setIsSaving(false);
    setSaveStatus(result.error ? "error" : "success");
    if (!result.error) {
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [displayName]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    if (result.error) {
      setIsDeleting(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  const handleLinkGoogle = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.linkIdentity({ provider: "google" });
  }, []);

  return (
    <div className="space-y-8">
      {/* Section 1: Profile Info */}
      <section className="rounded-2xl border border-landing-text/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-landing-text">
          {t("profileSection")}
        </h2>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={t("avatarAlt")}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-landing-peach-wash"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-landing-lavender/30 text-2xl font-bold text-landing-text ring-2 ring-landing-peach-wash">
                {initials}
              </div>
            )}
          </div>

          <div className="w-full space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">{t("displayNameLabel")}</Label>
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setSaveStatus("idle");
                  }}
                  placeholder={t("displayNamePlaceholder")}
                  maxLength={50}
                  className="flex-1"
                />
                <Button
                  onClick={handleSave}
                  disabled={isSaving || displayName.trim().length === 0}
                  className="bg-landing-coral text-white hover:bg-landing-coral-dark"
                >
                  {isSaving ? t("saving") : t("saveButton")}
                </Button>
              </div>
              {saveStatus === "success" && (
                <p className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  {t("saveSuccess")}
                </p>
              )}
              {saveStatus === "error" && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {t("saveError")}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                value={email}
                readOnly
                tabIndex={-1}
                className="cursor-not-allowed bg-landing-cream/50 text-landing-text-muted focus-visible:ring-0 focus-visible:border-input"
              />
              <p className="text-xs text-landing-text-muted">{t("emailHelp")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Connected Accounts */}
      <section className="rounded-2xl border border-landing-text/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-landing-text">
          {t("connectedAccountsSection")}
        </h2>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-landing-cream/30 p-4">
          <div className="flex items-center gap-3">
            {/* Google icon */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
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
            <div>
              <p className="text-sm font-medium text-landing-text">Google</p>
              <p className="text-xs text-landing-text-muted">
                {googleEmail
                  ? t("googleConnected", { email: googleEmail })
                  : t("googleNotConnected")}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {googleEmail ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkGoogle}
                className="cursor-pointer"
              >
                {t("linkGoogle")}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Danger Zone */}
      <section className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          {t("dangerZoneSection")}
        </h2>
        <p className="mt-2 text-sm text-red-600/80">
          {t("dangerZoneDescription")}
        </p>
        <div className="mt-4">
          <DeleteAccountDialog onConfirm={handleDelete} isDeleting={isDeleting} />
        </div>
      </section>
    </div>
  );
}
