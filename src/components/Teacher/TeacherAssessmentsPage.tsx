"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  createTeacherAssessment,
  fetchMyAssessments,
  fetchTeacherClasses,
  fetchClassSubjects,
  fetchAcademicCurrent,
  fetchAssessmentCategories,
  updateTeacherAssessment,
} from "@/reduxToolKit/teacher/teacherThunks";
import { generateTemplate } from "@/lib/templates";
import { useSessionsAndTerms } from "@/hooks/useSessionsAndTerms";

import { TeacherHeader } from "./TeacherHeader";
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
  Plus,
  MoreVertical,
  Calendar,
  Users,
  Clock,
  FileText,
  Edit,
  BarChart3,
  X,
  BookOpen,
  ClipboardList,
  Grid3X3,
  List,
  Filter,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Download,
  Upload,
  Sparkles,
  Send,
} from "lucide-react";
import { routespath } from "@/lib/routepath";
import { toast } from "sonner";

const DEFAULT_PRIMARY = "#641BC4";

const statusConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
  started: { bg: "bg-emerald-100", text: "text-emerald-700", icon: PlayCircle, label: "Active" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700", icon: PlayCircle, label: "Active" },
  ended: { bg: "bg-slate-100", text: "text-slate-600", icon: CheckCircle, label: "Ended" },
  not_started: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Not Started" },
  draft: { bg: "bg-slate-100", text: "text-slate-600", icon: FileText, label: "Draft" },
};

