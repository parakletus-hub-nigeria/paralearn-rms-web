import { LessonGeneratorForm } from "@/components/RMS/LessonGenerator/LessonGeneratorForm";
import SideBar from "@/components/RMS/sideBar";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export const metadata = {
  title: "Create Lesson Note | ParaLearn RMS",
  description: "Generate a new AI-powered lesson note.",
};

export default function LessonGeneratorNewPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["admin", "teacher"]}>
        <SideBar>
          <LessonGeneratorForm />
        </SideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
