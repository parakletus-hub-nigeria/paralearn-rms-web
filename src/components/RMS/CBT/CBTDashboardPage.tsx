"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAssessments, fetchClasses, fetchSubjects } from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MonitorCheck,
  BookOpen,
  BarChart3,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileQuestion,
  ChevronRight,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import { format } from "date-fns";

const DEFAULT_PRIMARY = "#641BC4";

const getStatusStyle = (status?: string) => {
  if (status === "started" || status === "active")
    return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" };
  if (status === "ended")
    return { bg: "bg-slate-100", text: "text-slate-600", label: "Ended" };
  return { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" };
};

export function CBTDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, classes, subjects, loading } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchClasses(undefined));
    dispatch(fetchSubjects());
    dispatch(getTenantInfo());
  }, []);

  const cbtExams = useMemo(
    () => assessments.filter((a: any) => a.isOnline === true || a.isOnline === "true"),
    [assessments],
  );

  const totalQuestions = useMemo(
    () => cbtExams.reduce((sum: number, a: any) => sum + (a.questionCount ?? a._count?.questions ?? 0), 0),
    [cbtExams],
  );

  const activeCount = cbtExams.filter(
    (a: any) => a.status === "started" || a.status === "active",
  ).length;

  const completedCount = cbtExams.filter((a: any) => a.status === "ended").length;

  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) map.set(s.id, s.name);
    return map;
  }, [subjects]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classes) map.set(c.id, c.name);
    return map;
  }, [classes]);

  const noSetup = classes.length === 0 && !loading;
  const recentExams = cbtExams.slice(0, 5);

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica flex items-center gap-2">
            <MonitorCheck className="w-6 h-6" style={{ color: primaryColor }} />
            CBT Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage computer-based exams, question banks, and results for your school.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={routespath.CBT_QUESTION_BANK}>
            <Button variant="outline" className="gap-2 border-slate-200 shadow-sm h-10">
              <BookOpen className="w-4 h-4" />
              Question Bank
            </Button>
          </Link>
          <Link href={routespath.CBT_EXAMS}>
            <Button className="gap-2 text-white shadow-sm h-10" style={{ backgroundColor: primaryColor }}>
              <Plus className="w-4 h-4" />
              New Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Setup banner — shown when school has no classes yet */}
      {noSetup && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">School setup incomplete</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You need to create classes and subjects in the RMS before setting up CBT exams.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={routespath.CLASSES}>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                Setup Classes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Exams", value: cbtExams.length, icon: MonitorCheck, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Active Now", value: activeCount, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "Total Questions", value: totalQuestions, icon: FileQuestion, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "—" : stat.value}
            </p>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            href: routespath.CBT_EXAMS,
            icon: MonitorCheck,
            title: "Manage Exams",
            desc: "Create, publish, and configure CBT exams for your classes.",
            color: "bg-violet-50 border-violet-200",
            iconColor: "text-violet-600",
          },
          {
            href: routespath.CBT_QUESTION_BANK,
            icon: BookOpen,
            title: "Question Bank",
            desc: "Build your question library. Add individually or bulk upload.",
            color: "bg-blue-50 border-blue-200",
            iconColor: "text-blue-600",
          },
          {
            href: routespath.CBT_RESULTS,
            icon: BarChart3,
            title: "View Results",
            desc: "Review scores, rankings, and per-student breakdowns.",
            color: "bg-emerald-50 border-emerald-200",
            iconColor: "text-emerald-600",
          },
        ].map((card) => (
          <Link key={card.href} href={card.href}>
            <div className={`rounded-2xl border p-5 hover:shadow-md transition-all cursor-pointer ${card.color}`}>
              <div className="flex items-start justify-between">
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="font-bold text-slate-900 mt-3">{card.title}</p>
              <p className="text-sm text-slate-600 mt-1">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent CBT Exams</h2>
          <Link href={routespath.CBT_EXAMS}>
            <button className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {loading && cbtExams.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200"
              style={{ borderTopColor: primaryColor }}
            />
          </div>
        ) : recentExams.length === 0 ? (
          <div className="py-12 text-center">
            <MonitorCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No CBT exams yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first exam to get started.</p>
            <Link href={routespath.CBT_EXAMS}>
              <Button className="mt-4 gap-2 text-white" style={{ backgroundColor: primaryColor }}>
                <Plus className="w-4 h-4" /> Create Exam
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentExams.map((exam: any) => {
              const statusStyle = getStatusStyle(exam.status);
              const subjectName = subjectNameById.get(exam.subjectId || "") || "—";
              const className = classNameById.get(exam.classId || "") || "—";
              return (
                <Link key={exam.id} href={`/RMS/cbt/exams/${exam.id}`}>
                  <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                      <MonitorCheck className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{exam.title}</p>
                      <p className="text-sm text-slate-500">{subjectName} • {className}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </Badge>
                      {exam.startsAt && (
                        <span className="text-xs text-slate-400 hidden md:block">
                          {format(new Date(exam.startsAt), "MMM d, yyyy")}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {exam.questionCount ?? exam._count?.questions ?? 0} Qs
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
