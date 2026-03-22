"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useCreateTimetableEntryMutation,
  useGetAdminTimetableQuery,
} from "@/reduxToolKit/uniFeatures/timetableApi";
import { useGetCoursesQuery } from "@/reduxToolKit/uniFeatures/courseApi";
import { useGetUniUsersQuery } from "@/reduxToolKit/uniFeatures/adminApi";
import { useGetHallsQuery } from "@/reduxToolKit/uniFeatures/hallsApi";
import { useGetFacultiesQuery } from "@/reduxToolKit/uniFeatures/facultyApi";
import { useGetDepartmentsQuery } from "@/reduxToolKit/uniFeatures/departmentApi";

const DEFAULT_PRIMARY = "#641BC4";
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_ORDER: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

type Tab = "schedule" | "view";

export function AdminTimetablePage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  // ── Schedule tab data ──────────────────────────────────────────────────────
  const { data: coursesResponse, isLoading: isLoadingCourses } =
    useGetCoursesQuery();
  const [createEntry, { isLoading: isCreating }] =
    useCreateTimetableEntryMutation();

  const courses = Array.isArray(coursesResponse?.data)
    ? coursesResponse.data
    : Array.isArray(coursesResponse)
      ? coursesResponse
      : [];

  const { data: lecturersResponse } = useGetUniUsersQuery({
    role: "LECTURER",
    limit: 100,
  });
  const lecturers = lecturersResponse?.data || [];

  const { data: hallsResponse } = useGetHallsQuery();
  const halls = Array.isArray(hallsResponse)
    ? hallsResponse
    : hallsResponse?.data || [];

  // ── View tab data ──────────────────────────────────────────────────────────
  const { data: facultiesResponse } = useGetFacultiesQuery();
  const faculties = Array.isArray(facultiesResponse)
    ? facultiesResponse
    : facultiesResponse?.data || [];

  const { data: departmentsResponse } = useGetDepartmentsQuery();
  const allDepartments = Array.isArray(departmentsResponse)
    ? departmentsResponse
    : departmentsResponse?.data || [];

  const [filterFacultyId, setFilterFacultyId] = useState<string>("");
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>("");

  const filteredDepartments = filterFacultyId
    ? allDepartments.filter((d: any) => d.facultyId === filterFacultyId)
    : allDepartments;

  const { data: timetableResponse, isLoading: isLoadingTimetable } =
    useGetAdminTimetableQuery(
      filterDepartmentId
        ? { departmentId: filterDepartmentId }
        : filterFacultyId
          ? { facultyId: filterFacultyId }
          : undefined
    );

  const timetableEntries: any[] = Array.isArray(timetableResponse)
    ? timetableResponse
    : timetableResponse?.data || [];

  // Group by day of week
  const byDay = timetableEntries.reduce(
    (acc: Record<string, any[]>, entry: any) => {
      const day = (entry.dayOfWeek || "").toUpperCase();
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    },
    {}
  );

  const sortedDays = Object.keys(byDay).sort(
    (a, b) => (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99)
  );

  // ── Schedule form ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    courseId: "",
    lecturerId: "",
    hallId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  const handleScheduleClass = async () => {
    try {
      if (!form.courseId) return toast.error("Please select a course");
      if (!form.lecturerId) return toast.error("Please select a lecturer");
      if (!form.hallId) return toast.error("Please select a hall");
      if (!form.dayOfWeek) return toast.error("Please select a day");
      if (!form.startTime) return toast.error("Start time is required");
      if (!form.endTime) return toast.error("End time is required");

      await createEntry({
        courseId: form.courseId,
        lecturerId: form.lecturerId,
        hallId: form.hallId,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
      }).unwrap();

      toast.success("Class scheduled successfully!");
      setForm({
        courseId: "",
        lecturerId: "",
        hallId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.data?.error ||
        e?.message ||
        "Failed to schedule class. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
            Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            Schedule classes and view the university timetable.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "schedule"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Schedule Class
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "view"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            View Timetable
          </button>
        </div>

        {/* ── Schedule Tab ── */}
        {activeTab === "schedule" && (
          <div className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Select */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Course
                </label>
                <div className="mt-2" style={{ position: "relative", zIndex: 10005 }}>
                  <Select
                    value={form.courseId}
                    onValueChange={(v) => setForm((p) => ({ ...p, courseId: v }))}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                      <SelectValue
                        placeholder={
                          isLoadingCourses ? "Loading courses..." : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" style={{ zIndex: 10006 }}>
                      {courses.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="font-mono bg-slate-100 px-1 rounded mr-2">
                            {c.code}
                          </span>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lecturer Select */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Lecturer
                </label>
                <div className="mt-2" style={{ position: "relative", zIndex: 10004 }}>
                  <Select
                    value={form.lecturerId}
                    onValueChange={(v) => setForm((p) => ({ ...p, lecturerId: v }))}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" style={{ zIndex: 10005 }}>
                      {lecturers.length === 0 && (
                        <SelectItem value="none" disabled>
                          No lecturers found
                        </SelectItem>
                      )}
                      {lecturers.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.firstName} {t.lastName} ({t.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hall Select */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Lecture Hall
                </label>
                <div className="mt-2" style={{ position: "relative", zIndex: 10003 }}>
                  <Select
                    value={form.hallId}
                    onValueChange={(v) => setForm((p) => ({ ...p, hallId: v }))}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                      <SelectValue placeholder="Select hall" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" style={{ zIndex: 10004 }}>
                      {halls.length === 0 && (
                        <SelectItem value="none" disabled>
                          No halls found
                        </SelectItem>
                      )}
                      {halls.map((h: any) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                          {h.building ? ` — ${h.building}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Day of Week */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Day of Week
                </label>
                <div className="mt-2" style={{ position: "relative", zIndex: 10003 }}>
                  <Select
                    value={form.dayOfWeek}
                    onValueChange={(v) => setForm((p) => ({ ...p, dayOfWeek: v }))}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" style={{ zIndex: 10004 }}>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                  className="mt-2 h-11 rounded-xl bg-white cursor-pointer"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  End Time
                </label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="mt-2 h-11 rounded-xl bg-white cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleScheduleClass}
                disabled={isCreating}
                className="h-11 px-8 rounded-xl text-white gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <CalendarDays className="w-4 h-4" />
                {isCreating ? "Scheduling..." : "Schedule Class"}
              </Button>
            </div>
          </div>
        )}

        {/* ── View Timetable Tab ── */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Faculty
                </label>
                <Select
                  value={filterFacultyId || "all"}
                  onValueChange={(v) => {
                    const val = v === "all" ? "" : v;
                    setFilterFacultyId(val);
                    setFilterDepartmentId(""); // reset department when faculty changes
                  }}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-white">
                    <SelectValue placeholder="All Faculties" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Faculties</SelectItem>
                    {faculties.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Department
                </label>
                <Select
                  value={filterDepartmentId || "all"}
                  onValueChange={(v) => setFilterDepartmentId(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-white">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Departments</SelectItem>
                    {filteredDepartments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timetable entries */}
            {isLoadingTimetable ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Loading timetable...
              </div>
            ) : timetableEntries.length === 0 ? (
              <div className="py-16 text-center">
                <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">
                  No timetable entries found
                </p>
                <p className="text-slate-300 text-xs mt-1">
                  Try adjusting the faculty or department filter
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDays.map((day) => (
                  <div key={day}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {byDay[day]
                        .sort((a: any, b: any) =>
                          (a.startTime || "").localeCompare(b.startTime || "")
                        )
                        .map((entry: any) => {
                          const course = entry.course;
                          const lecturer = entry.lecturer?.user;
                          const hall = entry.hall;
                          return (
                            <div
                              key={entry.id}
                              className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Course */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-semibold">
                                    {course?.code || "—"}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 mt-1">
                                  {course?.title || "Untitled Course"}
                                </p>
                                {(course?.department?.name || course?.faculty?.name) && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {course?.faculty?.name}
                                    {course?.faculty?.name && course?.department?.name && " › "}
                                    {course?.department?.name}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                                {/* Time */}
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                  <span>
                                    {entry.startTime} – {entry.endTime}
                                  </span>
                                </div>

                                {/* Lecturer */}
                                {lecturer && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>
                                      {lecturer.firstName} {lecturer.lastName}
                                    </span>
                                  </div>
                                )}

                                {/* Hall */}
                                {hall && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    <span>
                                      {hall.name}
                                      {hall.building ? ` — ${hall.building}` : ""}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
