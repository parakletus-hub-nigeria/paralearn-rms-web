import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherAssessmentDetailPage } from "@/components/Teacher/TeacherAssessmentDetailPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function TeacherAssessmentDetail() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherAssessmentDetailPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

