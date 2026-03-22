import { AdminSessionsPage } from "@/components/University/AdminSessionsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function SessionsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminSessionsPage />
    </RoleGuard>
  );
}
