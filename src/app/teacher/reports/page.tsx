import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherReportsPage } from "@/components/Teacher/TeacherReportsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function TeacherReports() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherReportsPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

