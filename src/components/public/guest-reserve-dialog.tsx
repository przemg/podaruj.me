"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Loader2, CheckCircle2, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { reserveItemAsGuest } from "@/app/[locale]/lists/[slug]/reservation-actions";

type GuestReserveDialogProps = {
  itemId: string;
  listSlug: string;
  privacyMode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GuestReserveDialog({
  itemId,
  listSlug,
  privacyMode,
  open,
  onOpenChange,
}: GuestReserveDialogProps) {
  const t = useTranslations("public");
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [showName, setShowName] = useState(true);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    // Reset state when closing
    if (!next) {
      setNickname("");
      setEmail("");
      setShowName(true);
      setSuccessEmail(null);
      setError(null);
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await reserveItemAsGuest(listSlug, itemId, {
        nickname: nickname.trim(),
        email: email.trim(),
        showName,
        locale,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessEmail(email.trim());
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-landing-text">
            <Heart className="h-4 w-4 text-landing-coral" />
            {t("guestDialog.title")}
          </DialogTitle>
        </DialogHeader>

        {successEmail ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-landing-coral/10">
              <CheckCircle2 className="h-6 w-6 text-landing-coral" />
            </div>
            <div>
              <p className="font-semibold text-landing-text">
                {t("guestDialog.successTitle")}
              </p>
              <p className="mt-1 text-sm text-landing-text-muted">
                {t("guestDialog.successMessage", { email: successEmail })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="mt-2"
            >
              {t("cancelReservation") === "Cancel" ? "Close" : "Zamknij"}
            </Button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogDescription className="sr-only">
              {t("guestDialog.title")}
            </DialogDescription>

            {/* Nickname */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-nickname" className="text-sm font-medium text-landing-text">
                {t("guestDialog.nicknameLabel")}
              </Label>
              <Input
                id="guest-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("guestDialog.nicknamePlaceholder")}
                maxLength={50}
                required
                disabled={isPending}
                className="border-landing-text/10 focus-visible:border-landing-coral/40 focus-visible:ring-landing-coral/20"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest-email" className="text-sm font-medium text-landing-text">
                {t("guestDialog.emailLabel")}
              </Label>
              <Input
                id="guest-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("guestDialog.emailPlaceholder")}
                required
                disabled={isPending}
                className="border-landing-text/10 focus-visible:border-landing-coral/40 focus-visible:ring-landing-coral/20"
              />
              <p className="text-xs text-landing-text-muted">
                {t("guestDialog.emailHelp")}
              </p>
            </div>

            {/* Show name toggle — only in Buyer's Choice mode */}
            {privacyMode === "buyers_choice" && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-landing-text/[0.02] px-3 py-2.5 ring-1 ring-landing-text/[0.06]">
                <Label
                  htmlFor="guest-show-name"
                  className="cursor-pointer text-sm text-landing-text"
                >
                  {t("showNameToggle")}
                </Label>
                <Switch
                  id="guest-show-name"
                  checked={showName}
                  onCheckedChange={setShowName}
                  disabled={isPending}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-landing-text/10"
              >
                {t("cancelReservation")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !nickname.trim() || !email.trim()}
                className="bg-landing-coral text-white hover:bg-landing-coral-dark"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    {t("guestDialog.submitting")}
                  </>
                ) : (
                  t("guestDialog.submitButton")
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
