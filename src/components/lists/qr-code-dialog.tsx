"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

    // Draw QR code
    await QRCode.toCanvas(canvas, url, {
      width: 280,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
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
    tempCtx.font = "bold 16px system-ui, sans-serif";
    tempCtx.textAlign = "center";
    tempCtx.fillText("Podaruj.me", qrSize / 2, qrSize + 24);

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
      // Small delay to ensure canvas is mounted
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
    // Set title safely via DOM API to prevent XSS from list names
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-landing-text">
            {t("qrTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-landing-text/[0.06]">
            <canvas ref={canvasRef} />
          </div>

          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1 cursor-pointer gap-1.5 border-landing-text/10"
            >
              <Download className="h-4 w-4" />
              {t("qrDownload")}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 cursor-pointer gap-1.5 border-landing-text/10"
            >
              <Printer className="h-4 w-4" />
              {t("qrPrint")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
