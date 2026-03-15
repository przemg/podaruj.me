"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Archive, Loader2 } from "lucide-react";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  // Enhanced props for close suggestion
  showCloseOption?: boolean;
  closeLabel?: string;
  onClose?: () => void;
  closeLoading?: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  showCloseOption,
  closeLabel,
  onClose,
  closeLoading,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-landing-text">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-landing-text-muted">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || closeLoading}
            className="w-full cursor-pointer border-landing-text/10 sm:w-auto"
          >
            {cancelLabel}
          </Button>
          {showCloseOption && onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading || closeLoading}
              className="w-full cursor-pointer border-orange-200 text-orange-700 hover:bg-orange-50 sm:w-auto"
            >
              {closeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Archive className="h-4 w-4 mr-1.5" />
              {closeLabel}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading || closeLoading}
            className="w-full cursor-pointer bg-red-500 hover:bg-red-600 sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
