"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchClasses,
  fetchAssessments,
  fetchSubjects,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  Calculator,
  BookOpen,
  FileText,
  Users,
  Target,
  Filter,
  AlertCircle,
  Eye,
  Settings,
} from "lucide-react";
import { ManageCategoriesDialog } from "./ManageCategoriesDialog";

const DEFAULT_PRIMARY = "#641BC4";

// Assessment icon based on subject
const getAssessmentIcon = (subjectName: string) => {
  const name = (subjectName || "").toLowerCase();
  if (name.includes("math")) return Calculator;
  if (name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")) return Target;
  if (name.includes("english") || name.includes("literature")) return BookOpen;
  return FileText;
};

// Get status color
const getStatusStyle = (status?: string, isOnline?: boolean) => {
  if (status === "started" || status === "active") {
    return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" };
  }
  if (status === "ended") {
    return { bg: "bg-slate-100", text: "text-slate-600", label: "Ended" };
  }
  if (status === "pending" || status === "not_started") {
    return { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" };
  }
  return { bg: "bg-purple-50", text: "text-purple-700", label: "Draft" };
};

// Get icon background color
const getIconBg = (subjectName: string) => {
  const name = (subjectName || "").toLowerCase();
  if (name.includes("math")) return "bg-violet-100 text-violet-600";
  if (name.includes("physics")) return "bg-blue-100 text-blue-600";
  if (name.includes("english") || name.includes("history")) return "bg-rose-100 text-rose-600";
  if (name.includes("geo")) return "bg-emerald-100 text-emerald-600";
  return "bg-slate-100 text-slate-600";
};

export function AdminAssessmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, classes, subjects, loading, error, success } = useSelector(
    (s: RootState) => s.admin
  );
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchClasses(undefined));
    dispatch(fetchSubjects());
    dispatch(getTenantInfo());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAdminSuccess());
    }
  }, [error, success, dispatch]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classes) map.set(c.id, c.name);
    return map;
  }, [classes]);

  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) map.set(s.id, s.name);
    return map;
  }, [subjects]);

  const filtered = useMemo(() => {
    let result = assessments;

    if (statusFilter !== "all") {
      result = result.filter((a) => {
        if (statusFilter === "active") return a.status === "started" || a.status === "active";
        if (statusFilter === "draft") return a.status === "not_started" || !a.status;
        if (statusFilter === "ended") return a.status === "ended";
        return true;
      });
    }

    if (typeFilter !== "all") {
      result = result.filter((a) => (typeFilter === "online" ? a.isOnline : !a.isOnline));
    }

    if (classFilter !== "all") {
      result = result.filter((a) => a.classId === classFilter);
    }

    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(term) ||
          (subjectNameById.get(a.subjectId || "") || "").toLowerCase().includes(term)
      );
    }

    return result;
  }, [assessments, statusFilter, typeFilter, classFilter, q, subjectNameById]);

  return (
    <div className="w-full">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">Assessments Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            View all assessments created by teachers. Assessments are managed by teachers only.
          </p>
        </div>
        <ManageCategoriesDialog>
          <Button variant="outline" className="gap-2 border-slate-200 shadow-sm">
            <Settings className="w-4 h-4" /> Manage Categories
          </Button>
        </ManageCategoriesDialog>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Assessment Management</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Assessments and scores are created and managed by teachers. As an admin, you can view all assessments 
            and monitor progress. To create an assessment, assign a teacher to a subject first.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search assessments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-200 bg-white shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Assessments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{assessments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {assessments.filter((a) => a.status === "started" || a.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {assessments.filter((a) => a.status === "not_started" || !a.status).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Completed</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">
            {assessments.filter((a) => a.status === "ended").length}
          </p>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
              style={{ borderTopColor: primaryColor }}
            />
            <p className="text-slate-500 font-medium">Loading assessments...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((assessment) => {
            const subjectName = subjectNameById.get(assessment.subjectId || "") || "Subject";
            const className = classNameById.get(assessment.classId || "") || "Class";
            const statusStyle = getStatusStyle(assessment.status, assessment.isOnline);
            const Icon = getAssessmentIcon(subjectName);
            const iconBg = getIconBg(subjectName);

            return (
              <div
                key={assessment.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{assessment.title}</h3>
                      <p className="text-sm text-slate-500">
                        {subjectName} • {className}
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-4 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </Badge>
                    <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${assessment.isOnline !== false ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                      {assessment.isOnline !== false ? "Online" : "Offline"}
                    </Badge>
                    {assessment.session && (
                      <span className="text-xs text-slate-400 font-medium tracking-wide">• {assessment.session}</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {(assessment as any).submittedCount ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Submitted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {assessment.totalMarks ? `${assessment.totalMarks}` : "—"}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total Marks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {assessment.duration || "—"}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Minutes</p>
                  </div>
                </div>

                {/* View Only Button */}
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl border-slate-200 text-sm font-medium gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No assessments found</p>
              <p className="text-slate-400 text-sm mt-1">
                Assessments will appear here once teachers create them.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
