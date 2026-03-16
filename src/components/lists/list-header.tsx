"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getCountdown, isListClosed } from "@/lib/countdown";
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
import { CloseListDialog } from "./close-list-dialog";
import { AnimatedCountdown } from "./animated-countdown";
import { closeList, reopenList, deleteList, publishList } from "@/app/[locale]/dashboard/lists/actions";
import { SharePopover } from "./share-popover";
import {
  Pencil,
  Trash2,
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
  Archive,
  ArchiveRestore,
} from "lucide-react";

type ListData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  occasion: string;
  event_date: string | null;
  event_time: string | null;
  privacy_mode: string;
  is_published: boolean;
  is_closed: boolean;
  closed_at: string | null;
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
  const tLists = useTranslations("lists");
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);

  const isDraft = list.privacy_mode === "full_surprise" && !list.is_published;

  const isClosed = isListClosed({ is_closed: list.is_closed, event_date: list.event_date, event_time: list.event_time });
  const isManuallyClosable = !isClosed && (list.privacy_mode !== "full_surprise" || list.is_published);
  const canReopen = list.is_closed;
  const eventDatePassed = list.event_date
    ? isListClosed({ is_closed: false, event_date: list.event_date, event_time: list.event_time })
    : false;

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

  const handleClose = async () => {
    setCloseLoading(true);
    const result = await closeList(locale, list.slug);
    setCloseLoading(false);
    if (!result.error) setCloseOpen(false);
  };

  const handleReopen = async () => {
    setCloseLoading(true);
    await reopenList(locale, list.slug);
    setCloseLoading(false);
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
        {/* Badges — top of card */}
        {(() => {
          const privacyHintText =
            list.privacy_mode === "buyers_choice" ? t("buyersChoiceHint")
            : list.privacy_mode === "full_surprise" ? t("fullSurpriseHint")
            : tPrivacy("visible_description");
          return (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {isDraft && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {t("draftBadge")}
                </div>
              )}
              {isClosed && (
                <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  <Archive className="h-3 w-3" />
                  {tLists("closedBadge")}
                </div>
              )}
              <div className="flex items-center gap-1.5 rounded-full bg-landing-peach-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
                <OccasionIcon className="h-3.5 w-3.5 text-landing-coral" />
                {tOccasions(list.occasion)}
              </div>
              {/* Privacy badge — desktop: inline pill with tooltip */}
              <div className="hidden sm:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-1.5 rounded-full bg-landing-lavender-wash/80 px-3 py-1 text-xs font-medium text-landing-text">
                        <PrivacyIcon className="h-3.5 w-3.5 text-landing-lavender" />
                        {tPrivacy(list.privacy_mode)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                      {privacyHintText}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {countdownLabel && (
                <div className="flex items-center gap-1.5 rounded-full bg-landing-mint/10 px-3 py-1 text-xs font-medium text-landing-text">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                  {countdownLabel}
                </div>
              )}
              {/* Privacy badge — mobile: card with description, placed last */}
              <div className="flex w-full items-start gap-2.5 rounded-xl bg-landing-lavender-wash/50 px-3 py-2 ring-1 ring-landing-lavender/10 sm:hidden">
                <PrivacyIcon className="mt-[5px] h-4 w-4 shrink-0 text-landing-lavender" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-landing-text">{tPrivacy(list.privacy_mode)}</span>
                  <p className="mt-0.5 text-[11px] leading-snug text-landing-text-muted">
                    {privacyHintText}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Title + description */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-landing-text md:text-3xl">
            {list.name}
          </h1>
          {list.description && (
            <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-landing-text-muted">
              {list.description}
            </p>
          )}
        </div>

        {/* Actions row */}
        <div className="mt-4 border-t border-landing-text/[0.06] pt-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
            {!isDraft && (
              <div className="col-span-2 sm:col-span-1">
                <SharePopover list={list} locale={locale} />
              </div>
            )}
            {isDraft && (
              <button
                onClick={() => setPublishOpen(true)}
                className="col-span-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-landing-coral px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-landing-coral-dark sm:col-span-1 sm:justify-start"
              >
                <Upload className="h-3.5 w-3.5" />
                {t("publishButton")}
              </button>
            )}
            {isManuallyClosable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCloseOpen(true)}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-orange-50 hover:text-orange-600 sm:w-auto sm:justify-start"
              >
                <Archive className="h-3.5 w-3.5" />
                {tLists("close")}
              </Button>
            )}
            {canReopen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReopen}
                disabled={closeLoading}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-emerald-50 hover:text-emerald-600 sm:w-auto sm:justify-start"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
                {tLists("reopen")}
              </Button>
            )}
            {!isClosed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/lists/${list.slug}/edit`)}
                className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-landing-peach-wash hover:text-landing-text sm:w-auto sm:justify-start"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("editButton")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="h-9 w-full cursor-pointer justify-center gap-1.5 text-landing-text-muted hover:bg-red-50 hover:text-red-500 sm:w-auto sm:justify-start"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("deleteButton")}
            </Button>
          </div>
        </div>

        {canReopen && eventDatePassed && (
          <p className="mt-3 text-xs text-landing-text-muted">
            {t("eventPassedNote")}
          </p>
        )}
      </div>

      {list.event_date && !isClosed && (
        <div className="mb-8">
          <AnimatedCountdown eventDate={list.event_date} eventTime={list.event_time} />
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={tLists("deleteDialog.title")}
        description={tLists("deleteDialog.descriptionWithClose")}
        confirmLabel={tLists("deleteDialog.deletePermanently")}
        cancelLabel={tLists("deleteDialog.cancel")}
        onConfirm={handleDelete}
        loading={deleting}
        showCloseOption={!isClosed}
        closeLabel={tLists("deleteDialog.closeInstead")}
        onClose={async () => {
          setCloseLoading(true);
          const result = await closeList(locale, list.slug);
          setCloseLoading(false);
          if (!result.error) setDeleteOpen(false);
        }}
        closeLoading={closeLoading}
      />

      <CloseListDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        onConfirm={handleClose}
        loading={closeLoading}
        title={tLists("closeDialog.title")}
        description={tLists("closeDialog.description")}
        confirmLabel={tLists("closeDialog.confirm")}
        cancelLabel={tLists("closeDialog.cancel")}
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
