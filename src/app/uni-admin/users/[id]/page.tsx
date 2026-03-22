"use client";

import { useParams } from "next/navigation";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { AdminUserDetailPage } from "@/components/University/AdminUserDetailPage";

export default function UserDetailPage() {
  const { id } = useParams();

  return (
    <RoleGuard allow={["admin"]}>
      <AdminUserDetailPage userId={id as string} />
    </RoleGuard>
  );
}
