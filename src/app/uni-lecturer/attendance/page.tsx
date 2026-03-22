"use client";

import { useRouter } from "next/navigation";
import { useGetLecturerTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { Header } from "@/components/RMS/header";
import { Users } from "lucide-react";

export default function LecturerAttendanceIndexPage() {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const { data: timetableResponse, isLoading } = useGetLecturerTimetableQuery();

  const entries = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
            Attendance Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Select a lecture session to view its attendance.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-purple-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-10 h-10 mb-3" />
            <p className="font-medium">No lecture sessions found.</p>
            <p className="text-sm mt-1">Your scheduled sessions will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">Course</th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">Day</th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">Time</th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">Hall</th>
                  <th className="py-4 px-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, idx: number) => (
                  <tr
                    key={entry.id || idx}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">
                        {entry.course?.code || "—"}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {entry.course?.title || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-600 text-sm">
                      {entry.dayOfWeek
                        ? entry.dayOfWeek.charAt(0) + entry.dayOfWeek.slice(1).toLowerCase()
                        : "—"}
                    </td>
                    <td className="py-4 px-3 text-slate-600 text-sm">
                      {entry.startTime || entry.start_time || "—"}
                      {entry.endTime || entry.end_time ? ` – ${entry.endTime || entry.end_time}` : ""}
                    </td>
                    <td className="py-4 px-3 text-slate-600 text-sm">
                      {entry.hall?.name || entry.hallName || "—"}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => router.push(`/uni-lecturer/attendance/${entry.id}`)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
