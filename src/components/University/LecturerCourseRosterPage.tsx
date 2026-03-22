"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetLecturerCourseRosterQuery } from "@/reduxToolKit/uniFeatures/courseApi";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  GraduationCap,
  Clock,
  BookOpen,
  RefreshCcw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { format } from "date-fns";

interface Props {
  courseId: string;
}

export function LecturerCourseRosterPage({ courseId }: Props) {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const [activeTab, setActiveTab] = useState<"enrolled" | "attending" | "alerts">(
    "enrolled"
  );

  const {
    data: rosterResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetLecturerCourseRosterQuery(courseId, { skip: !courseId });

  const course = rosterResponse?.course;
  const summary = rosterResponse?.summary ?? {
    totalEnrolled: 0,
    totalAttendees: 0,
    attendingButNotEnrolled: 0,
    enrolledButNeverAttended: 0,
  };
  const enrolled: any[] = rosterResponse?.enrolled ?? [];
  const attendees: any[] = rosterResponse?.attendees ?? [];
  const alerts = rosterResponse?.alerts ?? {
    attendingWithoutEnrollment: [],
    enrolledWithZeroAttendance: [],
  };

  const enrolledIds = new Set(enrolled.map((e: any) => e.id));

  return (
    <div className="w-full pb-10">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      {/* Hero */}
      <div className="bg-[#641BC4] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-500/20 mb-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <Badge className="bg-white/20 text-white border-white/20 mb-2 font-bold tracking-widest uppercase text-[10px]">
                Course Roster
              </Badge>
              <h1 className="text-3xl font-black font-coolvetica">
                {course?.title || "Loading..."}
              </h1>
              <p className="text-purple-100/70 font-medium text-sm">
                {course?.code} — Enrolled &amp; Attending Students
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <RefreshCcw className={`w-6 h-6 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrolled</p>
            <p className="text-2xl font-black text-slate-900">{summary.totalEnrolled}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Can take exams</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attending</p>
            <p className="text-2xl font-black text-slate-900">{summary.totalAttendees}</p>
            <p className="text-[10px] text-blue-600 font-bold">Showing up to class</p>
          </div>
        </div>

        <div
          className={`bg-white rounded-[2rem] border p-5 shadow-sm flex items-center gap-4 ${
            summary.attendingButNotEnrolled > 0
              ? "border-amber-200 bg-amber-50/30"
              : "border-slate-100"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              At-Risk
            </p>
            <p className="text-2xl font-black text-amber-700">
              {summary.attendingButNotEnrolled}
            </p>
            <p className="text-[10px] text-amber-600 font-bold">
              Attending, not enrolled
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Ghost
            </p>
            <p className="text-2xl font-black text-slate-900">
              {summary.enrolledButNeverAttended}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              Enrolled, never attended
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {summary.attendingButNotEnrolled > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-900 text-sm">
              {summary.attendingButNotEnrolled} student
              {summary.attendingButNotEnrolled > 1 ? "s are" : " is"} attending
              without formal enrollment
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              These students attend your classes but{" "}
              <strong>cannot sit CBT exams or quizzes</strong> until they enroll
              via the Academic Registry. Consider notifying them.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
        {(
          [
            { key: "enrolled", label: `Enrolled (${summary.totalEnrolled})`, icon: GraduationCap },
            { key: "attending", label: `Attending (${summary.totalAttendees})`, icon: Users },
            {
              key: "alerts",
              label: `Alerts (${summary.attendingButNotEnrolled + summary.enrolledButNeverAttended})`,
              icon: AlertTriangle,
            },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === key
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100">
          <RefreshCcw className="w-10 h-10 text-slate-200 animate-spin mb-4" />
          <p className="text-slate-400 font-bold">Loading roster...</p>
        </div>
      ) : (
        <>
          {/* ── Enrolled Tab ──────────────────────────────────────────────── */}
          {activeTab === "enrolled" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-slate-900">
                  Formally Enrolled Students
                </h2>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold ml-auto">
                  Can sit CBT exams
                </Badge>
              </div>
              {enrolled.length === 0 ? (
                <div className="py-24 text-center">
                  <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No enrolled students yet</p>
                  <p className="text-slate-300 text-sm mt-1">
                    Students must enroll via their Academic Registry page.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Student
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Matric No.
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Lectures Attended
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Enrolled
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Exam Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {enrolled.map((student: any) => (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-xs">
                                  {student.firstName?.[0]}
                                  {student.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors text-sm">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                              {student.studentProfile?.matricNumber || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                                  student.attendanceCount > 0
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {student.attendanceCount}
                              </div>
                              {!student.hasAttended && (
                                <span className="text-[10px] font-bold text-amber-600">
                                  Never attended
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                            {student.enrolledAt
                              ? format(new Date(student.enrolledAt), "dd MMM yyyy")
                              : "—"}
                          </td>
                          <td className="px-8 py-4">
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 font-black text-[10px] uppercase flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3" />
                              Eligible
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Attending Tab ─────────────────────────────────────────────── */}
          {activeTab === "attending" && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/40 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="font-black text-slate-900">
                  Class Attendees
                </h2>
                <p className="text-xs text-slate-400 font-medium ml-1">
                  — students who attended at least one lecture
                </p>
                <Badge className="bg-blue-100 text-blue-700 border-0 font-bold ml-auto">
                  Open to all students
                </Badge>
              </div>
              {attendees.length === 0 ? (
                <div className="py-24 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No attendance records yet</p>
                  <p className="text-slate-300 text-sm mt-1">
                    Students will appear here once they check in via geofenced attendance.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Student
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Matric No.
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Lectures Attended
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Last Seen
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Exam Eligibility
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendees.map((student: any) => {
                        const isEnrolled = enrolledIds.has(student.id);
                        return (
                          <tr
                            key={student.id}
                            className={`hover:bg-slate-50/50 transition-colors group ${
                              !isEnrolled ? "bg-amber-50/20" : ""
                            }`}
                          >
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                  <AvatarFallback
                                    className={`font-black text-xs ${
                                      isEnrolled
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {student.firstName?.[0]}
                                    {student.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors text-sm">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                                {student.studentProfile?.matricNumber || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold text-slate-700 text-sm">
                                  {student.attendanceCount} session
                                  {student.attendanceCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                              {student.lastAttended
                                ? format(new Date(student.lastAttended), "dd MMM")
                                : "—"}
                            </td>
                            <td className="px-8 py-4">
                              {isEnrolled ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-0 font-black text-[10px] uppercase flex items-center gap-1 w-fit">
                                  <ShieldCheck className="w-3 h-3" />
                                  Enrolled
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-black text-[10px] uppercase flex items-center gap-1 w-fit">
                                  <ShieldX className="w-3 h-3" />
                                  Not Enrolled
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Alerts Tab ────────────────────────────────────────────────── */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              {/* Attending without enrollment */}
              <div className="bg-white rounded-[2.5rem] border border-amber-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-amber-100 bg-amber-50/50 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h2 className="font-black text-slate-900">
                      Attending Without Enrollment
                    </h2>
                    <p className="text-xs text-amber-700 font-medium">
                      These students attend class but cannot sit exams. They must
                      enroll via Academic Registry.
                    </p>
                  </div>
                </div>
                {alerts.attendingWithoutEnrollment.length === 0 ? (
                  <div className="py-12 text-center">
                    <UserCheck className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">
                      All attending students are enrolled
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-amber-50">
                    {alerts.attendingWithoutEnrollment.map((student: any) => (
                      <div
                        key={student.id}
                        className="px-8 py-4 flex items-center justify-between gap-4 hover:bg-amber-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-amber-100 text-amber-700 font-black text-xs">
                              {student.firstName?.[0]}
                              {student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {student.studentProfile?.matricNumber || student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {student.attendanceCount} lecture
                            {student.attendanceCount !== 1 ? "s" : ""} attended
                          </span>
                          <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] font-black uppercase">
                            Cannot take exams
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled but never attended */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                  <div>
                    <h2 className="font-black text-slate-900">
                      Enrolled but Never Attended
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      These students are registered for the course but have not
                      attended any lecture yet.
                    </p>
                  </div>
                </div>
                {alerts.enrolledWithZeroAttendance.length === 0 ? (
                  <div className="py-12 text-center">
                    <UserCheck className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">
                      All enrolled students have attended at least once
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {alerts.enrolledWithZeroAttendance.map((student: any) => (
                      <div
                        key={student.id}
                        className="px-8 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-xs">
                              {student.firstName?.[0]}
                              {student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {student.studentProfile?.matricNumber || student.email}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px] font-black uppercase">
                          0 Attendances
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
