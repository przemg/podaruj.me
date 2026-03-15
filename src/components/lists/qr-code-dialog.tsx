"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Printer, Gift } from "lucide-react";

type QrCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  listName: string;
};

export function QrCodeDialog({
  open,
  onOpenChange,
  url,
  listName,
}: QrCodeDialogProps) {
  const t = useTranslations("lists.detail.share");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawQrCode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw QR code
    await QRCode.toCanvas(canvas, url, {
      width: 240,
      margin: 2,
      color: { dark: "#2d1b4e", light: "#ffffff" },
    });

    // Add branding below QR code
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrSize = canvas.width;
    const brandingHeight = 36;
    const totalHeight = qrSize + brandingHeight;

    // Create temp canvas with branding space
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = qrSize;
    tempCanvas.height = totalHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // White background
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, qrSize, totalHeight);

    // Copy QR code
    tempCtx.drawImage(canvas, 0, 0);

    // Draw branding text
    tempCtx.fillStyle = "#e8836b";
    tempCtx.font = "bold 14px system-ui, sans-serif";
    tempCtx.textAlign = "center";
    tempCtx.fillText("Podaruj.me", qrSize / 2, qrSize + 22);

    // Copy back to original canvas
    canvas.height = totalHeight;
    canvas.width = qrSize;
    const originalCtx = canvas.getContext("2d");
    if (originalCtx) {
      originalCtx.drawImage(tempCanvas, 0, 0);
    }
  }, [url]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(drawQrCode, 50);
      return () => clearTimeout(timer);
    }
  }, [open, drawQrCode]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${listName}-qr.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    });
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(
      "<!DOCTYPE html><html><head><title></title></head>" +
        '<body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;">' +
        "</body></html>",
    );
    printWindow.document.title = `${listName} - QR Code`;
    const img = printWindow.document.createElement("img");
    img.src = dataUrl;
    printWindow.document.body.appendChild(img);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-sm">
        {/* Gift box top — gradient header with bow */}
        <div className="relative bg-gradient-to-b from-landing-coral/15 via-landing-peach-wash to-white px-6 pt-8 pb-0">
          {/* Ribbon vertical stripe */}
          <div className="absolute inset-x-0 top-0 mx-auto h-full w-10 bg-landing-coral/[0.07]" />

          {/* Ribbon horizontal stripe */}
          <div className="absolute inset-y-0 left-0 top-1/3 h-10 w-full bg-landing-coral/[0.07]" />

          {/* Bow — centered gift icon */}
          <div className="relative z-10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-landing-coral to-landing-coral-dark shadow-md shadow-landing-coral/25">
            <Gift className="h-5 w-5 text-white" />
          </div>

          <DialogHeader className="relative z-10">
            <DialogTitle className="text-center text-lg font-bold text-landing-text">
              {t("qrTitle")}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-landing-text-muted">
              {t("qrSubtitle")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Gift box body — QR code */}
        <div className="flex flex-col items-center gap-5 px-6 pt-4 pb-6">
          {/* QR code in a "card" with subtle gift-wrap pattern border */}
          <div className="relative rounded-2xl bg-white p-4 shadow-lg shadow-landing-coral/[0.08] ring-1 ring-landing-text/[0.06]">
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 h-3 w-3 rounded-br-lg border-b-2 border-r-2 border-landing-coral/30" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-bl-lg border-b-2 border-l-2 border-landing-coral/30" />
            <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-tr-lg border-t-2 border-r-2 border-landing-coral/30" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-tl-lg border-t-2 border-l-2 border-landing-coral/30" />

            <canvas ref={canvasRef} className="block" />
          </div>

          {/* Action buttons */}
          <div className="flex w-full gap-2">
            <button
              onClick={handleDownload}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-landing-coral/10 px-4 py-2.5 text-sm font-medium text-landing-coral transition-all hover:bg-landing-coral/20 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              {t("qrDownload")}
            </button>
            <button
              onClick={handlePrint}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-landing-lavender-wash px-4 py-2.5 text-sm font-medium text-landing-lavender transition-all hover:bg-landing-lavender-wash/80 active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              {t("qrPrint")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