export function TeacherAssessmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, teacherClasses, academicCurrent, assessmentCategories, loading } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    classId: "",
    subjectId: "",
    categoryId: "",
    totalMarks: "100",
    duration: "60",
    session: "",
    term: "First Term",
    isOnline: "false",
    startsAt: "",
    endsAt: "",
    instructions: "",
    questions: [] as any[],
  });

  // Question Builder State
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "MCQ",
    marks: "1",
    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
    correctAnswer: "",
  });

  useEffect(() => {
    dispatch(fetchAcademicCurrent());
    dispatch(fetchMyAssessments());
    dispatch(fetchAssessmentCategories());
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
  }, [dispatch, user]);

  // Get dynamic session/term options
  const {
    currentSession,
    currentTerm,
  } = useSessionsAndTerms();

  // Pre-fill session from current academic (API)
  useEffect(() => {
    if (currentSession && !createForm.session) {
      setCreateForm((p) => ({ ...p, session: currentSession }));
    }
    if (currentTerm && !createForm.term) {
      setCreateForm((p) => ({ ...p, term: currentTerm }));
    }
  }, [currentSession, currentTerm, createForm.session, createForm.term]);

  // Extract unique classes
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, any>();
    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId || item.id;
      const className = item.class?.name || item.className || item.name;
      if (classId && className && !classMap.has(classId)) {
        classMap.set(classId, { id: classId, name: className });
      }
    });
    return Array.from(classMap.values());
  }, [teacherClasses]);

  // Fetch subjects when class is selected in create form
  useEffect(() => {
    if (!createForm.classId) {
      setClassSubjects([]);
      return;
    }
    setLoadingSubjects(true);
    dispatch(fetchClassSubjects(createForm.classId))
      .unwrap()
      .then((data) => setClassSubjects(data || []))
      .catch(() => setClassSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [dispatch, createForm.classId]);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    let result = assessments;

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((a: any) => a.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((a: any) => (typeFilter === "online" ? a.isOnline : !a.isOnline));
    }

    // Class filter
    if (classFilter !== "all") {
      result = result.filter((a: any) => a.classId === classFilter);
    }

    // Search
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((a: any) =>
        (a.title || "").toLowerCase().includes(term) ||
        (a.subject?.name || "").toLowerCase().includes(term)
      );
    }

    return result;
  }, [assessments, statusFilter, typeFilter, classFilter, search]);

  // Assessment stats
  const stats = useMemo(() => ({
    total: assessments.length,
    active: assessments.filter((a: any) => a.status === "started").length,
    ended: assessments.filter((a: any) => a.status === "ended").length,
    notStarted: assessments.filter((a: any) => a.status === "not_started").length,
  }), [assessments]);

  const handleCreate = async () => {
    try {
      if (!createForm.title.trim()) return toast.error("Title is required");
      if (!createForm.classId) return toast.error("Please select a class");
      if (!createForm.subjectId) return toast.error("Please select a subject");
      if (!createForm.categoryId) return toast.error("Please select a category");
      if (!createForm.startsAt) return toast.error("Start date is required");
      if (!createForm.endsAt) return toast.error("End date is required");

      // if (createForm.isOnline === "true" && createForm.questions.length === 0) {
      //   return toast.error("Online assessments must have at least one question");
      // }

      await dispatch(
        createTeacherAssessment({
          title: createForm.title.trim(),
          classId: createForm.classId,
          subjectId: createForm.subjectId,
          categoryId: createForm.categoryId,
          totalMarks: createForm.totalMarks ? Number(createForm.totalMarks) : 100,
          duration: createForm.duration ? Number(createForm.duration) : 60,
          session: createForm.session || currentSession || "2024/2025",
          term: createForm.term,
          assessmentType: createForm.isOnline === "true" ? "online" : "offline",
          startsAt: createForm.startsAt ? new Date(createForm.startsAt).toISOString() : undefined,
          endsAt: createForm.endsAt ? new Date(createForm.endsAt).toISOString() : undefined,
          instructions: createForm.instructions,
          questions: createForm.isOnline === "true" ? createForm.questions : [],
        })
      ).unwrap();

      toast.success("Assessment created successfully");
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        classId: "",
        subjectId: "",
        categoryId: "",
        totalMarks: "100",
        duration: "60",
        session: currentSession || "",
        term: currentTerm || "",
        isOnline: "false",
        startsAt: "",
        endsAt: "",
        instructions: "",
        questions: [],
      });
      dispatch(fetchMyAssessments());
    } catch (e: any) {
      toast.error(e || "Failed to create assessment");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await dispatch(updateTeacherAssessment({ id, data: { status: "started" } })).unwrap();
      if (res) {
        toast.success("Assessment published and is now active!");
        dispatch(fetchMyAssessments());
      }
    } catch (e: any) {
      toast.error(e || "Failed to publish assessment");
    }
  };

  const addQuestion = () => {
    if (!newQuestion.text) return toast.error("Question text is required");
    setCreateForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion, id: Date.now() }]
    }));
    setNewQuestion({
      text: "",
      type: "MCQ",
      marks: "1",
      options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
      correctAnswer: "",
    });
  };

  const removeQuestion = (idx: number) => {
    setCreateForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const getClassName = (classId: string) => {
    const cls = uniqueClasses.find((c: any) => c.id === classId);
    return cls?.name || "Unknown";
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.draft;
  };

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-coolvetica">Assessment Management</h1>
              <p className="text-purple-200 mt-1 font-coolvetica">
                Create, manage, and grade your assessments
              </p>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-12 px-6 rounded-xl bg-white text-purple-600 hover:bg-purple-50 font-semibold gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Assessment
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Total", value: stats.total, color: "bg-white/20" },
              { label: "Active", value: stats.active, color: "bg-emerald-500/30" },
              { label: "Not Started", value: stats.notStarted, color: "bg-amber-500/30" },
              { label: "Ended", value: stats.ended, color: "bg-slate-500/30" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} rounded-xl px-4 py-3 backdrop-blur-sm`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-purple-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search assessments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl border-slate-200"
              />
            </div>

            {/* Class Filter */}
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="started">Active</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 w-[120px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200"
              style={{ borderTopColor: primaryColor }}
            />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Assessments Found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-4">
              {search || statusFilter !== "all" || classFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first assessment to get started."}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-11 px-6 rounded-xl text-white font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map((assessment: any, idx: number) => {
              const status = assessment.status || "draft";
              const statusStyle = getStatusConfig(status);
              const StatusIcon = statusStyle.icon;
              const duration = assessment.duration || 30;

              return (
                <div
                  key={assessment.id || idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <ClipboardList className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <Badge className={`rounded-lg ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusStyle.label}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4" />
                      {assessment.subject?.name || "Subject"} • {getClassName(assessment.classId)}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center py-3 border-y border-slate-100">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {assessment.totalMarks || 100}
                        </p>
                        <p className="text-xs text-slate-500">Marks</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{duration}m</p>
                        <p className="text-xs text-slate-500">Duration</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {assessment.submissionCount || 0}
                        </p>
                        <p className="text-xs text-slate-500">Submitted</p>
                      </div>
                    </div>
                  </div>

                    {/* Card Footer */}
                  <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {assessment.isOnline ? (
                      <>
                      <Link
                         href={`/teacher/question-drafting?assessmentId=${assessment.id}`}
                         className="flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors col-span-2 mb-1"
                      >
                         <Sparkles className="w-4 h-4 text-purple-600" />
                         Draft Questions
                      </Link>
                      {status === "not_started" && (
                        <Button
                          onClick={() => handlePublish(assessment.id)}
                          className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold text-white transition-colors col-span-2"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Send className="w-4 h-4" />
                          Publish Assessment
                        </Button>
                      )}
                      </>
                    ) : (
                        <>
                        <Link
                        href={`${routespath.TEACHER_ASSESSMENTS}/${assessment.id}`}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                        <Edit className="w-4 h-4" />
                        Edit
                        </Link>
                        <Link
                        href={`${routespath.TEACHER_SCORES}?assessmentId=${assessment.id}`}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: primaryColor }}
                        >
                        <BarChart3 className="w-4 h-4" />
                        Grade
                        </Link>
                        </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-4 px-5 text-sm font-semibold text-slate-600">Assessment</th>
                  <th className="text-left py-4 px-3 text-sm font-semibold text-slate-600">Class</th>
                  <th className="text-center py-4 px-3 text-sm font-semibold text-slate-600">Marks</th>
                  <th className="text-center py-4 px-3 text-sm font-semibold text-slate-600">Duration</th>
                  <th className="text-center py-4 px-3 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment: any, idx: number) => {
                  const status = assessment.status || "draft";
                  const statusStyle = getStatusConfig(status);

                  return (
                    <tr
                      key={assessment.id || idx}
                      className={`border-b border-slate-100 last:border-0 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${primaryColor}15` }}
                          >
                            <ClipboardList className="w-5 h-5" style={{ color: primaryColor }} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{assessment.title}</p>
                            <p className="text-sm text-slate-500">{assessment.subject?.name || "Subject"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-slate-600">{getClassName(assessment.classId)}</td>
                      <td className="py-4 px-3 text-center font-semibold">{assessment.totalMarks || 100}</td>
                      <td className="py-4 px-3 text-center">{assessment.duration || 30}m</td>
                      <td className="py-4 px-3 text-center">
                        <Badge className={`rounded ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                          {assessment.isOnline ? (
                             <div className="flex items-center gap-2">
                                <Link href={`/teacher/question-drafting?assessmentId=${assessment.id}`}>
                                    <Button variant="outline" size="sm" className="rounded-lg h-9 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Questions
                                    </Button>
                                </Link>
                                {status === "not_started" && (
                                    <Button 
                                        onClick={() => handlePublish(assessment.id)}
                                        size="sm" 
                                        className="rounded-lg h-9 text-white" 
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Send className="w-4 h-4 mr-1" />
                                        Publish
                                    </Button>
                                )}
                             </div>
                          ) : (
                             <Link href={`${routespath.TEACHER_ASSESSMENTS}/${assessment.id}`}>
                                <Button variant="outline" size="sm" className="rounded-lg h-9">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                                </Button>
                             </Link>
                          )}
                          <Link href={`${routespath.TEACHER_SCORES}?assessmentId=${assessment.id}`}>
                            <Button size="sm" className="rounded-lg h-9 text-white" style={{ backgroundColor: primaryColor }}>
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Grade
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: `${primaryColor}10` }}>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Assessment</h2>
                <p className="text-sm text-slate-500 mt-0.5">Create a quiz, exam, or homework</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-white/50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-slate-700">Title *</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Mid-Term Mathematics Test"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Class *</label>
                  <Select
                    value={createForm.classId}
                    onValueChange={(v) => setCreateForm((p) => ({ ...p, classId: v, subjectId: "" }))}
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {uniqueClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Subject *</label>
                  <Select
                    value={createForm.subjectId}
                    onValueChange={(v) => setCreateForm((p) => ({ ...p, subjectId: v }))}
                    disabled={!createForm.classId || loadingSubjects}
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl">
                      <SelectValue placeholder={loadingSubjects ? "Loading..." : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classSubjects.map((subj: any) => (
                        <SelectItem key={subj.id} value={subj.id}>
                          {subj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold text-slate-700">Category *</label>
                  <Select
                    value={createForm.categoryId}
                    onValueChange={(v) => setCreateForm((p) => ({ ...p, categoryId: v }))}
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {assessmentCategories.length === 0 ? (
                         <div className="p-2 text-sm text-slate-500 text-center">
                           No categories found. Ask Admin to create them.
                         </div>
                      ) : (
                        assessmentCategories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} ({cat.weight}%)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Total Marks</label>
                  <Input
                    type="number"
                    value={createForm.totalMarks}
                    onChange={(e) => setCreateForm((p) => ({ ...p, totalMarks: e.target.value }))}
                    placeholder="100"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-semibold text-slate-700">Start Date</label>
                   <Input
                     type="datetime-local"
                     value={createForm.startsAt}
                     onChange={(e) => setCreateForm((p) => ({ ...p, startsAt: e.target.value }))}
                     className="mt-2 h-11 rounded-xl"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-slate-700">End Date</label>
                   <Input
                     type="datetime-local"
                     value={createForm.endsAt}
                     onChange={(e) => setCreateForm((p) => ({ ...p, endsAt: e.target.value }))}
                     className="mt-2 h-11 rounded-xl"
                   />
                 </div>
               </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Assessment Type</label>
                   <Select
                    value={createForm.isOnline}
                    onValueChange={(v) => setCreateForm((p) => ({ ...p, isOnline: v }))}
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="false">Offline / Paper-based</SelectItem>
                      <SelectItem value="true">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Duration (mins)</label>
                  <Input
                    type="number"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm((p) => ({ ...p, duration: e.target.value }))}
                    placeholder="60"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Instructions</label>
                <textarea
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm((p) => ({ ...p, instructions: e.target.value }))}
                  className="mt-2 w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Instructions for students..."
                />
              </div>

              {/* Online Questions Builder Removed */}
              {createForm.isOnline === "true" && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">AI Question Drafter Available</h3>
                                <p className="text-xs text-slate-500">Create the assessment first, then click "Draft Questions" to use our new AI tools.</p>
                            </div>
                        </div>
                    </div>
                </div>
              )}


            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="h-11 px-6 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="h-11 px-6 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? "Creating..." : "Create Assessment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
