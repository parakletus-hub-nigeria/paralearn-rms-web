"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  GraduationCap,
  LockKeyhole,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useRouter } from "next/navigation";
import {
  useStartExamMutation,
  useSendCbtHeartbeatMutation,
  useSubmitExamMutation,
  useGetStudentResultsQuery,
} from "@/reduxToolKit/uniFeatures/cbtApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetUpcomingAssessmentsQuery } from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PRIMARY = "#641BC4";

export function StudentExamsPage() {
  const { tenantInfo, user } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;
  const router = useRouter();
  const [enrollmentError, setEnrollmentError] = useState<{
    courseCode: string;
    courseTitle: string;
  } | null>(null);

  const { data: upcomingAssessments, isLoading: isLoadingUpcoming } =
    useGetUpcomingAssessmentsQuery();

  const { data: resultsData } = useGetStudentResultsQuery();
  const submittedIds = new Set<string>(
    (Array.isArray(resultsData) ? resultsData : resultsData?.data || []).map(
      (r: any) => r.assessment?.id ?? r.assessmentId
    )
  );

  const [activeExam, setActiveExam] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [startExam, { isLoading: isStarting }] = useStartExamMutation();
  const [sendHeartbeat] = useSendCbtHeartbeatMutation();
  const [submitExam, { isLoading: isSubmitting }] = useSubmitExamMutation();

  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheating state
  const [suspiciousFlags, setSuspiciousFlags] = useState<
    { type: string; time: string }[]
  >([]);

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeExam) {
      handleFinalSubmit();
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [timeLeft, activeExam]);

  const startHeartbeat = (assessmentId: string) => {
    const deviceId = navigator.userAgent;
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    heartbeatInterval.current = setInterval(async () => {
      try {
        await sendHeartbeat({ assessmentId, deviceId }).unwrap();
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    }, 20000); // 20 seconds
  };

  const handleStartExam = async (assessmentId: string, assessment?: any) => {
    setEnrollmentError(null);
    try {
      const deviceId = navigator.userAgent;
      const response = await startExam({ assessmentId, deviceId }).unwrap();

      const examData = response.data || response;
      setActiveExam(examData);
      setTimeLeft((examData.durationMinutes || examData.duration || 60) * 60);
      setCurrentQuestionIndex(0);
      setAnswers({});

      startHeartbeat(assessmentId);
      toast.success("Exam started! Integrity monitoring active.");
    } catch (e: any) {
      const msg: string = e?.data?.message || e?.message || "";
      // Check if the error is about enrollment
      if (msg.toLowerCase().includes("enroll")) {
        setEnrollmentError({
          courseCode: assessment?.course?.code || "",
          courseTitle: assessment?.course?.title || "this course",
        });
      } else {
        toast.error(msg || "Failed to start exam");
      }
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedOptionId: optionId },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { textAnswer: text } }));
  };

  const handleFinalSubmit = async () => {
    if (!activeExam) return;

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]: [string, any]) => ({
          questionId,
          ...value,
        }),
      );

      await submitExam({
        assessmentId: activeExam.id,
        answers: formattedAnswers,
      }).unwrap();

      toast.success("Exam submitted successfully!");
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      setActiveExam(null);
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to submit exam");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Anti-cheating listeners
  useEffect(() => {
    if (!activeExam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSuspiciousFlags((prev) => [
          ...prev,
          { type: "TAB_SWITCH", time: new Date().toISOString() },
        ]);
        toast.warning("Warning: Tab switching is being logged.", {
          description: "This activity may flag your submission for review.",
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeExam]);

  if (activeExam) {
    const questions = activeExam.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col select-none">
        {/* Exam Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              {currentQuestionIndex + 1}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">
                {activeExam.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
              timeLeft < 300
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${timeLeft < 300 ? "animate-pulse" : ""}`}
            />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>

          <Button
            onClick={() => {
              if (confirm("Are you sure you want to submit?"))
                handleFinalSubmit();
            }}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 gap-2"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[400px]">
              <div className="flex items-start justify-between mb-8">
                <Badge className="bg-purple-100 text-purple-700 h-6 border-0">
                  {currentQuestion?.type}
                </Badge>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {currentQuestion?.points} Points
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 leading-snug mb-10">
                {currentQuestion?.content}
              </h3>

              {currentQuestion?.type === "MCQ" && (
                <div className="space-y-4">
                  {currentQuestion.options?.map((opt: any) => {
                    const isSelected =
                      answers[currentQuestion.id]?.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          handleOptionSelect(currentQuestion.id, opt.id)
                        }
                        className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                          isSelected
                            ? "border-purple-600 bg-purple-50 text-purple-900"
                            : "border-slate-100 hover:border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="font-bold text-lg">{opt.content}</span>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-purple-600 bg-purple-600"
                              : "border-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion?.type === "ESSAY" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 mb-2 italic">
                    Type your response below:
                  </p>
                  <Textarea
                    value={answers[currentQuestion.id]?.textAnswer || ""}
                    onChange={(e) =>
                      handleTextChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Enter your answer here..."
                    className="min-h-[250px] rounded-2xl border-slate-200 focus:ring-purple-600 text-lg leading-relaxed p-6"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="h-12 rounded-2xl px-6 font-bold gap-2 border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </Button>

              <div className="flex gap-2">
                {questions.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-all ${
                      i === currentQuestionIndex
                        ? "bg-purple-600 w-10"
                        : i < currentQuestionIndex
                          ? "bg-emerald-400"
                          : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="default"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="h-12 rounded-2xl px-8 font-bold gap-2 bg-[#641BC4]"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Navigator
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q: any, i: number) => {
                  const isAnswered = !!answers[q.id];
                  const isActive = i === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? "bg-purple-600 text-white ring-4 ring-purple-100"
                          : isAnswered
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Honor Code
                </span>
              </div>
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                Remember, all activity including tab switching and copy-pasting
                is logged for integrity review.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 mt-6">
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
            University CBT Center
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            Here are your active and upcoming assessments for enrolled courses.
          </p>
        </div>

        {/* Enrollment required banner */}
        {enrollmentError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-black text-amber-900">
                Enrollment Required
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                You must formally enroll in{" "}
                <strong>
                  {enrollmentError.courseCode
                    ? `${enrollmentError.courseCode} – `
                    : ""}
                  {enrollmentError.courseTitle}
                </strong>{" "}
                before you can sit this exam. You can attend lectures without
                enrolling, but exam access requires formal registration.
              </p>
            </div>
            <Button
              onClick={() => {
                setEnrollmentError(null);
                router.push("/uni-student/courses");
              }}
              className="flex-shrink-0 h-10 px-5 rounded-xl text-white font-bold gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <GraduationCap className="w-4 h-4" />
              Go to Academic Registry
            </Button>
          </div>
        )}

        {isLoadingUpcoming ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div
              className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200"
              style={{ borderTopColor: primaryColor }}
            />
            <p className="text-slate-500 text-sm font-medium mt-4">
              Loading your assessments...
            </p>
          </div>
        ) : !upcomingAssessments || upcomingAssessments.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold">No upcoming assessments found.</p>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
              Assessments only appear here for courses you are{" "}
              <strong>formally enrolled</strong> in. You can attend any class,
              but you must enroll via{" "}
              <button
                onClick={() => router.push("/uni-student/courses")}
                className="text-[#641BC4] font-bold underline underline-offset-2"
              >
                Academic Registry
              </button>{" "}
              to access exams.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAssessments.map((asmt: any) => (
              <div
                key={asmt.id}
                className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${submittedIds.has(asmt.id) ? "border-emerald-100" : "border-slate-100"}`}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${submittedIds.has(asmt.id) ? "bg-emerald-400" : "bg-[#641BC4]"}`} />
                <div className="flex items-center justify-between mb-4">
                  {submittedIds.has(asmt.id) ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 h-6">
                      SUBMITTED
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 h-6">
                      AVAILABLE
                    </Badge>
                  )}
                  <ShieldCheck className={`w-5 h-5 ${submittedIds.has(asmt.id) ? "text-emerald-500" : "text-emerald-500"}`} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {asmt.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-1">
                  {asmt.course?.code} - {asmt.course?.title}
                </p>
                <p className="text-xs font-bold text-purple-600 mb-6 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {asmt.durationMinutes || 60} Minutes
                </p>

                {submittedIds.has(asmt.id) ? (
                  <div className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Submitted
                  </div>
                ) : (
                  <Button
                    onClick={() => handleStartExam(asmt.id, asmt)}
                    disabled={isStarting}
                    className="w-full h-11 rounded-xl gap-2 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isStarting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        Take Exam
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
