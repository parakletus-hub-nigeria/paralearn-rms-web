"use client";

import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import { TeacherScoresPage } from "@/components/Teacher/TeacherScoresPage";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function ScoresPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherScoresPage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
