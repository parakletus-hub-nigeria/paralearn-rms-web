import { LecturerAttendancePage } from "@/components/University/LecturerAttendancePage";
import { use } from "react";

export default function AttendanceDetailsRoute({
  params,
}: {
  params: Promise<{ lectureId: string }>;
}) {
  const { lectureId } = use(params);

  return <LecturerAttendancePage lectureId={lectureId} />;
}
