"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAssessments,
  fetchSubjects,
  fetchClasses,
  addQuestion,
  deleteQuestion,
  bulkUploadQuestions,
  fetchAssessmentDetail,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
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
  Plus,
  Trash2,
  Upload,
  X,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MonitorCheck,
} from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

type Option = { text: string; isCorrect: boolean };
const EMPTY_OPTIONS: Option[] = [
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function CBTQuestionBankPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, subjects, classes, loading } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [q, setQ] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  // Expanded exams (accordion)
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());

  // Per-exam question cache (loaded on expand)
  const [examQuestions, setExamQuestions] = useState<Record<string, any[]>>({});
  const [loadingExams, setLoadingExams] = useState<Set<string>>(new Set());

  // Add question modal
  const [showAddQ, setShowAddQ] = useState(false);
  const [targetExamId, setTargetExamId] = useState<string | null>(null);
  const [addingQ, setAddingQ] = useState(false);
  const [qForm, setQForm] = useState({
    question: "",
    options: EMPTY_OPTIONS as Option[],
    points: "1",
  });

  // Bulk upload modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkExamId, setBulkExamId] = useState<string | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchSubjects());
    dispatch(fetchClasses(undefined));
    dispatch(getTenantInfo());
  }, []);

  const cbtExams = useMemo(
    () => assessments.filter((a: any) => a.isOnline === true || a.isOnline === "true"),
    [assessments],
  );

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

  const filteredExams = useMemo(() => {
    let result = cbtExams;
    if (subjectFilter !== "all") result = result.filter((a: any) => a.subjectId === subjectFilter);
    if (examFilter !== "all") result = result.filter((a: any) => a.id === examFilter);
    return result;
  }, [cbtExams, subjectFilter, examFilter]);

  const totalQuestions = useMemo(
    () => Object.values(examQuestions).reduce((sum, qs) => sum + qs.length, 0),
    [examQuestions],
  );

  const toggleExam = async (examId: string) => {
    const next = new Set(expandedExams);
    if (next.has(examId)) {
      next.delete(examId);
      setExpandedExams(next);
      return;
    }
    next.add(examId);
    setExpandedExams(next);

    // Load questions if not yet loaded
    if (!examQuestions[examId]) {
      setLoadingExams((prev) => new Set(prev).add(examId));
      try {
        const result = await dispatch(fetchAssessmentDetail(examId)).unwrap();
        const qs = (result as any)?.questions || [];
        setExamQuestions((prev) => ({ ...prev, [examId]: qs }));
      } catch {
        setExamQuestions((prev) => ({ ...prev, [examId]: [] }));
      } finally {
        setLoadingExams((prev) => {
          const s = new Set(prev);
          s.delete(examId);
          return s;
        });
      }
    }
  };

  const openAddQuestion = (examId: string) => {
    setTargetExamId(examId);
    setQForm({ question: "", options: [...EMPTY_OPTIONS.map((o) => ({ ...o }))], points: "1" });
    setShowAddQ(true);
  };

  const openBulkUpload = (examId: string) => {
    setBulkExamId(examId);
    setBulkFile(null);
    setShowBulk(true);
  };

  const handleAddQuestion = async () => {
    if (!targetExamId) return;
    if (!qForm.question.trim()) return toast.error("Question text is required");
    const filledOptions = qForm.options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) return toast.error("Add at least 2 options");
    if (!filledOptions.some((o) => o.isCorrect)) return toast.error("Mark at least one correct answer");

    setAddingQ(true);
    try {
      await dispatch(
        addQuestion({
          assessmentId: targetExamId,
          existingQuestions: examQuestions[targetExamId] || [],
          question: qForm.question.trim(),
          options: filledOptions,
          points: Number(qForm.points) || 1,
          type: "mcq",
        }),
      ).unwrap();
      toast.success("Question added");
      // Reload questions for this exam
      const result = await dispatch(fetchAssessmentDetail(targetExamId)).unwrap();
      const qs = (result as any)?.questions || [];
      setExamQuestions((prev) => ({ ...prev, [targetExamId]: qs }));
      setShowAddQ(false);
    } catch (e: any) {
      toast.error(e || "Failed to add question");
    } finally {
      setAddingQ(false);
    }
  };

  const handleDeleteQuestion = async (examId: string, questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await dispatch(deleteQuestion({ assessmentId: examId, questionId })).unwrap();
      setExamQuestions((prev) => ({
        ...prev,
        [examId]: (prev[examId] || []).filter((q) => q.id !== questionId),
      }));
      toast.success("Question deleted");
    } catch (e: any) {
      toast.error(e || "Failed to delete question");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkExamId || !bulkFile) return toast.error("Select a file first");
    setUploading(true);
    try {
      await dispatch(bulkUploadQuestions({ assessmentId: bulkExamId, file: bulkFile })).unwrap();
      toast.success("Questions uploaded successfully");
      // Reload
      const result = await dispatch(fetchAssessmentDetail(bulkExamId)).unwrap();
      const qs = (result as any)?.questions || [];
      setExamQuestions((prev) => ({ ...prev, [bulkExamId]: qs }));
      setShowBulk(false);
      setBulkFile(null);
    } catch (e: any) {
      toast.error(e || "Failed to upload questions");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <Header schoolLogo={tenantInfo?.logoUrl} schoolName={tenantInfo?.name || "ParaLearn School"} />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica flex items-center gap-2">
            <BookOpen className="w-6 h-6" style={{ color: primaryColor }} />
            Question Bank
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, add, and manage questions across all CBT exams. Questions belong to an exam — you can reuse by copying.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">{cbtExams.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-0.5">CBT Exams</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">
            {cbtExams.reduce((sum: number, a: any) => sum + (a.questionCount ?? a._count?.questions ?? 0), 0)}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-0.5">Total Questions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center md:block hidden">
          <p className="text-2xl font-bold text-slate-900">{subjects.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-0.5">Subjects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by exam title or subject..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="h-11 w-full md:w-[180px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Exam accordion list */}
      {loading && cbtExams.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200" style={{ borderTopColor: primaryColor }} />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No CBT exams found</p>
          <p className="text-slate-400 text-sm mt-1">Create a CBT exam first, then add questions here.</p>
          <Link href="/RMS/cbt/exams">
            <Button className="mt-4 gap-2 text-white" style={{ backgroundColor: primaryColor }}>
              <Plus className="w-4 h-4" /> Create Exam
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExams
            .filter((exam: any) => {
              const term = q.trim().toLowerCase();
              if (!term) return true;
              return (
                (exam.title || "").toLowerCase().includes(term) ||
                (subjectNameById.get(exam.subjectId || "") || "").toLowerCase().includes(term)
              );
            })
            .map((exam: any) => {
              const isOpen = expandedExams.has(exam.id);
              const isLoadingQ = loadingExams.has(exam.id);
              const questions = examQuestions[exam.id] || [];
              const subjectName = subjectNameById.get(exam.subjectId || "") || "—";
              const className = classNameById.get(exam.classId || "") || "—";
              const qCount = isOpen ? questions.length : (exam.questionCount ?? exam._count?.questions ?? 0);

              return (
                <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Exam header row */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleExam(exam.id)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                      <MonitorCheck className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{exam.title}</p>
                      <p className="text-sm text-slate-500">{subjectName} • {className}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 bg-violet-50 text-violet-700">
                        {qCount} Q{qCount !== 1 ? "s" : ""}
                      </Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); openBulkUpload(exam.id); }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Bulk upload"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openAddQuestion(exam.id); }}
                        className="p-1.5 rounded-lg border hover:text-white transition-colors text-white"
                        style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                        title="Add question"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Questions list */}
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      {isLoadingQ ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-[3px] border-slate-200" style={{ borderTopColor: primaryColor }} />
                        </div>
                      ) : questions.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-sm text-slate-400">No questions yet.</p>
                          <div className="flex gap-2 justify-center mt-3">
                            <Button size="sm" variant="outline" onClick={() => openBulkUpload(exam.id)} className="gap-1.5 h-8">
                              <Upload className="w-3.5 h-3.5" /> Bulk Upload
                            </Button>
                            <Button size="sm" onClick={() => openAddQuestion(exam.id)} className="gap-1.5 h-8 text-white" style={{ backgroundColor: primaryColor }}>
                              <Plus className="w-3.5 h-3.5" /> Add Question
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {questions.map((q: any, idx: number) => (
                            <div key={q.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-slate-50/30">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">{q.question || q.content || q.text}</p>
                                {(q.options || q.choices || []).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {(q.options || q.choices || []).map((opt: any, oi: number) => (
                                      <span
                                        key={opt.id || oi}
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                                          opt.isCorrect
                                            ? "bg-emerald-50 text-emerald-700 font-medium"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {opt.isCorrect && <CheckCircle2 className="w-3 h-3" />}
                                        {String.fromCharCode(65 + oi)}. {opt.text || opt.content}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {q.points && <span className="text-xs text-slate-400">{q.points}pt</span>}
                                <button
                                  onClick={() => handleDeleteQuestion(exam.id, q.id)}
                                  className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQ && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddQ(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add Question</h2>
                {targetExamId && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    Adding to: {cbtExams.find((e: any) => e.id === targetExamId)?.title}
                  </p>
                )}
              </div>
              <button onClick={() => setShowAddQ(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Question <span className="text-red-500">*</span></label>
                <textarea
                  value={qForm.question}
                  onChange={(e) => setQForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="Enter your question..."
                  rows={3}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">Options</label>
                  <span className="text-xs text-slate-400">Check the correct answer(s)</span>
                </div>
                <div className="space-y-2.5">
                  {qForm.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) =>
                          setQForm((p) => ({
                            ...p,
                            options: p.options.map((o, i) => i === oi ? { ...o, isCorrect: e.target.checked } : o),
                          }))
                        }
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{String.fromCharCode(65 + oi)}.</span>
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              options: p.options.map((o, i) => i === oi ? { ...o, text: e.target.value } : o),
                            }))
                          }
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          className="pl-8 h-10 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-32">
                <label className="text-sm font-semibold text-slate-700">Points</label>
                <Input type="number" min={1} value={qForm.points} onChange={(e) => setQForm((p) => ({ ...p, points: e.target.value }))} className="mt-2 h-10 rounded-xl text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
              <Button variant="outline" onClick={() => setShowAddQ(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
              <Button onClick={handleAddQuestion} disabled={addingQ} className="h-11 px-6 rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                {addingQ ? "Adding..." : "Add Question"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Bulk Upload Modal */}
      {showBulk && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowBulk(false); setBulkFile(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Bulk Upload Questions</h2>
                {bulkExamId && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    Uploading to: {cbtExams.find((e: any) => e.id === bulkExamId)?.title}
                  </p>
                )}
              </div>
              <button onClick={() => { setShowBulk(false); setBulkFile(null); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Expected format</p>
                <p className="text-xs text-blue-700 font-mono leading-relaxed">
                  question | option_a | option_b | option_c | option_d | correct_answer | points
                </p>
                <p className="text-xs text-blue-600 mt-1.5">correct_answer: A, B, C, or D. Points is optional (defaults to 1).</p>
              </div>
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${bulkFile ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
                <Upload className={`w-8 h-8 mb-2 ${bulkFile ? "text-violet-600" : "text-slate-400"}`} />
                {bulkFile ? (
                  <>
                    <p className="text-sm font-semibold text-slate-900">{bulkFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{(bulkFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">Click to select or drag & drop</p>
                    <p className="text-xs text-slate-400 mt-0.5">CSV, XLSX, XLS, ODS supported</p>
                  </>
                )}
                <input type="file" accept=".csv,.xlsx,.xls,.ods,.tsv" className="hidden" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => { setShowBulk(false); setBulkFile(null); }} className="h-11 px-6 rounded-xl">Cancel</Button>
              <Button onClick={handleBulkUpload} disabled={!bulkFile || uploading} className="h-11 px-6 rounded-xl text-white gap-2" style={{ backgroundColor: primaryColor }}>
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Questions"}
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
