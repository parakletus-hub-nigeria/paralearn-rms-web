"use client";
import LecturerGradeSubmissionPage from "@/components/University/LecturerGradeSubmissionPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { use } from "react";

export default function GradeSubmissionRoute({
  params,
}: {
  params: Promise<{ assessmentId: string; submissionId: string }>;
}) {
  const { assessmentId, submissionId } = use(params);
  return (
    <RoleGuard allow={["lecturer"]}>
      <LecturerGradeSubmissionPage
        assessmentId={assessmentId}
        submissionId={submissionId}
      />
    </RoleGuard>
  );
}
