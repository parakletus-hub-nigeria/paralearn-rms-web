import { LecturerAssessmentsPage } from "@/components/University/LecturerAssessmentsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function LecturerAssessmentsRoute() {
  return (
    <RoleGuard allow={["lecturer"]}>
      <LecturerAssessmentsPage />
    </RoleGuard>
  );
}
