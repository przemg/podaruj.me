"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { reserveItem } from "@/app/[locale]/lists/[slug]/reservation-actions";

type ReservePopoverProps = {
  itemId: string;
  listSlug: string;
  children: React.ReactNode;
};

export function ReservePopover({
  itemId,
  listSlug,
  children,
}: ReservePopoverProps) {
  const t = useTranslations("public");
  const [open, setOpen] = useState(false);
  const [showName, setShowName] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await reserveItem(listSlug, itemId, { showName });
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-64 rounded-2xl border-landing-text/8 bg-white/95 p-4 shadow-lg backdrop-blur-sm"
      >
        <div className="flex flex-col gap-3">
          {/* Show name toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="popover-show-name"
              className="cursor-pointer text-sm leading-snug text-landing-text"
            >
              {t("showNameToggle")}
            </Label>
            <Switch
              id="popover-show-name"
              checked={showName}
              onCheckedChange={setShowName}
              disabled={isPending}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          )}

          {/* Confirm button */}
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full bg-landing-coral text-white hover:bg-landing-coral-dark"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t("guestDialog.submitting")}
              </>
            ) : (
              t("reserveConfirm")
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
