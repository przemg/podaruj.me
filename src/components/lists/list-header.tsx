"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getCountdown } from "@/lib/countdown";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { deleteList, publishList } from "@/app/[locale]/dashboard/lists/actions";
import {
  Pencil,
  Trash2,
  Share2,
  Check,
  Cake,
  Snowflake,
  Heart,
  Gift,
  HelpCircle,
  Eye,
  EyeOff,
  CalendarDays,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";

type ListData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  occasion: string;
  event_date: string | null;
  privacy_mode: string;
  is_published: boolean;
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

export function ListHeader({ list, locale }: ListHeaderProps) {
  const t = useTranslations("lists.detail");
  const tOccasions = useTranslations("lists.occasions");
  const tPrivacy = useTranslations("lists.privacyModes");
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const isDraft = list.privacy_mode === "full_surprise" && !list.is_published;

  const OccasionIcon = OCCASION_ICONS[list.occasion] ?? Gift;
  const PrivacyIcon = PRIVACY_ICONS[list.privacy_mode] ?? HelpCircle;

  const countdownLabel = list.event_date
    ? (() => {
        const cd = getCountdown(list.event_date);
        return cd.type === "today"
          ? t("today")
          : cd.type === "past"
            ? t("pastEvent")
            : t("daysLeft", { count: cd.days });
      })()
    : null;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteList(locale, list.slug);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await publishList(locale, list.slug);
    setPublishing(false);
    setPublishOpen(false);
    router.refresh();
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

        {/* Badges + share/publish */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isDraft && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              {t("draftBadge")}
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
            <OccasionIcon className="h-3.5 w-3.5 text-landing-coral" />
            {tOccasions(list.occasion)}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-help items-center gap-1.5 rounded-full bg-landing-lavender-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
                  <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
                  {tPrivacy(list.privacy_mode)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-center">
                {list.privacy_mode === "buyers_choice" && t("buyersChoiceHint")}
                {list.privacy_mode === "full_surprise" && t("fullSurpriseHint")}
                {list.privacy_mode === "visible" && tPrivacy("visible_description")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {countdownLabel && (
            <div className="flex items-center gap-1.5 rounded-full bg-landing-mint/10 px-3 py-1 text-xs font-medium text-landing-text">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
              {countdownLabel}
            </div>
          )}

          {isDraft ? (
            <button
              onClick={() => setPublishOpen(true)}
              className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-landing-coral-dark"
            >
              <Upload className="h-3.5 w-3.5" />
              {t("publishButton")}
            </button>
          ) : (
            <button
              onClick={async () => {
                const url = `${window.location.origin}/${locale}/lists/${list.slug}`;
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/10 px-3 py-1 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/20"
            >
              {shareCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {t("shareCopied")}
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  {t("shareButton")}
                </>
              )}
            </button>
          )}
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

      {/* Publish confirmation dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-landing-coral/10">
              <Upload className="h-6 w-6 text-landing-coral" />
            </div>
            <DialogTitle className="text-center text-landing-text">
              {t("confirmPublish")}
            </DialogTitle>
            <DialogDescription className="text-center text-landing-text-muted">
              {t("confirmPublishDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setPublishOpen(false)}
              disabled={publishing}
              className="w-full cursor-pointer border-landing-text/10 sm:w-auto"
            >
              {t("cancelPublish")}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover sm:w-auto"
            >
              {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {publishing ? t("publishing") : t("confirmPublishButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
