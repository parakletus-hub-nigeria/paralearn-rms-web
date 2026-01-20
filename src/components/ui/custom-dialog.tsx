"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  position?: "center" | "bottom";
  className?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export function CustomDialog({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
  position = "center",
  className,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: CustomDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // Focus the panel so Tab moves to inner focusable elements
      queueMicrotask(() => panelRef.current?.focus());
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const dialog = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        position === "bottom" ? "items-end pb-72" : ""
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {/* Overlay – click to close */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {/* Content panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto",
          "rounded-lg border border-slate-200 dark:border-slate-700",
          "bg-white dark:bg-slate-900 shadow-xl p-6",
          className
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute top-4 right-4 rounded p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className={showCloseButton ? "pr-8" : undefined}>{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(dialog, document.body) : null;
}
