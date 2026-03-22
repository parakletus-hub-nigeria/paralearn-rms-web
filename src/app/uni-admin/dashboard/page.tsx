"use client";
import React from "react";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminDashboard } from "@/components/University/AdminDashboard";

export default function UniAdminDashboardPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminDashboard />
    </RoleGuard>
  );
}
