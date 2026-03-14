"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PublicListError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("public");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="px-4 text-center"
        style={{ animation: "fade-in-up 0.4s ease-out" }}
      >
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-landing-coral/50" />
        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("errorTitle")}
        </h1>
        <p className="mb-6 text-landing-text-muted">
          {t("errorDescription")}
        </p>
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t("errorRetry")}
        </Button>
      </div>
    </div>
  );
}
