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

  const buttonClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-landing-text transition-colors hover:bg-landing-peach-wash/60";

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-landing-coral/10 px-3 py-1 text-xs font-medium text-landing-coral transition-colors hover:bg-landing-coral/20">
            <Share2 className="h-3.5 w-3.5" />
            {tShare("shareButton")}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1.5">
          <button onClick={handleCopyLink} className={buttonClass}>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Link className="h-4 w-4 text-landing-text-muted" />
            )}
            {copied ? t("linkCopied") : t("copyLink")}
          </button>
          <button onClick={handleEmail} className={buttonClass}>
            <Mail className="h-4 w-4 text-landing-text-muted" />
            {t("shareEmail")}
          </button>
          <button onClick={handleQrCode} className={buttonClass}>
            <QrCode className="h-4 w-4 text-landing-text-muted" />
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
