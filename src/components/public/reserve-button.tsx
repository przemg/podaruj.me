"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Loader2 } from "lucide-react";
import type { ReservationInfo } from "@/app/[locale]/lists/[slug]/page";
import { reserveItem, cancelReservation } from "@/app/[locale]/lists/[slug]/reservation-actions";
import { GuestReserveDialog } from "@/components/public/guest-reserve-dialog";
import { ReservePopover } from "@/components/public/reserve-popover";

type ReserveButtonProps = {
  itemId: string;
  listSlug: string;
  privacyMode: string;
  reservation: ReservationInfo;
  isAuthenticated: boolean;
  isOwner: boolean;
};

export function ReserveButton({
  itemId,
  listSlug,
  privacyMode,
  reservation,
  isAuthenticated,
  isOwner,
}: ReserveButtonProps) {
  const t = useTranslations("public");
  const [isPending, startTransition] = useTransition();
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);

  // Owner can't reserve their own items — render nothing
  if (isOwner) return null;

  // Pending reservation — show muted badge, no action
  if (reservation.status === "pending") {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-landing-text/[0.04] px-3.5 text-xs font-medium text-landing-text-muted ring-1 ring-landing-text/10">
        <span className="h-1.5 w-1.5 rounded-full bg-landing-text-muted/50" />
        {t("pendingBadge")}
      </span>
    );
  }

  // Reserved by the current user — show "Reserved by you" + cancel button
  if (reservation.status === "reserved" && reservation.isOwnReservation) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-landing-lavender/10 px-3.5 text-xs font-medium text-landing-lavender ring-1 ring-landing-lavender/20">
          <Heart className="h-3.5 w-3.5 fill-landing-lavender" />
          {t("reservedByYou")}
        </span>
        <button
          onClick={() =>
            startTransition(async () => {
              await cancelReservation(listSlug, itemId);
            })
          }
          disabled={isPending}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-landing-text/10 bg-white/60 px-3 text-xs font-medium text-landing-text-muted transition-colors hover:border-landing-coral/20 hover:bg-landing-coral/5 hover:text-landing-coral disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            t("cancelReservation")
          )}
        </button>
      </div>
    );
  }

  // Reserved by someone else — show "Reserved" badge (optionally with name)
  if (reservation.status === "reserved" && !reservation.isOwnReservation) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-landing-text/[0.04] px-3.5 text-xs font-medium text-landing-text-muted ring-1 ring-landing-text/10">
        <Heart className="h-3.5 w-3.5" />
        {reservation.reserverName
          ? `${t("reservedBadge")} · ${reservation.reserverName}`
          : t("reservedBadge")}
      </span>
    );
  }

  // Available — different flows based on auth state + privacy mode
  if (isAuthenticated && privacyMode === "buyers_choice") {
    // Logged-in user + Buyer's Choice → popover for name preference
    return (
      <ReservePopover itemId={itemId} listSlug={listSlug}>
        <button
          disabled={isPending}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/90 px-3.5 text-xs font-medium text-white shadow-sm ring-1 ring-landing-coral/20 transition-colors hover:bg-landing-coral disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Heart className="h-3.5 w-3.5" />
          {t("reserveButton")}
        </button>
      </ReservePopover>
    );
  }

  if (isAuthenticated) {
    // Logged-in user + visible or full_surprise mode → direct reserve
    return (
      <button
        onClick={() =>
          startTransition(async () => {
            await reserveItem(listSlug, itemId, {});
          })
        }
        disabled={isPending}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/90 px-3.5 text-xs font-medium text-white shadow-sm ring-1 ring-landing-coral/20 transition-colors hover:bg-landing-coral disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Heart className="h-3.5 w-3.5" />
        )}
        {t("reserveButton")}
      </button>
    );
  }

  // Guest (not authenticated) → open guest dialog
  return (
    <>
      <button
        onClick={() => setGuestDialogOpen(true)}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/90 px-3.5 text-xs font-medium text-white shadow-sm ring-1 ring-landing-coral/20 transition-colors hover:bg-landing-coral"
      >
        <Heart className="h-3.5 w-3.5" />
        {t("reserveButton")}
      </button>

      <GuestReserveDialog
        itemId={itemId}
        listSlug={listSlug}
        privacyMode={privacyMode}
        open={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
      />
    </>
  );
}
