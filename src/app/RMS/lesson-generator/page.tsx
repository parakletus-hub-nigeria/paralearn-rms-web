import { LessonGeneratorDashboard } from "@/components/RMS/LessonGenerator/LessonGeneratorDashboard";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export const metadata = {
  title: "Lesson Note Generator | ParaLearn RMS",
  description: "AI-powered, NERDC-compliant lesson note generator for teachers.",
};

export default function LessonGeneratorPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin", "teacher"]}>
        <SideBar>
          <LessonGeneratorDashboard />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
