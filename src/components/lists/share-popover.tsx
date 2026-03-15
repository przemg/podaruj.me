"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QrCodeDialog } from "./qr-code-dialog";
import {
  Link,
  Check,
  Mail,
  QrCode,
  ChevronDown,
} from "lucide-react";

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
      {/* Split button: left = copy link, right = dropdown */}
      <div className="flex items-stretch rounded-lg border border-landing-text/15 bg-white shadow-sm">
        {/* Primary action — copy link */}
        <button
          onClick={handleCopyLink}
          className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-landing-text transition-colors hover:bg-landing-peach-wash/60 active:scale-[0.97]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Link className="h-3.5 w-3.5 text-landing-coral" />
          )}
          {copied ? t("linkCopied") : t("copyLink")}
        </button>

        {/* Divider */}
        <div className="w-px bg-landing-text/15" />

        {/* Dropdown trigger */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex cursor-pointer items-center px-2 py-1.5 text-landing-text-muted transition-colors hover:bg-landing-peach-wash/60 hover:text-landing-text active:scale-[0.97]"
              aria-label="More sharing options"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            <button
              onClick={handleCopyLink}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-landing-text transition-colors hover:bg-landing-peach-wash/80"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${copied ? "bg-emerald-100" : "bg-landing-coral/10"}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Link className="h-3.5 w-3.5 text-landing-coral" />
                )}
              </span>
              {copied ? t("linkCopied") : t("copyLink")}
            </button>

            <button
              onClick={handleEmail}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-landing-text transition-colors hover:bg-landing-lavender-wash/60"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-landing-lavender-wash">
                <Mail className="h-3.5 w-3.5 text-landing-lavender" />
              </span>
              {t("shareEmail")}
            </button>

            <button
              onClick={handleQrCode}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-landing-text transition-colors hover:bg-landing-mint/10"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-landing-mint/15">
                <QrCode className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              {t("qrCode")}
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={getUrl()}
        listName={list.name}
      />
    </>
  );
}
