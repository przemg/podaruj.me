"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { SurpriseRevealDialog } from "@/components/lists/surprise-reveal-dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function RevealButton({ locale, slug }: { locale: string; slug: string }) {
  const t = useTranslations("lists");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="cursor-pointer border-orange-200 text-orange-700 hover:bg-orange-50"
      >
        <Gift className="h-4 w-4 mr-1.5" />
        {t("revealButton")}
      </Button>
      <SurpriseRevealDialog
        open={open}
        onOpenChange={setOpen}
        locale={locale}
        slug={slug}
        onRevealed={() => router.refresh()}
      />
    </>
  );
}
