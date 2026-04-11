"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchClasses,
  fetchAssessments,
  fetchSubjects,
  deleteAssessment,
  createAssessment,
  fetchAssessmentCategoriesMap,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Calculator,
  BookOpen,
  FileText,
  Target,
  Filter,
  AlertCircle,
  Eye,
  Settings,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { ManageCategoriesDialog } from "./ManageCategoriesDialog";
import { ProductTour } from "@/components/common/ProductTour";

const assessmentTourSteps = [
  {
    target: '.assessments-info-banner',
    title: "Assessments Overview",
    content: "Assessments are created by teachers — your role here is to monitor and oversee all school-wide exam activity across classes and subjects.",
    disableBeacon: true,
  },
  {
    target: '.assessments-manage-categories-btn',
    title: "Manage Categories",
    content: "Click here to define your school's assessment categories (e.g., CA, Exam, Project). These categories are what teachers use when creating assessments.",
  },
  {
    target: '.assessments-filter-bar',
    title: "Monitor Academic Progress",
    content: "Use these filters to drill into assessments by class, status, or type to monitor teacher activity across the school.",
  },
];

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
const getStatusStyle = (status?: string) => {
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

  const { assessmentCategories } = useSelector((s: RootState) => s.admin);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    classIds: [] as string[],   // multi-class
    subjectNames: [] as string[], // de-duplicated subject names across selected classes
    categoryId: "",
    totalMarks: "",
    passingMarks: "",
    isOnline: false,
    durationMins: "",
    term: "",
    instructions: "",
    startsAt: "",
    endsAt: "", // explicit end date
  });

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchClasses(undefined));
    dispatch(fetchSubjects());
    dispatch(getTenantInfo());
    dispatch(fetchAssessmentCategoriesMap());
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAdminSuccess());
    }
  }, [error, success]);

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

  // New model: subjects have classSubjects[] instead of classId
  // Build flat list of { subjectId, subjectName, classId, classSubjectId } for selected classes
  const subjectsInSelectedClasses = useMemo(() => {
    if (form.classIds.length === 0) return [];
    const flat: Array<{ subjectId: string; name: string; classId: string; classSubjectId: string }> = [];
    for (const s of subjects) {
      const cs: any[] = s.classSubjects || [];
      for (const c of cs) {
        if (form.classIds.includes(c.classId)) {
          flat.push({ subjectId: s.id, name: s.name, classId: c.classId, classSubjectId: c.id });
        }
      }
      // Legacy fallback: subject has direct classId
      if (cs.length === 0 && s.classId && form.classIds.includes(s.classId)) {
        flat.push({ subjectId: s.id, name: s.name, classId: s.classId, classSubjectId: "" });
      }
    }
    return flat;
  }, [subjects, form.classIds]);

  // De-duplicated subject names across all selected classes (sorted)
  const uniqueSubjectNames = useMemo(() => {
    const names = new Set<string>();
    subjectsInSelectedClasses.forEach((s) => names.add(s.name));
    return Array.from(names).sort();
  }, [subjectsInSelectedClasses]);

  // How many of the selected classes have each subject name
  const subjectClassCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const name of uniqueSubjectNames) {
      counts[name] = subjectsInSelectedClasses.filter((s) => s.name === name).length;
    }
    return counts;
  }, [uniqueSubjectNames, subjectsInSelectedClasses]);

  const resetForm = () => {
    setForm({ title: "", classIds: [], subjectNames: [], categoryId: "", totalMarks: "", passingMarks: "", isOnline: false, durationMins: "", term: "", instructions: "", startsAt: "", endsAt: "" });
  };

  const handleCreateAssessment = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (form.classIds.length === 0) return toast.error("Please select at least one class");
    if (form.subjectNames.length === 0) return toast.error("Select at least one subject");
    if (!form.startsAt) return toast.error("Start date is required");

    // Build pairs from new model flat list (classSubjectId included)
    const pairs = subjectsInSelectedClasses.filter((s) => form.subjectNames.includes(s.name));
    if (pairs.length === 0) return toast.error("No matching subjects found for the selected classes");

    setCreating(true);
    try {
      const created = await Promise.all(
        pairs.map(({ classId, subjectId, classSubjectId }) => {
          const start = new Date(form.startsAt);
          const duration = form.durationMins ? Number(form.durationMins) : 60;
          
          // Use explicit end date if provided, otherwise calculate it
          const end = form.endsAt ? new Date(form.endsAt) : new Date(start.getTime() + duration * 60000);

          return dispatch(createAssessment({
            title: form.title.trim(),
            classSubjectIds: classSubjectId ? [classSubjectId] : [],
            categoryId: form.categoryId || undefined,
            totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
            passingMarks: form.passingMarks ? Number(form.passingMarks) : undefined,
            isOnline: form.isOnline,
            duration,
            durationMins: duration,
            term: form.term || undefined,
            instructions: form.instructions || undefined,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            questions: [],
          })).unwrap();
        })
      );

      toast.success(`${pairs.length} assessment${pairs.length > 1 ? "s" : ""} created successfully`);
      resetForm();
      setShowCreateModal(false);
      dispatch(fetchAssessments());
    } catch (e: any) {
      toast.error(e || "Failed to create assessment(s)");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      try {
        await dispatch(deleteAssessment(id)).unwrap();
        // toast is handled by success/error in useEffect, but we could add one here if needed
      } catch (error) {
        // error handling is managed by useEffect
      }
    }
  };

  return (
    <div className="w-full">
      <ProductTour tourKey="admin_assessments" steps={assessmentTourSteps} />
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">Assessments Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            Create and monitor assessments across all classes and subjects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ManageCategoriesDialog>
            <Button variant="outline" className="assessments-manage-categories-btn gap-2 border-slate-200 shadow-sm">
              <Settings className="w-4 h-4" /> Manage Categories
            </Button>
          </ManageCategoriesDialog>
          <Button
            className="gap-2 text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" /> Create Assessment
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="assessments-info-banner bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Assessment Management</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Create assessments for one or more subjects at once by selecting a class and checking the subjects. Teachers can also create assessments from their dashboard.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="assessments-filter-bar flex flex-col md:flex-row gap-3 mb-6">
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
      {loading && assessments.length === 0 ? (
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
            const statusStyle = getStatusStyle(assessment.status);
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem 
                        onClick={() => handleDelete(assessment.id)}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      {(assessment as any)._count?.submissions ?? 
                       (assessment as any).submittedCount ?? 
                       (assessment as any).submissionCount ?? "—"}
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
                      {assessment.durationMins ?? assessment.duration ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Minutes</p>
                  </div>
                </div>

                {/* View Details Button */}
                <Link href={`/RMS/assessments/${assessment.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-xl border-slate-200 text-sm font-medium gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </Link>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No assessments found</p>
              <p className="text-slate-400 text-sm mt-1">
                Create an assessment or wait for teachers to create them.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); resetForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Assessments</h2>
                <p className="text-sm text-slate-500 mt-0.5">Select multiple classes and subjects — one assessment is created per matching pair</p>
              </div>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body — wider modal, 3 columns: details | classes | subjects */}
            <div className="px-6 py-5 overflow-y-auto flex-1 grid grid-cols-3 gap-5">

              {/* Col 1 — assessment details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Assessment Title <span className="text-red-500">*</span></label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. First Term Exam" className="mt-2 h-10 rounded-xl text-sm" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
                    <SelectTrigger className="mt-2 h-10 rounded-xl text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="rounded-xl z-[99999]">
                      {assessmentCategories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Total Marks</label>
                    <Input type="number" min={0} value={form.totalMarks} onChange={(e) => setForm((p) => ({ ...p, totalMarks: e.target.value }))} placeholder="100" className="mt-2 h-10 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Pass Mark</label>
                    <Input type="number" min={0} value={form.passingMarks} onChange={(e) => setForm((p) => ({ ...p, passingMarks: e.target.value }))} placeholder="50" className="mt-2 h-10 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Duration (mins)</label>
                    <Input type="number" min={0} value={form.durationMins} onChange={(e) => setForm((p) => ({ ...p, durationMins: e.target.value }))} placeholder="60" className="mt-2 h-10 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Term</label>
                    <Select value={form.term} onValueChange={(v) => setForm((p) => ({ ...p, term: v }))}>
                      <SelectTrigger className="mt-2 h-10 rounded-xl text-sm"><SelectValue placeholder="Term" /></SelectTrigger>
                      <SelectContent className="rounded-xl z-[99999]">
                        <SelectItem value="1st Term">1st Term</SelectItem>
                        <SelectItem value="2nd Term">2nd Term</SelectItem>
                        <SelectItem value="3rd Term">3rd Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Start Date <span className="text-red-500">*</span></label>
                    <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} className="mt-2 h-10 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">End Date</label>
                    <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} className="mt-2 h-10 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Checkbox id="isOnline" checked={form.isOnline} onCheckedChange={(v) => setForm((p) => ({ ...p, isOnline: !!v }))} />
                  <label htmlFor="isOnline" className="text-sm font-medium text-slate-700 cursor-pointer">Online (CBT)</label>
                </div>
              </div>

              {/* Col 2 — multi-class select */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Classes <span className="text-red-500">*</span>
                    {form.classIds.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal text-slate-500">({form.classIds.length})</span>
                    )}
                  </label>
                  {form.classIds.length > 0 && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, classIds: [], subjectNames: [] }))} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
                  <label className="flex items-center gap-3 px-3 py-2 cursor-pointer bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors">
                    <Checkbox
                      checked={form.classIds.length === classes.length && classes.length > 0}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, classIds: v ? classes.map((c) => c.id) : [], subjectNames: [] }))
                      }
                    />
                    <span className="text-xs font-semibold text-slate-700">Select All</span>
                  </label>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {classes.map((c) => (
                      <label key={c.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <Checkbox
                          checked={form.classIds.includes(c.id)}
                          onCheckedChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              classIds: v ? [...p.classIds, c.id] : p.classIds.filter((id) => id !== c.id),
                              subjectNames: [], // reset subjects when classes change
                            }))
                          }
                        />
                        <span className="text-sm text-slate-800">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 3 — subject names (de-duplicated across selected classes) */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Subjects <span className="text-red-500">*</span>
                    {form.subjectNames.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal text-slate-500">({form.subjectNames.length})</span>
                    )}
                  </label>
                  {form.subjectNames.length > 0 && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, subjectNames: [] }))} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                  )}
                </div>

                {form.classIds.length === 0 ? (
                  <div className="border border-slate-200 rounded-xl flex items-center justify-center flex-1 text-xs text-slate-400 text-center px-3">
                    Select classes first
                  </div>
                ) : uniqueSubjectNames.length === 0 ? (
                  <div className="border border-slate-200 rounded-xl flex items-center justify-center flex-1 text-xs text-slate-400 text-center px-3">
                    No subjects in selected classes
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
                    <label className="flex items-center gap-3 px-3 py-2 cursor-pointer bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors">
                      <Checkbox
                        checked={form.subjectNames.length === uniqueSubjectNames.length}
                        onCheckedChange={(v) =>
                          setForm((p) => ({ ...p, subjectNames: v ? [...uniqueSubjectNames] : [] }))
                        }
                      />
                      <span className="text-xs font-semibold text-slate-700">Select All</span>
                    </label>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {uniqueSubjectNames.map((name) => (
                        <label key={name} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                          <Checkbox
                            checked={form.subjectNames.includes(name)}
                            onCheckedChange={(v) =>
                              setForm((p) => ({
                                ...p,
                                subjectNames: v ? [...p.subjectNames, name] : p.subjectNames.filter((n) => n !== name),
                              }))
                            }
                          />
                          <span className="text-sm text-slate-800 flex-1">{name}</span>
                          {subjectClassCount[name] > 1 && (
                            <span className="text-xs text-slate-400 shrink-0">{subjectClassCount[name]} classes</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50 flex-shrink-0">
              <p className="text-xs text-slate-400">
                {form.classIds.length > 0 && form.subjectNames.length > 0
                  ? (() => {
                      let count = 0;
                      for (const classId of form.classIds) {
                        count += subjects.filter((s: any) => {
                          const cs: any[] = s.classSubjects || [];
                          const matchesClass = cs.some(c => c.classId === classId) || s.classId === classId;
                          return matchesClass && form.subjectNames.includes(s.name);
                        }).length;
                      }
                      return `${count} assessment${count !== 1 ? "s" : ""} will be created`;
                    })()
                  : "Select classes and subjects to see count"}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} className="h-11 px-6 rounded-xl">Cancel</Button>
                <Button
                  onClick={handleCreateAssessment}
                  disabled={creating}
                  className="h-11 px-6 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {creating ? "Creating..." : "Create Assessments"}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
