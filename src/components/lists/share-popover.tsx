"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QrCodeDialog } from "./qr-code-dialog";
import { Share2, Link, Check, Mail, QrCode } from "lucide-react";

type SharePopoverProps = {
  list: {
    slug: string;
    name: string;
    occasion: string;
  };
  locale: string;
};

export function SharePopover({ list, locale }: SharePopoverProps) {
  const t = useTranslations("lists.detail.share");
  const tOccasions = useTranslations("lists.occasions");
  const tShare = useTranslations("lists.detail");

  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getUrl = () =>
    `${window.location.origin}/${locale}/lists/${list.slug}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setPopoverOpen(false);
    }, 1200);
  };

  const handleEmail = () => {
    const url = getUrl();
    const occasion = tOccasions(list.occasion);
    const subject = encodeURIComponent(t("emailSubject"));
    const body = encodeURIComponent(
      t("emailBody", { occasion, url }),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setPopoverOpen(false);
  };

  const handleQrCode = () => {
    setPopoverOpen(false);
    setQrOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/10 px-3 py-1 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/20">
            <Share2 className="h-3.5 w-3.5" />
            {tShare("shareButton")}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 p-2">
          <button
            onClick={handleCopyLink}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-landing-text transition-all hover:bg-landing-peach-wash/80 active:scale-[0.98]"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${copied ? "bg-emerald-100" : "bg-landing-coral/10"}`}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Link className="h-4 w-4 text-landing-coral" />
              )}
            </span>
            {copied ? t("linkCopied") : t("copyLink")}
          </button>

          <div className="mx-3 my-0.5 border-t border-landing-text/[0.06]" />

          <button
            onClick={handleEmail}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-landing-text transition-all hover:bg-landing-lavender-wash/60 active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-landing-lavender-wash">
              <Mail className="h-4 w-4 text-landing-lavender" />
            </span>
            {t("shareEmail")}
          </button>

          <div className="mx-3 my-0.5 border-t border-landing-text/[0.06]" />

          <button
            onClick={handleQrCode}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-landing-text transition-all hover:bg-landing-mint/10 active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-landing-mint/15">
              <QrCode className="h-4 w-4 text-emerald-600" />
            </span>
            {t("qrCode")}
          </button>
        </PopoverContent>
      </Popover>

      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={getUrl()}
        listName={list.name}
      />
    </>
  );
}
