import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherAssessmentsPage } from "@/components/Teacher/TeacherAssessmentsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function TeacherAssessments() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherAssessmentsPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

