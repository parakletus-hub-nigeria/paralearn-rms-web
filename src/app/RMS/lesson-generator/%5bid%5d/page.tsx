import { LessonGeneratorDetail } from "@/components/RMS/LessonGenerator/LessonGeneratorDetail";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export const metadata = {
  title: "View Lesson Note | ParaLearn RMS",
  description: "View and export your AI-generated lesson note.",
};

export default function LessonGeneratorDetailPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin", "teacher"]}>
        <SideBar>
          <LessonGeneratorDetail />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
