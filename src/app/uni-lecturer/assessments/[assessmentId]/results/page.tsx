"use client";
import { LecturerAssessmentResultsPage } from "@/components/University/LecturerAssessmentResultsPage";
import RoleGuard from "@/components/protectedRoute/RoleGuard";
import { use } from "react";

export default function ResultsRoute({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  return (
    <RoleGuard allow={["lecturer"]}>
      <LecturerAssessmentResultsPage assessmentId={assessmentId} />
    </RoleGuard>
  );
}
