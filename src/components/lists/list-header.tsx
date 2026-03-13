"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
} from "lucide-react";

type ListData = {
  id: string;
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

function getCountdown(eventDate: string, t: ReturnType<typeof useTranslations>) {
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
  const [shareTooltip, setShareTooltip] = useState(false);

  const OccasionIcon = OCCASION_ICONS[list.occasion] ?? Gift;
  const PrivacyIcon = PRIVACY_ICONS[list.privacy_mode] ?? HelpCircle;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteList(locale, list.id);
    // Server Action redirects on success
  };

  return (
    <div
      className="mb-8 space-y-4"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-2 inline-flex cursor-pointer items-center gap-1 text-sm text-landing-text-muted transition-colors hover:text-landing-text"
      >
        ← {t("backToDashboard")}
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-landing-text md:text-3xl">
        {list.name}
      </h1>

      {/* Description */}
      {list.description && (
        <p className="text-landing-text-muted">{list.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 bg-landing-peach-wash text-landing-text"
        >
          <OccasionIcon className="h-3.5 w-3.5" />
          {tOccasions(list.occasion)}
        </Badge>
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 bg-landing-lavender-wash text-landing-text"
        >
          <PrivacyIcon className="h-3.5 w-3.5" />
          {tPrivacy(list.privacy_mode)}
        </Badge>
        {list.event_date && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 bg-landing-mint/20 text-landing-text"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {getCountdown(list.event_date, t)}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/lists/${list.id}/edit`)}
          className="cursor-pointer border-landing-text/10 hover:bg-landing-peach-wash"
        >
          <Pencil className="mr-1.5 h-4 w-4" />
          {t("editButton")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="cursor-pointer border-landing-text/10 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          {t("deleteButton")}
        </Button>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            disabled
            onClick={() => setShareTooltip(!shareTooltip)}
            onMouseEnter={() => setShareTooltip(true)}
            onMouseLeave={() => setShareTooltip(false)}
            className="border-landing-text/10 opacity-50"
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            {t("shareButton")}
          </Button>
          {shareTooltip && (
            <div className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-landing-text px-3 py-1.5 text-xs text-white shadow-lg">
              {t("shareComingSoon")}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("confirmDelete")}
        description={t("confirmDeleteDescription")}
        confirmLabel={
          deleting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("confirmDeleteButton")}
            </span>
          ) : (
            t("confirmDeleteButton")
          ) as unknown as string
        }
        cancelLabel={t("cancelDelete")}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
