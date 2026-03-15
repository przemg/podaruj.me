"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

// Generate SVG string with rounded QR dots
function generateRoundedQrSvg(
  modules: boolean[][],
  size: number,
  dotColor: string,
): string {
  const count = modules.length;
  const cellSize = size / count;
  const radius = cellSize * 0.35;

  let paths = "";

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (modules[row][col]) {
        const x = col * cellSize;
        const y = row * cellSize;
        paths += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${radius}" ry="${radius}" fill="${dotColor}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="white"/>${paths}</svg>`;
}

export function QrCodeDialog({
  open,
  onOpenChange,
  url,
  listName,
}: QrCodeDialogProps) {
  const t = useTranslations("lists.detail.share");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgHtml, setSvgHtml] = useState("");

  const generateQr = useCallback(async () => {
    // Get QR code matrix data
    const qrData = QRCode.create(url, { errorCorrectionLevel: "M" });
    const modules = qrData.modules;
    const size = modules.size;

    // Build boolean matrix
    const matrix: boolean[][] = [];
    for (let row = 0; row < size; row++) {
      matrix[row] = [];
      for (let col = 0; col < size; col++) {
        matrix[row][col] = modules.get(row, col) === 1;
      }
    }

    const svgSize = 220;
    const svg = generateRoundedQrSvg(matrix, svgSize, "#1a1a2e");
    setSvgHtml(svg);

    // Also draw to hidden canvas for download/print (with branding)
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const qrSize = 220;
      const brandingHeight = 32;
      const totalHeight = qrSize + brandingHeight;
      canvas.width = qrSize;
      canvas.height = totalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, qrSize, totalHeight);

      // Render SVG to canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, qrSize, qrSize);

        // Branding text
        ctx.fillStyle = "#e8836b";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Podaruj.me", qrSize / 2, qrSize + 20);
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }, [url]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(generateQr, 50);
      return () => clearTimeout(timer);
    }
  }, [open, generateQr]);

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
          {/* Rounded QR code (SVG) */}
          <div className="rounded-xl bg-white p-3">
            {svgHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: svgHtml }}
                className="block"
              />
            ) : (
              <div className="h-[220px] w-[220px]" />
            )}
            <p className="mt-1.5 text-center text-[13px] font-bold text-landing-coral">
              Podaruj.me
            </p>
          </div>

          {/* Hidden canvas for download/print */}
          <canvas ref={canvasRef} className="hidden" />

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
