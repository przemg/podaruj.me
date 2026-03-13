import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, SearchX } from "lucide-react";

export default async function ListNotFound() {
  const t = await getTranslations("lists.notFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-landing-cream via-landing-cream to-landing-peach-wash">
      <div
        className="px-4 text-center"
        style={{ animation: "fade-in-up 0.4s ease-out" }}
      >
        <SearchX className="mx-auto mb-4 h-16 w-16 text-landing-text-muted" />
        <h1 className="mb-2 text-2xl font-bold text-landing-text">
          {t("title")}
        </h1>
        <p className="mb-6 text-landing-text-muted">{t("description")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-landing-coral transition-colors hover:text-landing-coral-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
