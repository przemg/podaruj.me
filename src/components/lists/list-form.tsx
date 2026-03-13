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
  Cake,
  Snowflake,
  Heart,
  Gift,
  HelpCircle,
  Eye,
  EyeOff,
  Loader2,
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const data: ListFormData = {
        name,
        description: description || undefined,
        occasion: occasion as ListFormData["occasion"],
        eventDate: eventDate || undefined,
        privacyMode: privacyMode as ListFormData["privacyMode"],
      };

      const result =
        mode === "create"
          ? await createList(locale, data)
          : await updateList(locale, listId!, data);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // On success, the Server Action redirects — no need to handle here
    },
    [name, description, occasion, eventDate, privacyMode, mode, locale, listId]
  );

  const occasions = ["birthday", "holiday", "wedding", "other"] as const;
  const privacyModes = ["buyers_choice", "visible", "full_surprise"] as const;

  return (
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
          className="space-y-3"
        >
          {privacyModes.map((pm) => {
            const Icon = PRIVACY_ICONS[pm];
            return (
              <label
                key={pm}
                htmlFor={`privacy-${pm}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 ${
                  privacyMode === pm
                    ? "border-landing-coral/30 bg-landing-coral/5 shadow-sm"
                    : "border-landing-text/10 bg-white hover:border-landing-text/20"
                }`}
              >
                <RadioGroupItem
                  value={pm}
                  id={`privacy-${pm}`}
                  className="mt-0.5 border-landing-text/20 text-landing-coral"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-landing-text-muted" />
                    <span className="font-medium text-landing-text">
                      {tPrivacy(pm)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-landing-text-muted">
                    {tPrivacy(`${pm}_description`)}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
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
  );
}
