"use client";

import { Header } from "@/components/RMS/header";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetStudentTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";
import { CalendarDays, MapPin } from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

// Helper to format days (grouping by day, etc)
const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function StudentTimetablePage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const {
    data: timetableResponse,
    isLoading,
    isFetching,
  } = useGetStudentTimetableQuery();
  const timetableEntries = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  // Group classes by day
  const classesByDay: Record<string, any[]> = {};
  DAYS_OF_WEEK.forEach((day) => (classesByDay[day] = []));

  timetableEntries.forEach((entry: any) => {
    if (classesByDay[entry.dayOfWeek]) {
      classesByDay[entry.dayOfWeek].push(entry);
    } else {
      classesByDay[entry.dayOfWeek] = [entry];
    }
  });

  // Sort each day by start time (simple string sort works for HH:MM 24h)
  Object.keys(classesByDay).forEach((day) => {
    classesByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

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
            Your personal schedule based on enrolled courses.
          </p>
        </div>

        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium">
                Loading your timetable...
              </p>
            </div>
          </div>
        ) : timetableEntries.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              Your timetable is empty
            </p>
            <p className="text-slate-500 mt-1 max-w-sm">
              You haven't enrolled in any courses yet, or classes haven't been
              scheduled for your enrolled courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {DAYS_OF_WEEK.map((day) => {
              const dayClasses = classesByDay[day];
              if (dayClasses.length === 0) return null;

              return (
                <div
                  key={day}
                  className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5"
                >
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#641BC4]" />
                    {DAY_LABELS[day] || day}
                  </h2>

                  <div className="space-y-4">
                    {dayClasses.map((cls, idx) => (
                      <div
                        key={cls.id || idx}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#641BC4] rounded-l-xl opacity-80" />

                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-700">
                            {cls.course?.code || "COURSE"}
                          </span>
                          <span className="text-xs font-bold text-[#641BC4] bg-[#EDEAFB] px-2 py-1 rounded-md tracking-tight">
                            {cls.startTime} - {cls.endTime}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 leading-tight mb-1">
                          {cls.course?.title || "Class Session"}
                        </h3>

                        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-600 max-w-[60%] truncate">
                            <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                            <span
                              className="truncate"
                              title={cls.hall?.name}
                            >
                              {cls.hall?.name || "TBD"}
                            </span>
                          </span>
                          <span
                            className="truncate flex-1 text-right text-xs bg-slate-50 px-2 py-1 rounded"
                            title={
                              cls.lecturer?.firstName
                                ? `${cls.lecturer.firstName} ${cls.lecturer.lastName}`
                                : ""
                            }
                          >
                            {cls.lecturer?.lastName
                              ? `Dr. ${cls.lecturer.lastName}`
                              : "Lecturer"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
