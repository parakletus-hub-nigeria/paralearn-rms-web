"use client";

import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherClassesPage } from "@/components/Teacher/TeacherClassesPage";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function ClassesPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherClassesPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
