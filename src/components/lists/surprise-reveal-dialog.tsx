"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { revealSurprise } from "@/app/[locale]/dashboard/lists/actions";

type SurpriseRevealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  slug: string;
  onRevealed: () => void;
};

export function SurpriseRevealDialog({
  open,
  onOpenChange,
  locale,
  slug,
  onRevealed,
}: SurpriseRevealDialogProps) {
  const t = useTranslations("lists.surpriseReveal");
  const [loading, setLoading] = useState(false);

  const handleReveal = async () => {
    setLoading(true);
    const result = await revealSurprise(locale, slug);
    setLoading(false);
    if (!result.error) {
      onRevealed();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Gift className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full cursor-pointer border-landing-text/10 sm:w-auto"
          >
            {t("notYet")}
          </Button>
          <Button
            onClick={handleReveal}
            disabled={loading}
            className="w-full cursor-pointer bg-orange-600 text-white hover:bg-orange-700 sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("reveal")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
