import { LecturerCourseRosterPage } from "@/components/University/LecturerCourseRosterPage";
import { use } from "react";

export default function CourseRosterRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  return <LecturerCourseRosterPage courseId={courseId} />;
}
