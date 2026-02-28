"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAcademicCurrent, fetchMyAssessments, fetchTeacherClasses } from "@/reduxToolKit/teacher/teacherThunks";
import { TeacherHeader } from "./TeacherHeader";
import Link from "next/link";
import { routespath } from "@/lib/routepath";
import {
  ClipboardList,
  MessageSquareText,
  BookOpen,
  CalendarDays,
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  BarChart3,
  Clock,
  ChevronRight,
  Layers,
} from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

export function TeacherDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { academicCurrent, assessments, teacherClasses, loading } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  useEffect(() => {
    dispatch(fetchAcademicCurrent());
    dispatch(fetchMyAssessments());
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
  }, [dispatch, user]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const activeAssessments = assessments.filter((a) => a.status === "started").length;
    const pendingGrading = assessments.filter((a) => a.status === "ended").length;
    const notStarted = assessments.filter((a) => a.status === "not_started").length;

    // Extract unique classes and subjects from teacherClasses
    const classSet = new Set<string>();
    const subjectSet = new Set<string>();
    let totalStudents = 0;

    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId || item.id;
      const className = item.class?.name || item.className || item.name;
      const subjectName = item.subject?.name || item.subjectName || item.name;
      const studentCount = item.class?.studentCount || item.class?.enrollmentCount || 
                          item.studentCount || item.enrollmentCount || 0;

      if (classId && className) {
        if (!classSet.has(classId)) {
          classSet.add(classId);
          totalStudents += studentCount;
        }
      }
      if (subjectName) {
        subjectSet.add(subjectName);
      }
    });

    return {
      totalAssessments,
      activeAssessments,
      pendingGrading,
      notStarted,
      totalClasses: classSet.size,
      totalSubjects: subjectSet.size,
      totalStudents,
    };
  }, [assessments, teacherClasses]);

  // Get recent assessments (last 5)
  const recentAssessments = useMemo(() => {
    return [...assessments]
      .sort((a, b) => {
        const dateA = new Date(a.startsAt || 0).getTime();
        const dateB = new Date(b.startsAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [assessments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
      case "ended":
        return { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
      case "not_started":
        return { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
      default:
        return { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
    }
  };

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="space-y-6">
        {/* Welcome Section with Academic Period */}
        <div className="card-premium p-5 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
            <div className="space-y-2">
              <p className="text-slate-400 font-medium font-coolvetica">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold font-coolvetica">
                {(user as any)?.firstName || "Teacher"} {(user as any)?.lastName || ""}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                  <CalendarDays className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">
                    {academicCurrent?.session || "—"} • {academicCurrent?.term || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Classes", value: stats.totalClasses, icon: GraduationCap, color: "#8B5CF6" },
                { label: "Subjects", value: stats.totalSubjects, icon: BookOpen, color: "#3B82F6" },
                { label: "Students", value: stats.totalStudents, icon: Users, color: "#10B981" },
                { label: "Assessments", value: stats.totalAssessments, icon: ClipboardList, color: "#F59E0B" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assessment Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Active", value: stats.activeAssessments, bg: "#DFF9D8", fg: "#16A34A", icon: TrendingUp },
            { label: "Pending", value: stats.pendingGrading, bg: "#FEF3C7", fg: "#D97706", icon: Clock },
            { label: "Not Started", value: stats.notStarted, bg: "#F0E5FF", fg: "#9747FF", icon: FileText },
            { label: "Total", value: stats.totalAssessments, bg: "#DBE9FF", fg: "#2563EB", icon: Layers },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-center"
                style={{ backgroundColor: c.bg }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.fg}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: c.fg }} />
                  </div>
                  <span className="text-3xl font-black" style={{ color: c.fg }}>
                    {c.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{c.label} {c.label !== "Total" && "Exams"}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link
              href={routespath.TEACHER_ASSESSMENTS}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-purple-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6" style={{ color: primaryColor }} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Assessments</h3>
                <p className="text-xs text-slate-500 leading-tight">Create & grade exams</p>
              </div>
            </Link>

            <Link
              href={routespath.TEACHER_SCORES}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Enter Scores</h3>
                <p className="text-xs text-slate-500 leading-tight">Input student marks</p>
              </div>
            </Link>

            <Link
              href={routespath.TEACHER_COMMENTS}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MessageSquareText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Comments</h3>
                <p className="text-xs text-slate-500 leading-tight">Add remarks</p>
              </div>
            </Link>

            <Link
              href={routespath.TEACHER_REPORTS}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-orange-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Reports</h3>
                <p className="text-xs text-slate-500 leading-tight">Download cards</p>
              </div>
            </Link>

            <Link
              href={routespath.TEACHER_CLASSES}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-cyan-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Classes</h3>
                <p className="text-xs text-slate-500 leading-tight">View groups</p>
              </div>
            </Link>

            <Link
              href={routespath.TEACHER_CLASSES}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-rose-200 transition-all flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1">Students</h3>
                <p className="text-xs text-slate-500 leading-tight">View directory</p>
              </div>
            </Link>
          </div>

          {/* Recent Assessments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Assessments</h3>
              <Link
                href={routespath.TEACHER_ASSESSMENTS}
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-5 text-center">
                  <div
                    className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-200"
                    style={{ borderTopColor: primaryColor }}
                  />
                </div>
              ) : recentAssessments.length === 0 ? (
                <div className="p-5 text-center text-slate-500 text-sm">
                  No assessments yet. Create your first one!
                </div>
              ) : (
                recentAssessments.map((assessment: any, idx) => {
                  const status = assessment.status || "not_started";
                  const statusStyle = getStatusColor(status);
                  return (
                    <Link
                      key={assessment.id || idx}
                      href={`${routespath.TEACHER_ASSESSMENTS}/${assessment.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{assessment.title}</p>
                        <p className="text-xs text-slate-500">
                          {assessment.subject?.name || "Subject"} • {assessment.totalMarks || 100} marks
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                        <span className={`text-xs font-medium ${statusStyle.text}`}>
                          {status === "started" ? "Active" : status === "ended" ? "Ended" : "Draft"}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
