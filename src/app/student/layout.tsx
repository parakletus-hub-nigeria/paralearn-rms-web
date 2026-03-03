"use client";

import RoleGuard from "@/components/protectedRoute/RoleGuard";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["student"]} mode="block">
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}
