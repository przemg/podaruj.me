"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { deleteList } from "@/app/[locale]/dashboard/lists/actions";
import {
  Pencil,
  Trash2,
  Share2,
  Cake,
  Snowflake,
  Heart,
  Gift,
  HelpCircle,
  Eye,
  EyeOff,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";

type ListData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  occasion: string;
  event_date: string | null;
  privacy_mode: string;
};

type ListHeaderProps = {
  list: ListData;
  locale: string;
};

const OCCASION_ICONS: Record<string, typeof Cake> = {
  birthday: Cake,
  holiday: Snowflake,
  wedding: Heart,
  other: Gift,
};

const PRIVACY_ICONS: Record<string, typeof Eye> = {
  buyers_choice: HelpCircle,
  visible: Eye,
  full_surprise: EyeOff,
};

function getCountdown(
  eventDate: string,
  t: ReturnType<typeof useTranslations>
) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("today");
  if (diffDays < 0) return t("pastEvent");
  return t("daysLeft", { count: diffDays });
}

export function ListHeader({ list, locale }: ListHeaderProps) {
  const t = useTranslations("lists.detail");
  const tOccasions = useTranslations("lists.occasions");
  const tPrivacy = useTranslations("lists.privacyModes");
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const OccasionIcon = OCCASION_ICONS[list.occasion] ?? Gift;
  const PrivacyIcon = PRIVACY_ICONS[list.privacy_mode] ?? HelpCircle;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteList(locale, list.slug);
  };

  return (
    <div style={{ animation: "fade-in-up 0.4s ease-out" }}>
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-landing-text-muted transition-colors hover:text-landing-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("backToDashboard")}
      </button>

      {/* Header card */}
      <div className="mb-8 rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur-sm ring-1 ring-landing-text/[0.04]">
        {/* Title + actions row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-landing-text md:text-3xl">
              {list.name}
            </h1>
            {list.description && (
              <p className="mt-2 text-[0.95rem] leading-relaxed text-landing-text-muted">
                {list.description}
              </p>
            )}
          </div>

          {/* Actions — top right on desktop */}
          <div className="flex items-center gap-1.5 sm:shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/lists/${list.slug}/edit`)
              }
              className="h-9 cursor-pointer gap-1.5 text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("editButton")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="h-9 cursor-pointer gap-1.5 text-landing-text-muted hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("deleteButton")}
            </Button>
          </div>
        </div>

        {/* Badges + share */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
            <OccasionIcon className="h-3.5 w-3.5 text-landing-coral" />
            {tOccasions(list.occasion)}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-landing-lavender-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
            <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
            {tPrivacy(list.privacy_mode)}
          </div>
          {list.event_date && (
            <div className="flex items-center gap-1.5 rounded-full bg-landing-mint/10 px-3 py-1 text-xs font-medium text-landing-text">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
              {getCountdown(list.event_date, t)}
            </div>
          )}

          {/* Share — pushed right */}
          <div className="ml-auto flex items-center gap-2 text-xs text-landing-text-muted/60">
            <Share2 className="h-3.5 w-3.5" />
            <span>{t("shareComingSoon")}</span>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("confirmDelete")}
        description={t("confirmDeleteDescription")}
        confirmLabel={t("confirmDeleteButton")}
        cancelLabel={t("cancelDelete")}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
