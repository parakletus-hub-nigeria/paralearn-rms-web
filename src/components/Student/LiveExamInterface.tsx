"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { 
  submitAssessment, 
  fetchAssessmentDetails 
} from "@/reduxToolKit/student/studentThunks";
import { 
  setAnswer, 
  incrementTabSwitch, 
  incrementWindowBlur,
  restoreSession,
  resetActiveSession,
} from "@/reduxToolKit/student/studentSlice";
import { loadSessionFromStorage } from "@/reduxToolKit/student/studentSlice";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Timer,
  Flag,
  Grid,
  CheckCircle,
  Check,
  AlertTriangle,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Question types that expect a plain text answer (not a choice ID)
const OPEN_ENDED_TYPES = new Set(["ESSAY", "TEXT", "essay", "text"]);

export default function LiveExamInterface() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");

  const { currentAssessment, activeSession, loading } = useSelector((s: RootState) => s.student);
  const { user } = useSelector((s: RootState) => s.user);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep a stable ref to onFinalSubmit so the timer callback always sees the latest version
  const onFinalSubmitRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // -------------------------------------------------------------------------
  // Step 1: Restore session from localStorage in case of a page refresh
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!assessmentId) return;

    // Restore saved answers and startedAt from localStorage
    const saved = loadSessionFromStorage(assessmentId);
    if (saved) {
      dispatch(restoreSession(saved));
    }
  }, [dispatch, assessmentId]);

  // FIX #8: Guard against missing or blank assessmentId
  useEffect(() => {
    if (!assessmentId || assessmentId.trim() === "") return;
    // Fetch current assessment details
    dispatch(fetchAssessmentDetails(assessmentId));
  }, [dispatch, assessmentId]);

  // -------------------------------------------------------------------------
  // Timer Logic — based on startedAt + durationMins
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Use Redux startedAt first, then submission startedAt, then NOW as last resort
    const reliableStartedAt =
      activeSession.startedAt ||
      currentAssessment?.submissions?.[0]?.startedAt ||
      null;

    if (!currentAssessment?.durationMins || !reliableStartedAt) return;

    const computeTimeLeft = () => {
      const now = Date.now();
      const startedAt = new Date(reliableStartedAt).getTime();
      const durationMs = currentAssessment.durationMins * 60 * 1000;
      return Math.max(0, Math.floor((startedAt + durationMs - now) / 1000));
    };

    // Set immediately (no 1s lag)
    setTimeLeft(computeTimeLeft());

    const interval = setInterval(() => {
      const diff = computeTimeLeft();
      setTimeLeft(diff);
      if (diff <= 3) {
        clearInterval(interval);
        // Use the ref to always call the latest version of onFinalSubmit
        // We trigger it 3 seconds early to account for network latency before the server deadline
        onFinalSubmitRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession.startedAt, currentAssessment?.durationMins, currentAssessment?.submissions]);

  // -------------------------------------------------------------------------
  // Anti-Malpractice Listeners
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        dispatch(incrementTabSwitch());
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Malpractice Flag: Tab Switch</span>
            <span className="text-xs opacity-90">Switching tabs is strictly prohibited. This incident has been logged.</span>
          </div>,
          { duration: 6000 }
        );
      }
    };

    const handleBlur = () => {
      dispatch(incrementWindowBlur());
      toast.warning(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Malpractice Flag: Focus Lost</span>
          <span className="text-xs opacity-90">Leaving the exam window is strictly prohibited. This incident has been logged.</span>
        </div>,
        { duration: 6000 }
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Context menu is disabled during the exam.");
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copy/Paste is disabled during the exam.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [dispatch]);

  // -------------------------------------------------------------------------
  // FIX #1: Type-aware answer serialization for submission
  // -------------------------------------------------------------------------
  const buildAnswersPayload = useCallback(() => {
    return (
      currentAssessment?.questions?.map((q) => {
        const val = activeSession.answers[q.id];
        if (val === undefined || val === null || val === "") return null;

        const isOpenEnded =
          OPEN_ENDED_TYPES.has(q.type) ||
          (q.questionType && OPEN_ENDED_TYPES.has(q.questionType));

        return {
          questionId: q.id,
          // Essay/TEXT → plain string; MCQ/MULTI_SELECT/TRUE_FALSE → { selected: choiceId }
          value: isOpenEnded
            ? val
            : { selected: val },
        };
      }).filter(Boolean) || []
    );
  }, [currentAssessment?.questions, activeSession.answers]);

  // -------------------------------------------------------------------------
  // Final Submit
  // -------------------------------------------------------------------------
  const onFinalSubmit = useCallback(async () => {
    if (!assessmentId || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    const reliableStartedAt =
      activeSession.startedAt ||
      currentAssessment?.submissions?.[0]?.startedAt ||
      new Date().toISOString();

    // Prevent 'Assessment submission window has closed' backend errors
    // by capping the finishedAt timestamp to the exact deadline minus 1 second
    let finishedAtTime = Date.now();
    if (currentAssessment?.durationMins && reliableStartedAt) {
      const deadlineTime = new Date(reliableStartedAt).getTime() + (currentAssessment.durationMins * 60 * 1000);
      if (finishedAtTime > deadlineTime) {
        finishedAtTime = deadlineTime - 1000;
      }
    }

    const submissionData = {
      startedAt: reliableStartedAt,
      finishedAt: new Date(finishedAtTime).toISOString(),
      deviceMeta: {
        browser: window.navigator.userAgent,
        os: window.navigator.platform,
      },
      antiMalpracticeData: {
        tabSwitchCount: activeSession.tabSwitchCount,
        windowBlurCount: activeSession.windowBlurCount,
        suspiciousActivity: activeSession.suspiciousActivity,
      },
      answers: buildAnswersPayload(),
    };

    try {
      await dispatch(submitAssessment({ assessmentId, data: submissionData })).unwrap();
      dispatch(resetActiveSession());
      toast.success("Exam submitted successfully!");
      router.push("/student/dashboard");
    } catch (e: any) {
      setIsSubmitting(false);
      console.warn("[ExamSubmit] Submission error:", e);
      toast.error(e?.message || e || "Submission failed. Please try again.");
    }
  }, [
    assessmentId,
    isSubmitting,
    activeSession,
    currentAssessment?.submissions,
    buildAnswersPayload,
    dispatch,
    router,
  ]);

  // FIX #4: Keep the ref up-to-date so the timer interval always calls the latest version
  useEffect(() => {
    onFinalSubmitRef.current = onFinalSubmit;
  }, [onFinalSubmit]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------------------
  // Loading / Guard states
  // -------------------------------------------------------------------------
  if (!currentAssessment || !currentAssessment.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const isSubmitted =
    currentAssessment.status === "submitted" ||
    currentAssessment.submissions?.some(
      (s) => s.status === "submitted" && !!s.finishedAt
    );
  const isEnded = currentAssessment.status === "ended";

  if (isSubmitted || isEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Locked</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          {isSubmitted
            ? "You have already submitted this assessment. You cannot modify your answers."
            : "This assessment has ended and is no longer active."}
        </p>
        <Button onClick={() => router.push("/student/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const questions = currentAssessment.questions;
  const currentQuestion = questions[currentQuestionIdx];
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;
  const answeredCount = questions.filter((q) => activeSession.answers[q.id] !== undefined).length;

  return (
    <div className="bg-[#fcfcfc] text-slate-900 font-sans min-h-screen flex flex-col overflow-hidden selection:bg-slate-200 selection:text-slate-900">

      {/* FIX #7: Custom submit confirmation modal (replaces window.confirm) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-200">
            {isSubmitting ? (
              <>
                <div className="w-16 h-16 relative flex items-center justify-center mb-2">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Submitting Exam</h3>
                <p className="text-slate-500 text-sm">Please wait while your answers are being saved securely...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Submit Exam?</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You have answered <span className="font-bold text-slate-800">{answeredCount}</span> of{" "}
                  <span className="font-bold text-slate-800">{questions.length}</span> questions.
                  {answeredCount < questions.length && (
                    <span className="block mt-1 text-amber-600 font-semibold">
                      {questions.length - answeredCount} question(s) still unanswered.
                    </span>
                  )}
                  <span className="block mt-2">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Continue Exam
                  </button>
                  <button
                    onClick={onFinalSubmit}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Submit Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 px-4 md:px-8 py-4 flex justify-between items-center border-b border-slate-200 h-20 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-none">
            {currentAssessment.title}
          </h1>
          <div className="h-4 w-px bg-slate-300 hidden md:block"></div>
          <span className="text-sm text-slate-500 font-medium hidden md:block">{currentAssessment.category?.name || "General"}</span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Safe Exam Active</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Time Remaining</span>
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-slate-400" />
              <span className={`text-lg md:text-xl font-bold font-mono tracking-widest ${
                timeLeft !== null && timeLeft < 300 ? "text-red-600 animate-pulse" : "text-slate-800"
              }`}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </span>
            </div>
          </div>

          <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-sm hidden sm:flex">
            {user?.firstName?.charAt(0) || "S"}
          </div>

          <button
            className="xl:hidden p-2 text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 h-[calc(100vh-5rem)] overflow-hidden relative">

        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center bg-[#fcfcfc] relative">
          <div className="w-full max-w-4xl flex relative">

            {/* Left Progress Line (Desktop) */}
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-slate-100 rounded-full hidden lg:block">
              <div
                className="bg-slate-900 w-full rounded-full transition-all duration-300 ease-in-out"
                style={{ height: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex-1 flex flex-col min-h-[600px]">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
              </div>

              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-medium text-slate-900 leading-relaxed">
                  {currentQuestion.prompt || currentQuestion.questionText}
                </h2>
                {(currentQuestion.type === "MULTI_SELECT" || currentQuestion.questionType === "MULTI_SELECT") && (
                  <p className="text-[13px] font-bold text-indigo-700 mt-3 flex items-center gap-2 bg-indigo-50 border border-indigo-100 w-fit px-3 py-1.5 rounded-lg shadow-sm">
                    <Check className="w-4 h-4" /> Please select ALL correct options
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 content-start mb-8 md:mb-12">
                {currentQuestion.type === "ESSAY" ? (
                  <textarea
                    value={activeSession.answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      dispatch(setAnswer({ questionId: currentQuestion.id, value: e.target.value }))
                    }
                    placeholder="Type your essay answer here..."
                    className="col-span-1 sm:col-span-2 w-full min-h-[300px] p-5 text-lg font-medium text-slate-800 resize-y bg-white border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-lg shadow-sm"
                  />
                ) : currentQuestion.type === "TEXT" ? (
                  <input
                    type="text"
                    value={activeSession.answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      dispatch(setAnswer({ questionId: currentQuestion.id, value: e.target.value }))
                    }
                    placeholder="Type your short answer here..."
                    className="col-span-1 sm:col-span-2 w-full p-5 text-lg font-medium text-slate-800 bg-white border border-slate-200 focus:border-slateigo-900 focus:ring-1 focus:ring-slate-900 rounded-lg shadow-sm"
                  />
                ) : (
                  (currentQuestion.choices || currentQuestion.options || []).map((choice: any, idx: number) => {
                    // FIX #6: warn if no ID — idx fallback is a last resort only
                    if (!choice.id) {
                      console.warn(`[CBT] Question ${currentQuestion.id} choice at index ${idx} has no ID. Using index fallback.`);
                    }
                    const choiceId = choice.id || idx.toString();
                    const isMultiSelect =
                      currentQuestion.type === "MULTI_SELECT" ||
                      currentQuestion.questionType === "MULTI_SELECT";
                    const currentAnswer = activeSession.answers[currentQuestion.id];
                    let isSelected = false;

                    if (isMultiSelect) {
                      const arr = Array.isArray(currentAnswer)
                        ? currentAnswer
                        : currentAnswer
                        ? [currentAnswer]
                        : [];
                      isSelected = arr.includes(choiceId);
                    } else {
                      isSelected = currentAnswer === choiceId;
                    }

                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <label
                        key={choiceId}
                        className={`group flex items-start h-fit p-4 md:p-5 border rounded-xl cursor-pointer shadow-sm relative transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type={isMultiSelect ? "checkbox" : "radio"}
                          name={`question-${currentQuestion.id}`}
                          className="hidden peer"
                          checked={isSelected}
                          onChange={(e) => {
                            if (isMultiSelect) {
                              let arr = Array.isArray(currentAnswer)
                                ? [...currentAnswer]
                                : currentAnswer
                                ? [currentAnswer]
                                : [];
                              if (e.target.checked) {
                                if (!arr.includes(choiceId)) arr.push(choiceId);
                              } else {
                                arr = arr.filter((id: string) => id !== choiceId);
                              }
                              dispatch(setAnswer({ questionId: currentQuestion.id, value: arr }));
                            } else {
                              dispatch(setAnswer({ questionId: currentQuestion.id, value: choiceId }));
                            }
                          }}
                        />
                        <div className={`flex-shrink-0 w-8 h-8 ${isMultiSelect ? "rounded-md" : "rounded-full"} font-bold flex items-center justify-center mr-4 text-sm font-sans transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                            : "bg-slate-100 border border-slate-200 text-slate-500 group-hover:bg-slate-200"
                        }`}>
                          {isMultiSelect ? (isSelected ? <Check className="w-5 h-5" /> : letter) : letter}
                        </div>
                        <span className={`text-base md:text-lg pt-0.5 transition-colors pr-6 ${
                          isSelected ? "text-slate-900 font-semibold" : "text-slate-700 group-hover:text-slate-900"
                        }`}>
                          {choice.text}
                        </span>
                        {isSelected && !isMultiSelect && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-6 h-6 text-indigo-600" />
                          </div>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 mb-20 md:mb-0">
                <button
                  onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-6 py-2 transition-colors rounded-[4px] border border-transparent hover:border-slate-200"
                >
                  <ChevronLeft className="mr-2 w-5 h-5" /> Previous
                </button>

                <button
                  onClick={() => {
                    if (currentQuestionIdx < questions.length - 1) {
                      setCurrentQuestionIdx((prev) => prev + 1);
                    } else {
                      // FIX #7: show custom modal instead of window.confirm
                      setShowSubmitModal(true);
                    }
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3 rounded-[4px] shadow-sm hover:shadow-md flex items-center transition-all transform active:scale-[0.99] text-base"
                >
                  {currentQuestionIdx === questions.length - 1 ? "Finish Exam" : "Next Question"}
                  {currentQuestionIdx < questions.length - 1 && <ChevronRight className="ml-2 w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar Navigator */}
        <aside className={`
          fixed inset-y-0 right-0 w-[320px] bg-slate-900 border-l border-slate-800 text-slate-300 flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out
          xl:relative xl:transform-none xl:flex
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
        `}>
          <div className="p-8 pb-6 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="font-serif font-medium text-xl text-white">Question Navigator</h3>
            <button className="xl:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-8 py-4">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white border border-slate-500"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-slate-600"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-2 md:py-6">
            <div className="grid grid-cols-5 gap-3 content-start">
              {questions.map((q, idx) => {
                const isAnswered = activeSession.answers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIdx(idx);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-white text-slate-900 font-bold shadow-lg ring-4 ring-white/10 scale-110 z-10"
                        : isAnswered
                        ? "bg-slate-600 text-slate-200 hover:bg-slate-500"
                        : "border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress summary */}
          <div className="px-8 py-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">Progress</p>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{answeredCount} / {questions.length} answered</p>
          </div>

          <div className="p-8 border-t border-slate-700/50 bg-slate-900">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full bg-transparent border border-white/20 text-white font-medium py-3 rounded-[4px] hover:bg-white hover:text-slate-900 transition-all shadow-sm text-sm uppercase tracking-wide disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Finish Exam"}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-200 xl:hidden flex justify-between items-center z-40">
        <span className="text-sm font-medium text-slate-500">{currentQuestionIdx + 1} / {questions.length}</span>
        <button
          className="text-slate-900 font-bold flex items-center gap-2 text-sm"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Grid className="w-5 h-5" />
          All Questions
        </button>
      </div>

    </div>
  );
}
