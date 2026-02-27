"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAssessmentDetail, fetchAssessmentSubmissions } from "@/reduxToolKit/teacher/teacherThunks";
import { useGradeAnswerMutation } from "@/reduxToolKit/api/endpoints/assessments";
import { Search, ArrowLeft, Check, Star, Edit3, ArrowRight, CheckCircle, Calendar, Award, Menu, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "../../../public/mainLogo.svg";

export function TeacherGradingPage() {
  const params = useParams<{ assessmentId: string; submissionId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedAssessment, submissions: rawSubmissions, loading } = useSelector((s: RootState) => s.teacher);

  const questions = useMemo(() => {
    return selectedAssessment?.questions || [];
  }, [selectedAssessment]);

  // Exclude students who haven't completed their assessment yet
  const submissions = useMemo(() => {
    return (rawSubmissions || []).filter((s: any) => {
      const st = s.status?.toLowerCase() || "";
      return !st.includes("in_progress") && !st.includes("in progress") && st !== "not_started";
    });
  }, [rawSubmissions]);
  const [gradeAnswer, { isLoading: isGrading }] = useGradeAnswerMutation();

  const assessmentId = params?.assessmentId as string;
  const submissionId = params?.submissionId as string;

  const [search, setSearch] = useState("");
  const [gradingState, setGradingState] = useState<Record<string, { marksAwarded: string; comment: string }>>({});
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;
    dispatch(fetchAssessmentDetail(assessmentId));
    dispatch(fetchAssessmentSubmissions(assessmentId));
  }, [dispatch, assessmentId]);

  useEffect(() => {
    // If no submissionId is present but we have submissions fetched, automatically route to the first student
    if (!loading && submissions.length > 0 && !submissionId) {
      router.replace(`/teacher/assessments/${assessmentId}/grade/${submissions[0].id}`);
    }
  }, [loading, submissions, submissionId, assessmentId, router]);

  const submission: any = useMemo(() => {
    return submissions.find((s: any) => s.id === submissionId);
  }, [submissions, submissionId]);

  const filteredSubmissions = useMemo(() => {
    if (!search) return submissions;
    const lower = search.toLowerCase();
    return submissions.filter((s: any) => {
      const name = `${s.student?.firstName || ""} ${s.student?.lastName || ""}`.toLowerCase();
      const matric = (s.student?.matricNumber || "").toLowerCase();
      const stdId = (s.student?.studentId || s.studentId || "").toLowerCase();
      return name.includes(lower) || matric.includes(lower) || stdId.includes(lower);
    });
  }, [submissions, search]);

  const pendingCount = useMemo(() => {
    return submissions.filter((s: any) => s.status === "submitted" || !s.status || s.status.includes("pending")).length;
  }, [submissions]);

  const currentIndex = submissions.findIndex((s: any) => s.id === submissionId);
  const nextSubmission = submissions[currentIndex + 1];

  useEffect(() => {
    if (submission && submission.answers) {
      const initialState: Record<string, { marksAwarded: string; comment: string }> = {};
      submission.answers.forEach((ans: any) => {
        initialState[ans.id] = {
          marksAwarded: ans.marksAwarded?.toString() || ans.score?.toString() || "0",
          comment: ans.comment || "",
        };
      });
      setGradingState(initialState);
    }
  }, [submission]);

  const handleSaveProgress = async () => {
    if (!submission?.answers?.length) return;
    setIsSavingAll(true);
    let errorCount = 0;

    const answersToGrade = submission.answers.filter((ans: any) => {
       const q = selectedAssessment?.questions?.find((q: any) => q.id === ans.questionId);
       return q && (q.type === "theory" || q.type === "short_answer" || q.questionType === "theory");
    });

    const promises = answersToGrade.map(async (ans: any) => {
      const data = gradingState[ans.id];
      if (!data) return;
      try {
        await gradeAnswer({
          submissionId,
          answerId: ans.id,
          marksAwarded: Number(data.marksAwarded || 0),
          comment: data.comment,
        }).unwrap();
      } catch (err) {
        errorCount++;
        console.error("Failed to save grade for", ans.id, err);
      }
    });

    await Promise.all(promises);
    setIsSavingAll(false);

    if (errorCount === 0) {
      toast.success("Progress saved successfully");
      dispatch(fetchAssessmentSubmissions(assessmentId));
    } else {
      toast.error(`Saved with ${errorCount} errors. Please try again.`);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSaveProgress();
    if (nextSubmission) {
      router.push(`/teacher/assessments/${assessmentId}/grade/${nextSubmission.id}`);
    } else {
      toast.success("All students graded in this list!");
      router.push(`/teacher/assessments`);
    }
  };

  if (loading && !selectedAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfe]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
      </div>
    );
  }

  // Handle No Submissions
  if (submissions.length === 0 && !loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-[#fbfbfe] flex-col gap-4">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center max-w-sm">
             <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Star className="w-6 h-6 text-slate-400" />
             </div>
             <h2 className="text-lg font-bold text-slate-800 mb-2">No Submissions Yet</h2>
             <p className="text-sm text-slate-500 mb-6">Students have not submitted this assessment yet. Check back later.</p>
             <Button onClick={() => router.push(`/teacher/assessments`)} className="bg-violet-500 hover:bg-violet-600">
               Back to Assessments
             </Button>
           </div>
        </div>
     );
  }

  // Handle Invalid Submission ID
  if (!submission && submissions.length > 0 && submissionId) {
     return (
        <div className="flex h-screen items-center justify-center bg-[#fbfbfe] flex-col gap-4">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center max-w-sm">
             <h2 className="text-lg font-bold text-slate-800 mb-2">Submission Not Found</h2>
             <p className="text-sm text-slate-500 mb-6">The student submission you are looking for does not exist or has been removed.</p>
             <Button onClick={() => router.push(`/teacher/assessments/${assessmentId}/grade/${submissions[0].id}`)} className="bg-violet-500 hover:bg-violet-600">
               Grade First Student
             </Button>
           </div>
        </div>
     )
  }

  const studentName = submission?.student?.firstName
    ? `${submission.student.firstName} ${submission.student.lastName}`
    : `Student ID: ${submission?.student?.studentId || submission?.studentId || "Unknown"}`;
  
  const studentSubID = submission?.student?.studentId || submission?.student?.matricNumber || submission?.studentId || "—";
  
  const studentInitials = submission?.student?.firstName 
    ? `${submission.student.firstName[0]}${submission.student.lastName?.[0] || ''}`.toUpperCase() : "ST";

  const currentTotalCalculated = submission?.answers?.reduce((acc: number, ans: any) => {
    const st = gradingState[ans.id];
    return acc + (Number(st?.marksAwarded) || Number(ans.marksAwarded) || Number(ans.score) || 0);
  }, 0) || submission?.score || 0;

  return (
    <div className="bg-[#fbfbfe] text-slate-800 font-sans overflow-hidden h-screen flex flex-col selection:bg-violet-500/20 selection:text-violet-600">
      {/* Header */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-violet-100 px-5 py-2.5 bg-white z-20">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="ParaLearn Logo" className="h-6 md:h-7 w-auto object-contain" />
          <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3 ml-2">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">Assessment Grading</span>
            <span className="text-xs text-slate-500 font-medium truncate">{selectedAssessment?.title || "Assessment"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/teacher/assessments`)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
            <span className="truncate">Back to Assessments</span>
          </button>
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 sm:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`w-[260px] md:w-72 flex-none flex flex-col border-r border-violet-100 bg-white z-50 fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0 ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
          <div className="p-3 border-b border-violet-50 flex items-center gap-2">
            <div className="relative flex items-center w-full h-9 rounded-xl focus-within:ring-2 ring-violet-500/30 transition-all bg-slate-50 overflow-hidden text-slate-400">
              <Search className="absolute left-2.5 w-4 h-4" />
              <input 
                className="peer h-full w-full outline-none text-xs text-slate-700 bg-transparent pl-8 pr-3 placeholder:text-slate-400" 
                placeholder="Filter students..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="sm:hidden h-9 w-9 flex-none flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredSubmissions.map((sub: any) => {
              const stdName = sub.student?.firstName ? `${sub.student.firstName} ${sub.student.lastName}` : `ID: ${sub.student?.studentId || sub.studentId}`;
              const inits = sub.student?.firstName ? `${sub.student.firstName[0]}${sub.student.lastName?.[0] || ''}`.toUpperCase() : "?";
              const stdReadableId = sub.student?.studentId || sub.student?.matricNumber || sub.studentId?.slice(0, 8);
              const isActive = sub.id === submissionId;
              const isGraded = sub.status === "graded";
              
              return (
                <button 
                  key={sub.id}
                  onClick={() => {
                    router.push(`/teacher/assessments/${assessmentId}/grade/${sub.id}`);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all relative overflow-hidden ${
                    isActive ? "bg-violet-50 border border-violet-200 shadow-sm shadow-violet-100/50" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>}
                  {isGraded ? (
                    <div className="h-8 w-8 flex-none rounded-full overflow-hidden border border-emerald-200">
                      <img 
                        src={sub?.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub?.student?.id || sub?.student?.studentId || sub?.id || 'student'}`} 
                        alt=""
                        className="w-full h-full bg-emerald-50"
                      />
                    </div>
                  ) : isActive ? (
                    <div className="h-8 w-8 flex-none rounded-full overflow-hidden border border-violet-400 shadow-md shadow-violet-500/30">
                      <img 
                        src={sub.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student?.id || sub.student?.studentId || sub.id}`} 
                        alt=""
                        className="w-full h-full bg-violet-500"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex-none rounded-full overflow-hidden border border-slate-200">
                      <img 
                        src={sub.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student?.id || sub.student?.studentId || sub.id}`} 
                        alt=""
                        className="w-full h-full bg-slate-50"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col grow min-w-0">
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-sm font-semibold truncate ${isActive ? "text-slate-900" : "text-slate-700 font-medium"}`}>
                        {stdName}
                      </span>
                      {isGraded ? (
                        <span className="text-[11px] font-bold text-emerald-600">{sub.score || 0}</span>
                      ) : isActive ? (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_currentColor]"></span>
                      ) : null}
                    </div>
                    <span className={`text-[11px] truncate ${isActive ? "text-violet-500 font-medium" : "text-slate-400"}`}>
                      {stdReadableId} • {isGraded ? "Graded" : "Pending Review"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-violet-100 bg-slate-50 text-[11px] text-slate-500 flex justify-between font-medium">
            <span>Total: {submissions.length} Students</span>
            <span>{pendingCount} Pending</span>
          </div>
        </aside>

        {/* Main Content */}
        {!submission ? (
          <main className="flex-1 flex flex-col items-center justify-center bg-[#fdfcff] text-slate-400">
             <Star className="w-10 h-10 mb-3 opacity-50" />
             <p className="text-sm">Select a student from the sidebar to grade.</p>
          </main>
        ) : (
          <main className="flex-1 flex flex-col min-w-0 bg-[#fdfcff] overflow-hidden relative">
            {/* Main Header inside grading pane */}
            <div className="flex-none bg-white border-b border-violet-100 px-5 py-4 shadow-sm z-10 w-full mb-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-none rounded-full overflow-hidden border-2 border-violet-200 shadow-sm transition-transform hover:scale-105">
                    <img 
                      src={submission?.student?.avatar || submission?.student?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission?.student?.id || submission?.student?.studentId || submission?.id || 'student'}`} 
                      alt=""
                      className="w-full h-full object-cover bg-violet-50"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{studentName}</h1>
                    <div className="flex items-center flex-wrap gap-2 md:gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="text-indigo-500 font-bold uppercase tracking-wider">{studentSubID}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> 
                         Submitted {format(new Date(submission.createdAt || Date.now()), "MMM d, h:mm a")}
                      </span>
                      {submission.status === "graded" && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">Graded</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-violet-50/50 px-5 py-2.5 rounded-xl border border-violet-100">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Score</p>
                    <p className="text-2xl font-bold text-violet-500 leading-none">
                      {currentTotalCalculated} <span className="text-sm font-medium text-slate-400">/ {selectedAssessment?.totalMarks || 100}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28">
              <div className="max-w-4xl mx-auto space-y-5">
                {(selectedAssessment?.questions || []).map((question: any, idx: number) => {
                  const answerDoc = submission.answers?.find((a: any) => a.questionId === question.id);
                  const answerId = answerDoc?.id;
                  const isTheory = ["theory", "essay", "short_answer", "TEXT"].some(t => 
                    (String(question.type).toLowerCase() === t.toLowerCase()) || 
                    (String(question.questionType).toLowerCase() === t.toLowerCase())
                  );
                  
                  // Value Parsing for MCQ
                  let isCorrect = false;
                  let selectedIds: string[] = [];
                  const options = question.choices || question.options || [];
                  const correctAnswerId = question.correctAnswer || question.correctOption;
                  
                  if (!isTheory) {
                    const rawValue = answerDoc?.value || answerDoc?.answer;
                    if (rawValue) {
                      let parsedValue = rawValue;
                      if (typeof rawValue === 'string') {
                        try { parsedValue = JSON.parse(rawValue); } catch (e) {}
                      }
                      
                      if (Array.isArray(parsedValue)) {
                         selectedIds = parsedValue.map((v: any) => String(typeof v === 'object' ? (v.choiceId || v.id || v) : v));
                      } else if (typeof parsedValue === 'object' && parsedValue !== null) {
                         selectedIds = [String(parsedValue.selected || parsedValue.choiceId)].filter(Boolean);
                      } else if (parsedValue !== undefined && parsedValue !== null) {
                         selectedIds = [String(parsedValue)];
                      }

                      // Try fallback matching by text (if no IDs matched exactly)
                      selectedIds = selectedIds.map(id => {
                         if (!options.find((o: any) => String(o.id) === String(id))) {
                            const fallMatch = options.find((o: any) => String(o.text) === String(id));
                            if (fallMatch) return String(fallMatch.id);
                         }
                         return String(id);
                      });
                      
                      // We should trust the backend's isCorrect if available explicitly, 
                      // EXCEPT for MULTI_SELECT where the user reported discrepancies.
                      const isMultiSelect = question.type === "MULTI_SELECT" || question.questionType === "MULTI_SELECT";
                      
                      const correctIds = options.filter((o:any)=>o.isCorrect).map((o:any)=>String(o.id));
                      if (correctIds.length === 0 && correctAnswerId) {
                         if (Array.isArray(correctAnswerId)) {
                            correctAnswerId.forEach(c => correctIds.push(String(c)));
                         } else {
                            correctIds.push(String(correctAnswerId));
                         }
                      }
                      
                      let localIsCorrect = false;
                      if (correctIds.length > 0 && selectedIds.length > 0) {
                          localIsCorrect = selectedIds.length === correctIds.length && 
                                           selectedIds.every(id => correctIds.includes(id));
                      }

                      if (answerDoc?.isCorrect !== undefined && answerDoc?.isCorrect !== null && !isMultiSelect) {
                         isCorrect = answerDoc.isCorrect;
                      } else {
                         isCorrect = localIsCorrect;
                      }
                    }
                  }

                  const state = gradingState[answerId as string] || { marksAwarded: answerDoc?.score?.toString() || answerDoc?.marksAwarded?.toString() || "0", comment: answerDoc?.comment || "" };
                  const maxMarks = question.marks || 1;
                  const dbScoreObj = answerDoc?.score ?? answerDoc?.marksAwarded;
                  const earnedMarks = isTheory 
                     ? parseFloat(state.marksAwarded||"0") 
                     : (dbScoreObj !== undefined && dbScoreObj !== null ? parseFloat(String(dbScoreObj)) : (isCorrect ? maxMarks : 0));

                  if (!isTheory) {
                    // AUTO GRADED CARD
                    return (
                      <div key={question.id || idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-violet-200 transition-colors">
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2.5 text-sm">
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Q{idx + 1}</span>
                            {String(question.type || question.questionType).toUpperCase() === "TRUE_FALSE" ? "True / False" : (question.type === "MULTI_SELECT" || question.questionType === "MULTI_SELECT") ? "Multi-Select" : "Multiple Choice"}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            Auto-Graded: {earnedMarks}/{maxMarks}
                          </span>
                        </div>
                        <div className="p-5">
                          {/* THE QUESTION PROMPT */}
                          <p className="text-sm font-medium text-slate-900 mb-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {question.prompt || question.questionText || question.text}
                          </p>
                          
                          {/* OPTIONS LIST */}
                          <div className="space-y-2">
                             {options.length > 0 ? options.map((opt: any) => {
                                const isSelected = selectedIds.includes(String(opt.id));
                                const isActualCorrect = opt.isCorrect || String(opt.id) === String(question.correctAnswer) || String(opt.id) === String(question.correctOption);
                                
                                let wrapperClass = "border-slate-200 bg-white opacity-80";
                                let iconClass = "border-slate-300";
                                let textClass = "text-slate-600";
                                let badge = null;

                                if (isSelected && isActualCorrect) {
                                   wrapperClass = "border-emerald-300 bg-emerald-50 shadow-sm";
                                   iconClass = "border-emerald-500 bg-emerald-500 text-white";
                                   textClass = "text-emerald-900 font-semibold";
                                   badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 ml-auto">Selected (Correct)</span>;
                                } else if (isSelected && !isActualCorrect) {
                                   wrapperClass = "border-red-300 bg-red-50 shadow-sm";
                                   iconClass = "border-red-500 bg-red-500 text-white";
                                   textClass = "text-red-900 font-semibold";
                                   badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-200 text-red-800 ml-auto">Student Answer</span>;
                                } else if (!isSelected && isActualCorrect) {
                                   wrapperClass = "border-emerald-200 bg-emerald-50/50 border-dashed";
                                   iconClass = "border-emerald-500 text-emerald-500 bg-white";
                                   textClass = "text-emerald-800";
                                   badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 ml-auto">Correct Answer</span>;
                                }

                                return (
                                  <div key={opt.id} className={`flex items-start md:items-center p-3 rounded-xl border transition-all ${wrapperClass}`}>
                                    <div className={`h-5 w-5 mt-0.5 md:mt-0 flex-none rounded-full border-2 flex items-center justify-center mr-3 ${iconClass}`}>
                                      {(isSelected || isActualCorrect) && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className={`text-sm ${textClass}`}>
                                      {opt.text}
                                    </span>
                                    {badge}
                                  </div>
                                );
                             }) : (
                               <div className="text-sm text-slate-400 italic p-3">No options provided.</div>
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // THEORY CARD (MANUAL GRADING)
                  return (
                    <div key={question.id || idx} className="bg-white rounded-2xl border-2 border-violet-500/20 ring-4 ring-violet-500/5 shadow-sm shadow-violet-500/10 overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                      <div className="flex items-center justify-between px-5 py-3 bg-violet-50/30 border-b border-violet-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2.5 text-sm">
                          <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm shadow-violet-500/30 uppercase tracking-wider">Q{idx + 1}</span>
                          Theory
                        </h3>
                        {answerDoc?.marksAwarded !== undefined && answerDoc?.marksAwarded !== null ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                            Graded: {answerDoc?.marksAwarded || 0}/{maxMarks}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Needs Grading
                          </span>
                        )}
                      </div>
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7 space-y-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                              {question.prompt || question.questionText || question.text}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Student Answer:</p>
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                              {(() => {
                                const raw = answerDoc?.value || answerDoc?.answer;
                                if (!raw) return <span className="text-slate-400 italic">No answer provided.</span>;
                                if (typeof raw === 'string') {
                                  try {
                                    const parsed = JSON.parse(raw);
                                    if (typeof parsed === 'object' && parsed !== null) {
                                      return parsed.selected || parsed.text || JSON.stringify(parsed);
                                    }
                                    return parsed;
                                  } catch(e) { return raw; }
                                }
                                if (typeof raw === 'object' && raw !== null) {
                                  return raw.selected || raw.text || JSON.stringify(raw);
                                }
                                return String(raw);
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-5 bg-violet-50/50 p-4 rounded-xl border border-violet-100 flex flex-col gap-4">
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-violet-500 mb-1.5 uppercase tracking-wide">Score / {maxMarks}</label>
                              <div className="relative flex items-center group">
                                <input 
                                  className="w-full rounded-xl border-[#e9d5ff] bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-bold text-lg p-2.5 shadow-sm transition-all text-violet-600 outline-none" 
                                  max={maxMarks} 
                                  min="0" 
                                  type="number"
                                  value={state.marksAwarded}
                                  onChange={(e) => {
                                      let val = e.target.value;
                                      if (Number(val) > maxMarks) val = maxMarks.toString();
                                      setGradingState(p => ({
                                        ...p,
                                        [answerId as string]: { ...p[answerId as string], marksAwarded: val }
                                      }))
                                  }}
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setGradingState(p => ({
                                  ...p,
                                  [answerId as string]: { ...p[answerId as string], marksAwarded: maxMarks.toString() }
                                }))
                              }}
                              className="h-11 aspect-square flex items-center justify-center rounded-xl border border-[#e9d5ff] bg-white text-violet-300 hover:text-amber-400 hover:border-amber-300 hover:shadow-sm transition-all group" 
                              title="Quick Full Marks"
                            >
                              <Star className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" />
                            </button>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <label className="block text-[10px] font-bold text-violet-500 mb-1.5 uppercase tracking-wide">Teacher Comment</label>
                            <textarea 
                              className="flex-1 w-full rounded-xl border-[#e9d5ff] bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 p-3 text-sm min-h-[90px] resize-none shadow-sm transition-all placeholder:text-slate-300 outline-none" 
                              placeholder="Provide feedback..."
                              value={state.comment}
                              onChange={(e) => {
                                setGradingState(p => ({
                                  ...p,
                                  [answerId as string]: { ...p[answerId as string], comment: e.target.value }
                                }))
                              }}
                            ></textarea>
                          </div>
                          <div className="flex flex-col">
                            <Button 
                              onClick={async () => {
                                  if (!answerId) return toast.error("Cannot save, answer ID missing.");
                                  try {
                                      await gradeAnswer({
                                          submissionId,
                                          answerId,
                                          marksAwarded: Number(state.marksAwarded || 0),
                                          comment: state.comment,
                                      }).unwrap();
                                      toast.success("Saved grade to database.");
                                      dispatch(fetchAssessmentSubmissions(assessmentId));
                                  } catch (err: any) {
                                      toast.error(err?.data?.message || "Failed to save");
                                  }
                              }}
                              disabled={isGrading}
                              className="w-full bg-violet-100 hover:bg-violet-200 text-violet-700 disabled:opacity-50 h-8 text-xs font-bold"
                            >
                                {isGrading ? "Saving..." : "Save Answer"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {selectedAssessment?.questions?.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-500 bg-white rounded-xl border border-slate-100">
                     No questions found in this assessment.
                  </div>
                )}
              </div>
            </div>

            {/* Floating Action Bar */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none px-4">
              <div className="bg-white/90 backdrop-blur-md p-1.5 pl-3 md:pl-5 rounded-2xl shadow-[0_8px_30px_-5px_rgba(0,0,0,0.15)] border border-violet-100 flex items-center gap-2 md:gap-4 pointer-events-auto transform transition-transform hover:scale-[1.02]">
                <span className="hidden xl:flex text-xs font-semibold text-slate-500 items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Draft Ready
                </span>
                <div className="hidden xl:block h-6 w-px bg-slate-200"></div>

                {/* Question Nav Grid */}
                <div className="flex items-center gap-1 px-1 overflow-x-auto no-scrollbar max-w-[150px] md:max-w-[300px]">
                   {questions.map((q: any, idx: number) => {
                      const qNum = idx + 1;
                      const hasComment = submission?.answers?.find((a: any) => a.questionId === q.id)?.comment;
                      const marks = submission?.answers?.find((a: any) => a.questionId === q.id)?.marksAwarded;
                      const isGraded = marks !== undefined && marks !== null;
                      
                      return (
                         <button
                            key={q.id}
                            title={`Question ${qNum}`}
                            onClick={() => {
                               const el = document.getElementById(`question-${q.id}`);
                               if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`w-7 h-7 flex-none rounded-lg text-[10px] font-bold transition-all flex items-center justify-center ${
                               isGraded 
                                 ? "bg-emerald-500 text-white" 
                                 : hasComment 
                                   ? "bg-amber-400 text-white"
                                   : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                         >
                            {qNum}
                         </button>
                      );
                   })}
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                
                <button 
                  onClick={handleSaveProgress}
                  disabled={isSavingAll}
                  className="px-3 md:px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSavingAll ? "Saving..." : "Save Progress"}
                </button>
                
                <button 
                  onClick={handleSaveAndNext}
                  disabled={isSavingAll}
                  className="flex items-center gap-1.5 px-4 md:px-5 py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/40 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/60 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Save & Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </main>
        )}
      </div>
    </div>
  );
}
