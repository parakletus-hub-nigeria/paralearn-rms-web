import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherDashboardPage } from "@/components/Teacher/TeacherDashboardPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function TeacherDashboard() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherDashboardPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

