"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { 
  submitAssessment, 
  fetchAssessmentDetails 
} from "@/reduxToolKit/student/studentThunks";
import { 
  setAnswer, 
  incrementTabSwitch, 
  incrementWindowBlur 
} from "@/reduxToolKit/student/studentSlice";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Timer,
  Flag,
  Grid,
  CheckCircle,
  AlertTriangle,
  Menu
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Initialize and Fetch Details
  useEffect(() => {
    if (assessmentId) {
      dispatch(fetchAssessmentDetails(assessmentId));
    }
  }, [dispatch, assessmentId]);

  // Timer Logic
  useEffect(() => {
    if (!activeSession.deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(activeSession.deadline!).getTime();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession.deadline]);

  // Anti-Malpractice Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        dispatch(incrementTabSwitch());
        toast.error("Warning: Tab switch detected. This event has been logged.");
      }
    };

    const handleBlur = () => {
       dispatch(incrementWindowBlur());
       toast.warning("Warning: Window focus lost.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [dispatch]);

  const handleAutoSubmit = useCallback(() => {
    toast.info("Time is up! Submitting your exam automatically...");
    onFinalSubmit();
  }, [activeSession, assessmentId]);

  const onFinalSubmit = async () => {
    if (!assessmentId) return;
    
    // Ensure we send all answers, even if empty strings for unanswered questions
    const answersToSend = currentAssessment?.questions?.map(q => {
      const val = activeSession.answers[q.id];
      return {
        questionId: q.id,
        value: val ? { selected: val } : ""
      };
    }) || [];

    const submissionData = {
      finishedAt: new Date().toISOString(),
      antiMalpracticeData: {
        tabSwitchCount: activeSession.tabSwitchCount,
        windowBlurCount: activeSession.windowBlurCount,
        suspiciousActivity: activeSession.suspiciousActivity
      },
      answers: answersToSend
    };

    try {
      await dispatch(submitAssessment({ assessmentId, data: submissionData })).unwrap();
      toast.success("Exam submitted successfully!");
      router.push("/student/dashboard");
    } catch (e: any) {
      toast.error(e || "Submission failed. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentAssessment || !currentAssessment.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const questions = currentAssessment.questions;
  const currentQuestion = questions[currentQuestionIdx];
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="bg-[#fcfcfc] text-slate-900 font-sans min-h-screen flex flex-col overflow-hidden selection:bg-slate-200 selection:text-slate-900">
      
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
                (timeLeft !== null && timeLeft < 300) ? "text-red-600 animate-pulse" : "text-slate-800"
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
                <div className="flex space-x-4">
                  <button className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 group">
                    <Flag className="w-5 h-5" />
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Flag</span>
                  </button>
                </div>
              </div>

              <h2 className="text-xl md:text-3xl lg:text-4xl font-serif font-medium text-slate-900 mb-12 leading-relaxed">
                 {currentQuestion.prompt || currentQuestion.questionText}
              </h2>

              <div className="space-y-4 flex-grow mb-12">
                {(currentQuestion.choices || currentQuestion.options || []).map((choice: any, idx: number) => {
                  const choiceId = choice.id || idx.toString();
                  const isSelected = activeSession.answers[currentQuestion.id] === choiceId;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <label 
                      key={choiceId}
                      className={`group flex items-start p-5 border rounded-[4px] cursor-pointer shadow-sm relative transition-all duration-200 ${
                        isSelected 
                          ? "border-slate-900 bg-slate-50/50" 
                          : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-md"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${currentQuestion.id}`}
                        className="hidden peer"
                        checked={isSelected}
                        onChange={() => dispatch(setAnswer({ questionId: currentQuestion.id, value: choiceId }))}
                      />
                      <div className={`flex-shrink-0 w-8 h-8 rounded-[2px] font-bold flex items-center justify-center mr-5 text-sm font-sans transition-colors ${
                        isSelected 
                          ? "bg-slate-900 text-white" 
                          : "bg-slate-50 border border-slate-200 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700"
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-lg pt-0.5 transition-colors ${
                        isSelected ? "text-slate-900 font-medium" : "text-slate-700 group-hover:text-slate-900"
                      }`}>
                        {choice.text}
                      </span>
                      {isSelected && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <CheckCircle className="w-6 h-6 text-slate-900" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 mb-20 md:mb-0">
                <button 
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center text-slate-500 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-6 py-2 transition-colors rounded-[4px] border border-transparent hover:border-slate-200"
                >
                  <ChevronLeft className="mr-2 w-5 h-5" /> Previous
                </button>
                
                <button 
                  onClick={() => {
                    if (currentQuestionIdx < questions.length - 1) {
                      setCurrentQuestionIdx(prev => prev + 1);
                    } else {
                      if (confirm("Are you sure you want to finish and submit the exam?")) {
                        onFinalSubmit();
                      }
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

        {/* Sidebar Navigator - Desktop & Mobile Overlay */}
        <aside className={`
          fixed inset-y-0 right-0 w-[320px] bg-slate-900 border-l border-slate-800 text-slate-300 flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out
          xl:relative xl:transform-none xl:flex
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
        `}>
          <div className="p-8 pb-6 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="font-serif font-medium text-xl text-white">Question Navigator</h3>
            <button className="xl:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
              <ChevronRight className="w-6 h-6" />
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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Flagged</span>
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
                    key={idx}
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

          <div className="p-8 border-t border-slate-700/50 bg-slate-900">
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to finish and submit the exam?")) {
                  onFinalSubmit();
                }
              }}
              className="w-full bg-transparent border border-white/20 text-white font-medium py-3 rounded-[4px] hover:bg-white hover:text-slate-900 transition-all shadow-sm text-sm uppercase tracking-wide"
            >
              Finish Exam
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
