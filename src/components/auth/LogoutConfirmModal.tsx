"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const LogoutConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: LogoutConfirmModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]" style={{ borderColor: "var(--border-fine)" }}>
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: "var(--crimson-tint)" }}>
            <LogOut className="w-6 h-6" style={{ color: "var(--crimson-signal)" }} />
          </div>
          <AlertDialogTitle className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "var(--foreground-muted)" }}>
            Are you sure you want to log out of your account? You will need to sign in again to access the dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="min-w-[120px]"
            style={{ borderRadius: "var(--radius-lg)", borderColor: "var(--border-medium)" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="min-w-[120px] text-white"
            style={{ background: "var(--crimson-signal)", borderRadius: "var(--radius-lg)" }}
          >
            {loading ? "Logging out..." : "Log Out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
