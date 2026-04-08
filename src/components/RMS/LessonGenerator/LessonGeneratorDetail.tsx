"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchLessonDetail } from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Printer, BookOpen, Target, Layers,
  Calendar, Clock, Sparkles, ClipboardList,
  ExternalLink, ChevronRight, FileText, AlertCircle, Share2,
  Users, CheckSquare, MessageSquare, Lightbulb, Link2, Package,
  Loader2,
} from "lucide-react";
import sabinoteApi from "@/lib/sabinoteApi";
import { toast } from "sonner";
import { format } from "date-fns";

// ── Small helpers ──────────────────────────────────────────────────────────────

function ObjectiveBadge({ type }: { type: string }) {
  const lower = type?.toLowerCase();
  const cls =
    lower === "cognitive" ? "bg-blue-100 text-blue-700" :
    lower === "affective" ? "bg-rose-100 text-rose-700" :
    "bg-emerald-100 text-emerald-700";
  return <span className={`text-[10px] font-black uppercase inline-block px-2 py-0.5 rounded ${cls}`}>{type}</span>;
}

function BloomBadge({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
      <ChevronRight className="w-3 h-3 text-purple-400" />
      Bloom's: {level}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls =
    difficulty === "advanced" ? "bg-red-100 text-red-700" :
    difficulty === "intermediate" ? "bg-amber-100 text-amber-700" :
    "bg-green-100 text-green-700";
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cls}`}>{difficulty}</span>;
}

function TypeBadge({ type }: { type: string }) {
  return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">{type?.replace("-", " ")}</span>;
}

function GroupingBadge({ grouping }: { grouping: string }) {
  const cls =
    grouping === "Individual" ? "bg-purple-100 text-purple-700" :
    grouping === "Pair" ? "bg-sky-100 text-sky-700" :
    grouping === "Group" ? "bg-teal-100 text-teal-700" :
    "bg-orange-100 text-orange-700";
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cls}`}>{grouping}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LessonGeneratorDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentLesson, loading, error } = useSelector((s: RootState) => s.lessonGenerator);

  const [activeTab, setActiveTab] = useState<"content" | "assessment" | "resources">("content");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchLessonDetail(id));
  }, [dispatch, id]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // Endpoint returns styled HTML — fetch with auth then open in new tab for Ctrl+P printing
      const res = await sabinoteApi.get(`/api/proxy/lesson-generator/${id}/export-pdf`, {
        responseType: "text",
      });
      const blob = new Blob([res.data], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      // Revoke after a short delay so the new tab has time to load the blob
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      if (!win) toast.info("Popup blocked — allow popups and try again.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading && !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-700">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading lesson note…</p>
      </div>
    );
  }

  if (error || (!currentLesson && !loading)) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Lesson Note Not Found</h2>
          <p className="text-slate-500">
            {typeof error === "string" ? error : "We couldn't find the lesson note you're looking for."}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  // `content` is the full lessonNote object (set by both generate + fetchDetail thunks)
  const content = currentLesson?.content ?? {};
  const metadata = content?.metadata ?? {};
  const objectives = content?.objectives ?? [];
  const introduction = content?.introduction ?? {};
  const mainContent = content?.mainContent ?? {};
  const studentActivities = content?.studentActivities ?? [];
  const assessment = content?.assessment ?? {};
  const conclusion = content?.conclusion ?? {};
  const resources = content?.resources ?? {};

  const formativeAssessment = assessment?.formative ?? {};
  const summativeAssessment = assessment?.summative ?? {};
  const duringLessonTechniques = formativeAssessment?.duringLesson ?? [];
  const exitTicket = formativeAssessment?.exitTicket ?? null;
  const summativeQuestions = summativeAssessment?.questions ?? [];
  const rubricCriteria = summativeAssessment?.rubric?.criteria ?? [];
  const successCriteria = assessment?.successCriteria ?? [];

  const digitalResources = resources?.digital ?? [];
  const physicalResources = resources?.physical ?? [];
  const textbookResources = resources?.textbook ?? [];

  const displayGrade = currentLesson?.grade ?? metadata?.grade;
  const displaySubject = currentLesson?.subject ?? metadata?.subject;
  const displayTopic = currentLesson?.topic ?? metadata?.topic;
  const displayTerm = currentLesson?.term ?? metadata?.term;
  const displayWeek = currentLesson?.week ?? metadata?.week;
  const displayDuration = metadata?.duration ?? `${currentLesson?.duration ?? 40} minutes`;
  const displayDate = currentLesson?.generatedAt ?? currentLesson?.createdAt;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:max-w-none print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center gap-3">
            {displayGrade && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                {displayGrade}
              </span>
            )}
            {displaySubject && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                {displaySubject}
              </span>
            )}
            {(displayTerm || displayWeek) && (
              <span className="text-slate-400 text-xs font-medium">
                {displayWeek ? `Week ${displayWeek}` : ""}{displayWeek && displayTerm ? " • " : ""}{displayTerm ? `${displayTerm} Term` : ""}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-coolvetica leading-tight">
            {displayTopic}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Opening…" : "Export PDF"}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Printer className="w-4 h-4" />Print
          </button>
        </div>
      </div>

      {/* Duration pill */}
      {displayDuration && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Clock className="w-4 h-4" /> {displayDuration}
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 md:p-8 flex flex-row md:flex-col gap-4 md:gap-2 items-center md:items-stretch print:hidden overflow-x-auto">
          <div className="hidden md:block mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
          </div>
          {[
            { id: "content", label: "Lesson Content", icon: BookOpen },
            { id: "assessment", label: "Assessments", icon: ClipboardList },
            { id: "resources", label: "Resources", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-white text-purple-600 font-bold shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? "text-purple-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-8 md:p-12 min-h-[600px] overflow-hidden">

          {/* ── CONTENT TAB ─────────────────────────────────────────────── */}
          {activeTab === "content" && (
            <div className="space-y-12 animate-in fade-in duration-500">

              {/* Introduction */}
              {introduction?.setInduction && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-100">
                    <Lightbulb className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Introduction</h2>
                    {introduction.duration && (
                      <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />{introduction.duration}
                      </span>
                    )}
                  </div>
                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <p className="text-sm font-bold text-purple-700 mb-1 uppercase tracking-wide">Set Induction</p>
                    <p className="text-slate-700 leading-relaxed">{introduction.setInduction}</p>
                  </div>
                  {introduction.priorKnowledge?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prior Knowledge Required</p>
                      <ul className="space-y-1">
                        {introduction.priorKnowledge.map((pk: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                            {pk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Learning Objectives */}
              {objectives.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-100">
                    <Target className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Learning Objectives</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {objectives.map((obj: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <ObjectiveBadge type={obj.type} />
                        <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                          "{obj.text}"
                        </p>
                        {obj.bloomLevel && <BloomBadge level={obj.bloomLevel} />}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Teaching Points */}
              {mainContent.teachingPoints?.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-100">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Teaching Points</h2>
                  </div>
                  <div className="space-y-8">
                    {mainContent.teachingPoints.map((point: any, i: number) => (
                      <div key={i} className="relative pl-8 space-y-4">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{point.title}</h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {point.explanation}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {point.teacherActivity && (
                            <div className="px-4 py-3 rounded-xl bg-purple-50 border border-purple-100">
                              <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">Teacher Activity</p>
                              <p className="text-xs text-slate-700 leading-snug">{point.teacherActivity}</p>
                            </div>
                          )}
                          {point.studentActivity && (
                            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Student Activity</p>
                              <p className="text-xs text-slate-700 leading-snug">{point.studentActivity}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Key Vocabulary */}
              {mainContent.keyVocabulary?.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    Key Vocabulary
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mainContent.keyVocabulary.map((v: any, i: number) => (
                      <div key={i} className="group relative">
                        <span className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-all cursor-default">
                          {v.term}
                        </span>
                        {v.definition && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all w-52 z-10 text-center shadow-xl">
                            {v.definition}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Examples */}
              {mainContent.examples?.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    Examples
                  </h3>
                  <ol className="space-y-2">
                    {mainContent.examples.map((ex: string, i: number) => (
                      <li key={i} className="flex gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm text-slate-700">
                        <span className="font-bold text-emerald-600 shrink-0">{i + 1}.</span>
                        {ex}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Student Activities */}
              {studentActivities.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-sky-100">
                    <Users className="w-6 h-6 text-sky-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Student Activities</h2>
                  </div>
                  <div className="space-y-4">
                    {studentActivities.map((act: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-sm text-slate-700 font-medium flex-1">{act.activity}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <GroupingBadge grouping={act.grouping} />
                          {act.duration && (
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{act.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Conclusion */}
              {conclusion?.summary && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100">
                    <CheckSquare className="w-6 h-6 text-slate-500" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Conclusion</h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{conclusion.summary}</p>
                  {conclusion.homework && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">Homework</p>
                      <p className="text-sm text-slate-700">{conclusion.homework}</p>
                    </div>
                  )}
                  {conclusion.nextLesson && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Next Lesson Preview</p>
                      <p className="text-sm text-slate-600">{conclusion.nextLesson}</p>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* ── ASSESSMENT TAB ──────────────────────────────────────────── */}
          {activeTab === "assessment" && (
            <div className="space-y-12 animate-in fade-in duration-500">

              {/* Formative — During Lesson */}
              {duringLessonTechniques.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-orange-100">
                    <Clock className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Formative Assessment</h2>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="text-left p-3">Technique</th>
                          <th className="text-left p-3">Description</th>
                          <th className="text-left p-3 hidden sm:table-cell">Timing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duringLessonTechniques.map((t: any, i: number) => (
                          <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-800">{t.technique}</td>
                            <td className="p-3 text-slate-600">{t.description}</td>
                            <td className="p-3 text-slate-400 text-xs hidden sm:table-cell">{t.timing}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Exit Ticket */}
              {exitTicket?.question && (
                <section className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    Exit Ticket
                  </h3>
                  <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-3">
                    <p className="font-semibold text-slate-800">{exitTicket.question}</p>
                    {exitTicket.expectedResponse && (
                      <div className="pt-2 border-t border-orange-100">
                        <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Expected Response</p>
                        <p className="text-sm text-slate-600">{exitTicket.expectedResponse}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Summative Questions */}
              {summativeQuestions.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-emerald-100">
                    <ClipboardList className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Summative Assessment</h2>
                  </div>
                  <div className="space-y-4">
                    {summativeQuestions.map((q: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="font-semibold text-slate-900 text-sm">{q.question}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {q.difficulty && <DifficultyBadge difficulty={q.difficulty} />}
                            {q.type && <TypeBadge type={q.type} />}
                          </div>
                        </div>
                        {q.expectedAnswer && (
                          <div className="ml-10 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Expected Answer</p>
                            <p className="text-xs text-slate-600">{q.expectedAnswer}</p>
                          </div>
                        )}
                        {(q.bloomLevel || q.points) && (
                          <div className="ml-10 flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                            {q.bloomLevel && <span>Bloom's: {q.bloomLevel}</span>}
                            {q.points && <span className="text-purple-600">{q.points} pt{q.points !== 1 ? "s" : ""}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Rubric */}
              {rubricCriteria.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900">Assessment Rubric</h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-xs min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="text-left p-3 font-bold">Criterion</th>
                          <th className="text-left p-3 font-bold text-emerald-400">Excellent</th>
                          <th className="text-left p-3 font-bold text-blue-400">Good</th>
                          <th className="text-left p-3 font-bold text-amber-400">Satisfactory</th>
                          <th className="text-left p-3 font-bold text-red-400">Needs Improvement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubricCriteria.map((row: any, i: number) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="p-3 font-semibold text-slate-800">{row.criterion}</td>
                            <td className="p-3 text-slate-600">{row.excellent}</td>
                            <td className="p-3 text-slate-600">{row.good}</td>
                            <td className="p-3 text-slate-600">{row.satisfactory}</td>
                            <td className="p-3 text-slate-600">{row.needsImprovement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Success Criteria */}
              {successCriteria.length > 0 && (
                <section className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg">Success Criteria</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {successCriteria.map((c: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── RESOURCES TAB ───────────────────────────────────────────── */}
          {activeTab === "resources" && (
            <div className="space-y-10 animate-in fade-in duration-500">

              {/* Digital Resources */}
              {digitalResources.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-100">
                    <Link2 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Digital Resources</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {digitalResources.map((res: any, i: number) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-50/30 border border-blue-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-bold text-blue-600 uppercase">{res.type}</p>
                              {res.cost && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  res.cost === "free" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                                }`}>{res.cost}</span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{res.name}</h4>
                            {res.description && <p className="text-xs text-slate-500 mt-0.5">{res.description}</p>}
                          </div>
                        </div>
                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shrink-0"
                          >
                            Visit <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Physical Materials */}
              {physicalResources.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-teal-100">
                    <Package className="w-6 h-6 text-teal-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Physical Materials</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {physicalResources.map((res: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl bg-teal-50/30 border border-teal-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{res.item}</h4>
                          {res.cost && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              res.cost === "free" ? "bg-green-100 text-green-700" :
                              res.cost === "low-cost" ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>{res.cost}</span>
                          )}
                        </div>
                        {res.purpose && <p className="text-xs text-slate-600">{res.purpose}</p>}
                        {res.alternatives?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-teal-600 uppercase mb-1">Alternatives</p>
                            <div className="flex flex-wrap gap-1">
                              {res.alternatives.map((alt: string, j: number) => (
                                <span key={j} className="text-[10px] px-2 py-0.5 bg-white rounded border border-teal-100 text-slate-500">{alt}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Textbook References */}
              {textbookResources.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100">
                    <BookOpen className="w-6 h-6 text-slate-600" />
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Textbook References</h2>
                  </div>
                  <div className="space-y-3">
                    {textbookResources.map((ref: any, i: number) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                          <BookOpen className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm">{ref.reference}</h4>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                            {ref.pages && <span>Pages: {ref.pages}</span>}
                            {ref.exercises && <span>Exercises: {ref.exercises}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {digitalResources.length === 0 && physicalResources.length === 0 && textbookResources.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No resources available for this lesson note.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 print:hidden text-xs font-medium text-slate-500">
        <div className="flex items-center gap-4">
          {displayDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Generated {format(new Date(displayDate), "MMMM d, yyyy")}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            SabiNote AI Engine
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          ID: {currentLesson?.id}
        </div>
      </div>
    </div>
  );
}
