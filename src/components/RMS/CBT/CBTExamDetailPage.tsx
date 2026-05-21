"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAssessmentDetail,
  fetchAssessmentSubmissions,
  deleteAssessment,
  bulkUploadQuestions,
  addQuestion,
  deleteQuestion,
  fetchScoresByAssessment,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  X,
  Clock,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  MonitorCheck,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const DEFAULT_PRIMARY = "#641BC4";

const getStatusStyle = (status?: string) => {
  if (status === "started" || status === "active")
    return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" };
  if (status === "ended")
    return { bg: "bg-slate-100", text: "text-slate-600", label: "Ended" };
  return { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" };
};

type Option = { text: string; isCorrect: boolean };

const EMPTY_OPTIONS: Option[] = [
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function CBTExamDetailPage() {
  const params = useParams<{ examId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAssessment, assessmentSubmissions, loading } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [activeTab, setActiveTab] = useState<"questions" | "results">("questions");

  // Add question modal
  const [showAddQ, setShowAddQ] = useState(false);
  const [addingQ, setAddingQ] = useState(false);
  const [qForm, setQForm] = useState({
    question: "",
    options: EMPTY_OPTIONS as Option[],
    points: "1",
    type: "MCQ",
  });

  // Bulk upload modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Scores
  const [scores, setScores] = useState<any[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  useEffect(() => {
    if (params.examId) {
      dispatch(fetchAssessmentDetail(params.examId));
      dispatch(fetchAssessmentSubmissions(params.examId));
      dispatch(getTenantInfo());
    }
  }, [params.examId]);

  useEffect(() => {
    if (activeTab === "results" && params.examId) {
      setScoresLoading(true);
      dispatch(fetchScoresByAssessment(params.examId))
        .unwrap()
        .then((data) => setScores(Array.isArray(data) ? data : []))
        .catch(() => setScores([]))
        .finally(() => setScoresLoading(false));
    }
  }, [activeTab, params.examId]);

  const questions = useMemo(
    () => (selectedAssessment as any)?.questions || [],
    [selectedAssessment],
  );

  const statusStyle = getStatusStyle(selectedAssessment?.status);

  const resetQForm = () => {
    setQForm({ question: "", options: [...EMPTY_OPTIONS.map((o) => ({ ...o }))], points: "1", type: "MCQ" });
  };

  const handleAddQuestion = async () => {
    if (!qForm.question.trim()) return toast.error("Question text is required");
    const filledOptions = qForm.options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) return toast.error("Add at least 2 answer options");
    if (!filledOptions.some((o) => o.isCorrect)) return toast.error("Select the correct answer");

    setAddingQ(true);
    try {
      await dispatch(
        addQuestion({
          assessmentId: params.examId,
          existingQuestions: questions,
          question: qForm.question.trim(),
          options: filledOptions,
          points: Number(qForm.points) || 1,
          type: qForm.type,
          explanation: (qForm as any).explanation?.trim() || undefined,
        } as any),
      ).unwrap();
      toast.success("Question added");
      resetQForm();
      setShowAddQ(false);
      dispatch(fetchAssessmentDetail(params.examId));
    } catch (e: any) {
      toast.error(e || "Failed to add question");
    } finally {
      setAddingQ(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await dispatch(deleteQuestion({ assessmentId: params.examId, questionId })).unwrap();
      toast.success("Question deleted");
      dispatch(fetchAssessmentDetail(params.examId));
    } catch (e: any) {
      toast.error(e || "Failed to delete question");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return toast.error("Select a file first");
    setUploading(true);
    try {
      await dispatch(bulkUploadQuestions({ assessmentId: params.examId, file: bulkFile })).unwrap();
      toast.success("Questions uploaded successfully");
      setBulkFile(null);
      setShowBulk(false);
      dispatch(fetchAssessmentDetail(params.examId));
    } catch (e: any) {
      toast.error(e || "Failed to upload questions");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedAssessment) return;
    if (!confirm(`Delete "${selectedAssessment.title}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteAssessment(selectedAssessment.id)).unwrap();
      toast.success("Exam deleted");
      router.push("/RMS/cbt/exams");
    } catch (e: any) {
      toast.error(e || "Failed to delete exam");
    }
  };

  if (loading && !selectedAssessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200" style={{ borderTopColor: primaryColor }} />
      </div>
    );
  }

  if (!selectedAssessment) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Exam not found</p>
        <Link href="/RMS/cbt/exams">
          <Button className="mt-4" variant="outline">Back to Exams</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header schoolLogo={tenantInfo?.logoUrl} schoolName={tenantInfo?.name || "ParaLearn School"} />

      {/* Back + title */}
      <div className="mb-6">
        <Link href="/RMS/cbt/exams">
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Exams
          </button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">{selectedAssessment.title}</h1>
              <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </Badge>
              <Badge className="rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 bg-violet-50 text-violet-700">
                CBT Online
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {(selectedAssessment as any).durationMins && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4" /> {(selectedAssessment as any).durationMins} min
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <FileQuestion className="w-4 h-4" /> {questions.length} questions
              </span>
              {(selectedAssessment as any).totalMarks && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4" /> {(selectedAssessment as any).totalMarks} marks
                </span>
              )}
              {selectedAssessment.startsAt && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedAssessment.startsAt), "MMM d, yyyy HH:mm")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteExam}
              className="h-9 gap-1.5 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {(["questions", "results"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "questions" ? `Questions (${questions.length})` : `Results (${assessmentSubmissions?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{questions.length} question{questions.length !== 1 ? "s" : ""} in this exam</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200"
                onClick={() => setShowBulk(true)}
              >
                <Upload className="w-4 h-4" /> Bulk Upload
              </Button>
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setShowAddQ(true)}
              >
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No questions yet</p>
              <p className="text-slate-400 text-sm mt-1">Add questions one by one or bulk upload a file.</p>
              <div className="flex gap-3 justify-center mt-4">
                <Button variant="outline" onClick={() => setShowBulk(true)} className="gap-2">
                  <Upload className="w-4 h-4" /> Bulk Upload
                </Button>
                <Button onClick={() => setShowAddQ(true)} className="gap-2 text-white" style={{ backgroundColor: primaryColor }}>
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{q.question || q.content || q.text}</p>
                      {(q.options || q.choices || []).length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || q.choices || []).map((opt: any, oi: number) => (
                            <div
                              key={opt.id || oi}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${
                                opt.isCorrect
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                                  : "bg-slate-50 border border-slate-100 text-slate-700"
                              }`}
                            >
                              {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              <span className="truncate">{opt.text || opt.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {q.points && (
                        <span className="text-xs text-slate-400 font-medium">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                      )}
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div>
          {scoresLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200" style={{ borderTopColor: primaryColor }} />
            </div>
          ) : scores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No submissions yet</p>
              <p className="text-slate-400 text-sm mt-1">Results will appear here once students submit the exam.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-4 gap-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</span>
              </div>
              <div className="divide-y divide-slate-50">
                {scores.map((score: any) => {
                  const total = (selectedAssessment as any).totalMarks || 100;
                  const pct = total > 0 ? Math.round((score.score / total) * 100) : 0;
                  const passed = pct >= ((selectedAssessment as any).passingMarks || 50);
                  return (
                    <div key={score.id} className="px-5 py-3.5 grid grid-cols-4 gap-4 items-center hover:bg-slate-50/50">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {score.student?.firstName} {score.student?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{score.student?.email}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{score.score ?? "—"}</p>
                        <p className="text-xs text-slate-400">{pct}%</p>
                      </div>
                      <Badge className={`w-fit rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {passed ? "Pass" : "Fail"}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {score.submittedAt ? format(new Date(score.submittedAt), "MMM d, HH:mm") : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQ && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAddQ(false); resetQForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Add Question</h2>
              <button onClick={() => { setShowAddQ(false); resetQForm(); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              {/* Type + Points row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Question Type</label>
                  <select
                    value={qForm.type}
                    onChange={(e) => {
                      const t = e.target.value;
                      setQForm((p) => ({
                        ...p,
                        type: t,
                        options: t === "TRUE_FALSE"
                          ? [{ text: "True", isCorrect: false }, { text: "False", isCorrect: false }]
                          : p.options,
                      }));
                    }}
                    className="mt-2 w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Marks</label>
                  <Input type="number" min={1} value={qForm.points} onChange={(e) => setQForm((p) => ({ ...p, points: e.target.value }))} className="mt-2 h-10 rounded-xl text-sm" />
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Question Text <span className="text-red-500">*</span></label>
                <textarea
                  value={qForm.question}
                  onChange={(e) => setQForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>

              {/* Answer options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">Answer Options</label>
                  <span className="text-xs text-slate-400">Select the correct answer</span>
                </div>
                <div className="space-y-2.5">
                  {qForm.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={opt.isCorrect}
                        onChange={() =>
                          setQForm((p) => ({
                            ...p,
                            options: p.options.map((o, i) => ({ ...o, isCorrect: i === oi })),
                          }))
                        }
                        className="w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
                      />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              options: p.options.map((o, i) =>
                                i === oi ? { ...o, text: e.target.value } : o,
                              ),
                            }))
                          }
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          className="pl-8 h-10 rounded-xl text-sm"
                        />
                      </div>
                      {qForm.type !== "TRUE_FALSE" && qForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setQForm((p) => ({ ...p, options: p.options.filter((_, i) => i !== oi) }))}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {qForm.type !== "TRUE_FALSE" && qForm.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setQForm((p) => ({ ...p, options: [...p.options, { text: "", isCorrect: false }] }))}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add option
                  </button>
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Explanation <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  value={(qForm as any).explanation || ""}
                  onChange={(e) => setQForm((p: any) => ({ ...p, explanation: e.target.value }))}
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
              <Button variant="outline" onClick={() => { setShowAddQ(false); resetQForm(); }} className="h-11 px-6 rounded-xl">Cancel</Button>
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
                <p className="text-sm text-slate-500 mt-0.5">Upload CSV, Excel, or any supported format.</p>
              </div>
              <button onClick={() => { setShowBulk(false); setBulkFile(null); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Format guide */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">Expected format</p>
                <p className="text-xs text-blue-700 font-mono leading-relaxed">
                  question | option_a | option_b | option_c | option_d | correct_answer | points
                </p>
                <p className="text-xs text-blue-600 mt-1.5">
                  correct_answer should be A, B, C, or D. Points column is optional (defaults to 1).
                </p>
              </div>

              {/* Drop zone */}
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
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.ods,.tsv"
                  className="hidden"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
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
