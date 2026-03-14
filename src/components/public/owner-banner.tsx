"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { X, ArrowRight } from "lucide-react";

type OwnerBannerProps = {
  listSlug: string;
};

export function OwnerBanner({ listSlug }: OwnerBannerProps) {
  const t = useTranslations("public");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border-b border-landing-lavender/20 bg-landing-lavender-wash/60">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
        <p className="flex-1 text-sm text-landing-text">
          {t("ownerBanner")}
          {" — "}
          <Link
            href={`/dashboard/lists/${listSlug}`}
            className="inline-flex items-center gap-1 font-medium text-landing-lavender-hover underline-offset-2 hover:underline"
          >
            {t("ownerBannerLink")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-landing-text-muted transition-colors hover:bg-landing-text/5 hover:text-landing-text"
          aria-label={t("ownerBannerDismiss")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
