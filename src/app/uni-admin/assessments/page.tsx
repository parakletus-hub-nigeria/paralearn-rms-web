import { AdminAssessmentsPage } from "@/components/University/AdminAssessmentsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function Page() {
  return (
    <RoleGuard allow={["admin"]}>
      <AdminAssessmentsPage />
    </RoleGuard>
  );
}
