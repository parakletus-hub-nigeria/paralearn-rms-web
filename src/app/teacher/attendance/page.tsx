"use client";

import TeacherSideBar from "@/components/Teacher/TeacherSideBar";
import TeacherAttendancePage from "@/components/Teacher/TeacherAttendancePage";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import RoleGuard from "@/components/protectedRoute/RoleGuard";

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <RoleGuard allow={["teacher"]} mode="block">
        <TeacherSideBar>
          <TeacherAttendancePage />
        </TeacherSideBar>
      </RoleGuard>
    </ProtectedRoute>
  );
}
