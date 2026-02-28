"use client";

import RoleGuard from "@/components/protectedRoute/RoleGuard";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import { Toaster } from "sonner";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Toaster position="top-right" expand={false} richColors />
      <RoleGuard allow={["student"]} mode="block">
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}
