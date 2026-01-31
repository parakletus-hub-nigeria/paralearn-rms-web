import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherCommentsPage } from "@/components/Teacher/TeacherCommentsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function TeacherComments() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherCommentsPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}

