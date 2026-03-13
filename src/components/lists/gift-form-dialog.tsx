"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import {
  createItem,
  updateItem,
  type ItemFormData,
} from "@/app/[locale]/dashboard/lists/actions";

type EditItemData = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  image_url: string | null;
  priority: string;
};

type GiftFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  locale: string;
  editItem?: EditItemData;
};

const PRIORITIES = ["nice_to_have", "would_love", "must_have"] as const;

const PRIORITY_COLORS: Record<string, string> = {
  nice_to_have: "border-gray-200 bg-gray-50",
  would_love: "border-landing-lavender/30 bg-landing-lavender-wash",
  must_have: "border-landing-coral/30 bg-landing-coral/5",
};

export function GiftFormDialog({
  open,
  onOpenChange,
  listId,
  locale,
  editItem,
}: GiftFormDialogProps) {
  const t = useTranslations("items.form");
  const tPriority = useTranslations("items.priority");
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState<string>("nice_to_have");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageValid, setImageValid] = useState(false);

  // Reset form when dialog opens/closes or editItem changes
  useEffect(() => {
    if (open) {
      setName(editItem?.name ?? "");
      setDescription(editItem?.description ?? "");
      setUrl(editItem?.url ?? "");
      setPrice(editItem?.price != null ? String(editItem.price) : "");
      setImageUrl(editItem?.image_url ?? "");
      setPriority(editItem?.priority ?? "nice_to_have");
      setError(null);
      setImageValid(false);
    }
  }, [open, editItem]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const data: ItemFormData = {
        name,
        description: description || undefined,
        url: url || undefined,
        price: price ? parseFloat(price) : undefined,
        imageUrl: imageUrl || undefined,
        priority: priority as ItemFormData["priority"],
      };

      const result = editItem
        ? await updateItem(locale, listId, editItem.id, data)
        : await createItem(locale, listId, data);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setLoading(false);
      onOpenChange(false);
      router.refresh();
    },
    [
      name,
      description,
      url,
      price,
      imageUrl,
      priority,
      editItem,
      locale,
      listId,
      onOpenChange,
      router,
    ]
  );

  const isEdit = !!editItem;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-landing-text">
            {isEdit ? t("editTitle") : t("addTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="gift-name" className="text-landing-text font-medium">
              {t("nameLabel")} <span className="text-red-400">*</span>
            </Label>
            <Input
              id="gift-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={200}
              required
              className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="gift-description"
              className="text-landing-text font-medium"
            >
              {t("descriptionLabel")}
            </Label>
            <Textarea
              id="gift-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={1000}
              rows={3}
              className="resize-none border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="gift-url" className="text-landing-text font-medium">
              {t("linkLabel")}
            </Label>
            <Input
              id="gift-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("linkPlaceholder")}
              className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label
              htmlFor="gift-price"
              className="text-landing-text font-medium"
            >
              {t("priceLabel")}
            </Label>
            <Input
              id="gift-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("pricePlaceholder")}
              className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label
              htmlFor="gift-image"
              className="text-landing-text font-medium"
            >
              {t("imageLabel")}
            </Label>
            <Input
              id="gift-image"
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageValid(false);
              }}
              placeholder={t("imagePlaceholder")}
              className="border-landing-text/10 focus:border-landing-coral/30 focus:ring-landing-coral/20"
            />
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-lg border border-landing-text/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Gift preview"
                  className={`h-24 w-full object-cover transition-opacity ${
                    imageValid ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageValid(true)}
                  onError={() => setImageValid(false)}
                />
                {!imageValid && (
                  <div className="flex h-24 items-center justify-center bg-gray-50 text-xs text-landing-text-muted">
                    Image preview unavailable
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-landing-text font-medium">
              {t("priorityLabel")}
            </Label>
            <RadioGroup
              value={priority}
              onValueChange={setPriority}
              className="flex gap-2"
            >
              {PRIORITIES.map((p) => (
                <label
                  key={p}
                  htmlFor={`priority-${p}`}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border p-2.5 text-center text-sm transition-all duration-200 ${
                    priority === p
                      ? PRIORITY_COLORS[p] + " shadow-sm"
                      : "border-landing-text/10 bg-white hover:border-landing-text/20"
                  }`}
                >
                  <RadioGroupItem
                    value={p}
                    id={`priority-${p}`}
                    className="sr-only"
                  />
                  {tPriority(p)}
                </label>
              ))}
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
                ? isEdit
                  ? t("saving")
                  : t("adding")
                : isEdit
                  ? t("saveButton")
                  : t("addButton")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer border-landing-text/10"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
