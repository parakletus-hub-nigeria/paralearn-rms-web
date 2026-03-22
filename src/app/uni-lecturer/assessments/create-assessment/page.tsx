import LecturerCreateAssessmentPage from "@/components/University/LecturerCreateAssessmentPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function Page() {
  return (
    <RoleGuard allow={["lecturer"]}>
      <LecturerCreateAssessmentPage />
    </RoleGuard>
  );
}
