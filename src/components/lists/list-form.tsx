"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cake,
  Snowflake,
  Heart,
  Gift,
  HelpCircle,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  createList,
  updateList,
  type ListFormData,
} from "@/app/[locale]/dashboard/lists/actions";

type ListFormProps = {
  mode: "create" | "edit";
  locale: string;
  listId?: string;
  defaultValues?: {
    name: string;
    description: string;
    occasion: string;
    eventDate: string;
    privacyMode: string;
  };
};

const OCCASION_ICONS = {
  birthday: Cake,
  holiday: Snowflake,
  wedding: Heart,
  other: Gift,
} as const;

const PRIVACY_ICONS = {
  buyers_choice: HelpCircle,
  visible: Eye,
  full_surprise: EyeOff,
} as const;

const PRIVACY_COLOR_MAP = {
  buyers_choice: {
    iconBg: "bg-landing-lavender/15",
    iconColor: "text-landing-lavender",
    selectedBorder: "border-landing-lavender/40",
    selectedBg: "bg-landing-lavender-wash",
    ring: "ring-landing-lavender/20",
  },
  visible: {
    iconBg: "bg-landing-mint/15",
    iconColor: "text-emerald-600",
    selectedBorder: "border-landing-mint/50",
    selectedBg: "bg-landing-mint/5",
    ring: "ring-landing-mint/20",
  },
  full_surprise: {
    iconBg: "bg-landing-coral/10",
    iconColor: "text-landing-coral",
    selectedBorder: "border-landing-coral/30",
    selectedBg: "bg-landing-peach-wash",
    ring: "ring-landing-coral/20",
  },
} as const;

export function ListForm({
  mode,
  locale,
  listId,
  defaultValues,
}: ListFormProps) {
  const tCreate = useTranslations("lists.create");
  const tEdit = useTranslations("lists.edit");
  const tOccasions = useTranslations("lists.occasions");
  const tPrivacy = useTranslations("lists.privacyModes");
  const router = useRouter();

  const t = mode === "create" ? tCreate : tEdit;

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [occasion, setOccasion] = useState(
    defaultValues?.occasion ?? "birthday"
  );
  const [eventDate, setEventDate] = useState(defaultValues?.eventDate ?? "");
  const [privacyMode, setPrivacyMode] = useState(
    defaultValues?.privacyMode ?? "buyers_choice"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSurpriseWarning, setShowSurpriseWarning] = useState(false);
  const isFullSurpriseLocked =
    mode === "edit" && defaultValues?.privacyMode === "full_surprise";

  const submitForm = useCallback(
    async (overridePrivacy?: string) => {
      setLoading(true);
      setError(null);

      const data: ListFormData = {
        name,
        description: description || undefined,
        occasion: occasion as ListFormData["occasion"],
        eventDate: eventDate || undefined,
        privacyMode: (overridePrivacy ?? privacyMode) as ListFormData["privacyMode"],
      };

      const result =
        mode === "create"
          ? await createList(locale, data)
          : await updateList(locale, listId!, data);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    },
    [name, description, occasion, eventDate, privacyMode, mode, locale, listId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const isChangingToSurprise =
        privacyMode === "full_surprise" &&
        defaultValues?.privacyMode !== "full_surprise";
      if (isChangingToSurprise) {
        setShowSurpriseWarning(true);
        return;
      }

      await submitForm();
    },
    [mode, privacyMode, submitForm]
  );

  const handleConfirmSurprise = useCallback(async () => {
    setShowSurpriseWarning(false);
    await submitForm("full_surprise");
  }, [submitForm]);

  const occasions = ["birthday", "holiday", "wedding", "other"] as const;
  const privacyModes = ["buyers_choice", "visible", "full_surprise"] as const;

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-landing-text/5 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
      style={{ animation: "fade-in-up 0.4s ease-out" }}
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-landing-text font-medium">
          {tCreate("nameLabel")} <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tCreate("namePlaceholder")}
          maxLength={100}
          required
          className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-landing-text font-medium">
          {tCreate("descriptionLabel")}
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={tCreate("descriptionPlaceholder")}
          maxLength={500}
          rows={3}
          className="resize-none border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
        />
      </div>

      {/* Occasion */}
      <div className="space-y-2">
        <Label htmlFor="occasion" className="text-landing-text font-medium">
          {tCreate("occasionLabel")}
        </Label>
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger
            id="occasion"
            className="border-landing-text/10 focus:ring-landing-coral/20"
          >
            <SelectValue placeholder={tCreate("occasionPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {occasions.map((occ) => {
              const Icon = OCCASION_ICONS[occ];
              return (
                <SelectItem key={occ} value={occ}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-landing-text-muted" />
                    {tOccasions(occ)}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Event Date */}
      <div className="space-y-2">
        <Label htmlFor="eventDate" className="text-landing-text font-medium">
          {tCreate("eventDateLabel")}
        </Label>
        <Input
          id="eventDate"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
        />
        <p className="text-xs text-landing-text-muted">
          {tCreate("eventDateHint")}
        </p>
      </div>

      {/* Privacy Mode */}
      <div className="space-y-3">
        <Label className="text-landing-text font-medium">
          {tCreate("privacyModeLabel")}
        </Label>
        <RadioGroup
          value={privacyMode}
          onValueChange={setPrivacyMode}
          className="grid gap-3"
          disabled={isFullSurpriseLocked}
        >
          {privacyModes.map((pm) => {
            const Icon = PRIVACY_ICONS[pm];
            const isSelected = privacyMode === pm;
            const colors = PRIVACY_COLOR_MAP[pm];

            return (
              <label
                key={pm}
                htmlFor={`privacy-${pm}`}
                className={`group relative flex ${isFullSurpriseLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"} items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 ${
                  isSelected
                    ? `${colors.selectedBorder} ${colors.selectedBg} shadow-sm ring-2 ${colors.ring}`
                    : "border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <RadioGroupItem
                  value={pm}
                  id={`privacy-${pm}`}
                  className="sr-only"
                />

                {/* Icon circle */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 ${colors.iconBg} ${
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-landing-text text-[0.95rem] leading-tight">
                    {tPrivacy(pm)}
                  </span>
                  <p className="mt-0.5 text-sm text-landing-text-muted leading-snug">
                    {tPrivacy(`${pm}_description`)}
                  </p>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}
                  >
                    <svg
                      className={`h-3.5 w-3.5 ${colors.iconColor}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </RadioGroup>
        {privacyMode === "full_surprise" && defaultValues?.privacyMode !== "full_surprise" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">
              {tCreate("fullSurpriseWarning")}
            </p>
          </div>
        )}
        {isFullSurpriseLocked && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">
              {tEdit("fullSurpriseLocked")}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="cursor-pointer bg-landing-coral-dark px-6 text-white hover:bg-landing-coral-hover"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading
            ? mode === "create"
              ? tCreate("creating")
              : tEdit("saving")
            : t("submitButton")}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/lists/${listId}`)}
            className="cursor-pointer border-landing-text/10"
          >
            {tEdit("cancel")}
          </Button>
        )}
      </div>
    </form>

    <Dialog open={showSurpriseWarning} onOpenChange={setShowSurpriseWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-landing-text">
            {tCreate("fullSurpriseWarning")}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => setShowSurpriseWarning(false)}
            className="w-full cursor-pointer border-landing-text/10 sm:w-auto"
          >
            {tCreate("fullSurpriseCancel")}
          </Button>
          <Button
            onClick={handleConfirmSurprise}
            disabled={loading}
            className="w-full cursor-pointer bg-landing-coral-dark text-white hover:bg-landing-coral-hover sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCreate("fullSurpriseConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
