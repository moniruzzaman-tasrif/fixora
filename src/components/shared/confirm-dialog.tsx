/**
 * ConfirmDialog — reusable modal for destructive or significant actions.
 * Renders as a fixed overlay portal with ARIA roles and keyboard-accessible
 * focus trap (via useAccessibleDialog). Supports four severity variants that
 * control the icon and confirm-button colour.
 *
 * Usage: mount once in a parent component, control visibility with `isOpen`.
 * Always disabled while `isLoading` so the action cannot be double-submitted.
 */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibleDialog } from "@/lib/use-accessible-dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const { dialogRef, onKeyDown } = useAccessibleDialog<HTMLDivElement>(
    isOpen,
    onClose,
    !isLoading
  );

  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="size-6 text-red-600" />,
    warning: <AlertTriangle className="size-6 text-amber-600" />,
    primary: <Info className="size-6 text-teal-600" />,
    success: <CheckCircle className="size-6 text-emerald-600" />,
  };

  const confirmButtonClasses = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    primary: "bg-teal-700 hover:bg-teal-800 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0">
      <div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 shrink-0">
            {icons[variant]}
          </div>

          <div className="flex-1 space-y-1">
            <h3 id={titleId} className="text-lg font-bold text-slate-900 leading-snug">
              {title}
            </h3>
            <p id={descriptionId} className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn("font-semibold shadow-xs", confirmButtonClasses[variant])}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
