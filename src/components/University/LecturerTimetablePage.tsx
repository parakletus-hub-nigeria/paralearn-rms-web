"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Play, Square, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetLecturerTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";
import { useToggleAttendanceWindowMutation } from "@/reduxToolKit/uniFeatures/attendanceApi";
import { useRouter } from "next/navigation";

const DEFAULT_PRIMARY = "#641BC4";

export function LecturerTimetablePage() {
  const router = useRouter();
  const { tenantInfo, user } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  // Fetching the timetable for the current lecturer (handled via JWT backend side ideally)
  const {
    data: timetableResponse,
    isLoading,
    isFetching,
  } = useGetLecturerTimetableQuery();
  const [toggleAttendance, { isLoading: isToggling }] =
    useToggleAttendanceWindowMutation();

  const timetableEntries = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  // Local overrides for instant UI after session end (open is handled by navigation to attendance page)
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  const handleEndSession = async (lectureId: string) => {
    try {
      await toggleAttendance({ lectureId, open: false }).unwrap();
      toast.success("Attendance window closed.");
      setClosedIds((prev) => new Set(prev).add(lectureId));
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to close session");
    }
  };

  const handleStartSession = (entryId: string) => {
    router.push(`/uni-lecturer/attendance/${entryId}`);
  };

  const handleViewAttendance = (entry: any) => {
    const id = entry.activeLecture?.id || entry.id;
    router.push(`/uni-lecturer/attendance/${id}`);
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
            My Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            View your scheduled classes and manage active attendance sessions.
          </p>
        </div>

        {/* Table */}
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium">Loading schedule...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Course
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Day & Time
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Hall
                    </th>
                    <th className="text-center text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Session Control
                    </th>
                    <th className="text-center text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Records
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timetableEntries.map((entry: any, idx: number) => {
                    const lectureId = entry.activeLecture?.id;
                    const isActive =
                      lectureId &&
                      !closedIds.has(lectureId) &&
                      (entry.activeLecture?.attendanceOpen ?? false);

                    return (
                      <tr
                        key={entry.id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <span className="font-mono bg-slate-100 px-2 py-1 flex max-w-max rounded text-xs mb-1">
                            {entry.course?.code || "COURSE_CODE"}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {entry.course?.title || "Course Title"}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-900 font-medium">
                          <span className="block">{entry.dayOfWeek}</span>
                          <span className="text-sm text-slate-500 font-normal">
                            {entry.startTime} - {entry.endTime}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-600 text-sm">
                          {entry.hall?.name || "TBD"}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {isActive ? (
                            <Button
                              onClick={() => handleEndSession(lectureId)}
                              disabled={isToggling}
                              variant="destructive"
                              className="h-9 px-4 rounded-lg gap-2 text-white"
                            >
                              <Square className="w-4 h-4" />
                              End Session
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleStartSession(entry.id)}
                              className="h-9 px-4 rounded-lg gap-2 text-white bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Play className="w-4 h-4" />
                              Start Session
                            </Button>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <Button
                            onClick={() => handleViewAttendance(entry)}
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-lg text-slate-500 hover:text-[#641BC4] hover:bg-purple-50"
                            title="View Attendance Logs"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {timetableEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-16 text-center text-slate-500 font-medium"
                      >
                        No scheduled classes found in your timetable.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
