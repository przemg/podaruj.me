import { Link } from "@/i18n/navigation";
import { Gift } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PublicListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("public");

  return (
    <div className="min-h-dvh bg-gradient-to-b from-landing-cream via-landing-cream to-landing-peach-wash/30">
      <header className="border-b border-landing-text/5 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-landing-text"
          >
            <Gift className="h-6 w-6 text-landing-coral" />
            <span>Podaruj.me</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-landing-text/5 bg-white/40">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-landing-text-muted transition-colors hover:text-landing-coral"
          >
            <Gift className="h-3.5 w-3.5" />
            {t("poweredBy")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
