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
import { Download, Printer } from "lucide-react";

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

    await QRCode.toCanvas(canvas, url, {
      width: 220,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrSize = canvas.width;
    const brandingHeight = 32;
    const totalHeight = qrSize + brandingHeight;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = qrSize;
    tempCanvas.height = totalHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, qrSize, totalHeight);
    tempCtx.drawImage(canvas, 0, 0);

    tempCtx.fillStyle = "#e8836b";
    tempCtx.font = "bold 13px system-ui, sans-serif";
    tempCtx.textAlign = "center";
    tempCtx.fillText("Podaruj.me", qrSize / 2, qrSize + 20);

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
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center text-landing-text">
            {t("qrTitle")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-landing-text-muted">
            {t("qrSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-3">
            <canvas ref={canvasRef} className="block" />
          </div>

          <div className="flex w-full gap-2">
            <button
              onClick={handleDownload}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-landing-text/10 px-3 py-2 text-sm font-medium text-landing-text transition-colors hover:bg-landing-peach-wash/50 active:scale-[0.98]"
            >
              <Download className="h-4 w-4 text-landing-text-muted" />
              {t("qrDownload")}
            </button>
            <button
              onClick={handlePrint}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-landing-text/10 px-3 py-2 text-sm font-medium text-landing-text transition-colors hover:bg-landing-peach-wash/50 active:scale-[0.98]"
            >
              <Printer className="h-4 w-4 text-landing-text-muted" />
              {t("qrPrint")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
