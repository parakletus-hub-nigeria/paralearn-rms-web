"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetLecturerCoursesQuery } from "@/reduxToolKit/uniFeatures/courseApi";
import { useGetLecturerTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Users,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";

export default function UniLecturerDashboardPage() {
  const router = useRouter();
  const { user, tenantInfo } = useSelector((state: RootState) => state.user);

  const { data: coursesResponse, isLoading: loadingCourses } =
    useGetLecturerCoursesQuery();
  const { data: timetableResponse, isLoading: loadingTimetable } =
    useGetLecturerTimetableQuery();

  const courses: any[] = Array.isArray(coursesResponse?.data)
    ? coursesResponse.data
    : Array.isArray(coursesResponse)
      ? coursesResponse
      : [];

  const timetableEntries: any[] = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  const totalEnrolled = courses.reduce(
    (sum: number, c: any) => sum + (c.enrolledStudents ?? 0),
    0,
  );

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayLectures = timetableEntries.filter(
    (e: any) =>
      (e.dayOfWeek || e.day || "")
        .toLowerCase()
        .startsWith(todayName.toLowerCase().slice(0, 3)),
  );

  return (
    <div className="w-full space-y-6">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      {/* Welcome banner */}
      <div className="p-8 bg-[#641BC4] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-1">
          <p className="text-purple-200 text-sm font-bold uppercase tracking-widest">
            Lecturer Portal
          </p>
          <h1 className="text-3xl font-black font-coolvetica">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-purple-100/70 font-medium text-sm">
            {tenantInfo?.name || "ParaLearn University"} — Academic Dashboard
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            Icon: BookOpen,
            label: "My Courses",
            value: loadingCourses ? "—" : courses.length,
            sub: null,
            color: "bg-purple-50 text-[#641BC4]",
          },
          {
            Icon: GraduationCap,
            label: "Total Enrolled",
            value: loadingCourses ? "—" : totalEnrolled,
            sub: "Eligible to sit exams",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            Icon: Calendar,
            label: "Today's Lectures",
            value: loadingTimetable ? "—" : todayLectures.length,
            sub: null,
            color: "bg-blue-50 text-blue-600",
          },
        ].map(({ Icon, label, value, sub, color }, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {label}
              </p>
              <p className="text-3xl font-black text-slate-900">{value}</p>
              {sub && (
                <p className="text-[10px] text-emerald-600 font-bold">{sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <h2 className="font-black text-slate-900">My Courses</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/uni-lecturer/assessments")}
            className="text-[#641BC4] font-bold hover:bg-purple-50 rounded-xl"
          >
            View Assessments <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loadingCourses ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#641BC4]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No courses assigned yet</p>
            <p className="text-sm mt-1">
              Contact your admin to get assigned to courses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {courses.map((course: any) => (
              <div
                key={course.courseId}
                className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#641BC4]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-600 uppercase">
                        {course.code}
                      </span>
                      {course.department?.name && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {course.department.name}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors">
                      {course.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:ml-auto">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-sm">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {course.enrolledStudents ?? 0} enrolled
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/uni-lecturer/courses/${course.courseId}/roster`,
                      )
                    }
                    className="rounded-xl border-purple-100 text-[#641BC4] hover:bg-purple-50 font-bold gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    View Roster
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <h2 className="font-black text-slate-900">
            Today&apos;s Schedule{" "}
            <span className="text-slate-400 font-medium text-sm">
              ({todayName})
            </span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/uni-lecturer/timetable")}
            className="text-[#641BC4] font-bold hover:bg-purple-50 rounded-xl"
          >
            Full Timetable <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loadingTimetable ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#641BC4]" />
          </div>
        ) : todayLectures.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No lectures scheduled today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayLectures.map((entry: any, idx: number) => (
              <div
                key={entry.id || idx}
                className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black mb-1 inline-block">
                      {entry.course?.code || "COURSE"}
                    </span>
                    <p className="font-bold text-slate-900">
                      {entry.course?.title || entry.course?.name || "Course"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {entry.startTime} – {entry.endTime} &nbsp;·&nbsp;{" "}
                      {entry.hall?.name || entry.hallId || "TBD"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/uni-lecturer/attendance/${entry.id}`)
                  }
                  className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Open Attendance
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
