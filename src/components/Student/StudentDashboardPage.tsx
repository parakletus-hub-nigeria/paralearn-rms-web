"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchStudentAssessments,
  syncOfflineSubmissions,
} from "@/reduxToolKit/student/studentThunks";
import { useGetStudentReportCardQuery } from "@/reduxToolKit/api/endpoints/reports";
import { downloadStudentReportCardPdf } from "@/lib/reportPdf";
import { useSessionsAndTerms } from "@/hooks/useSessionsAndTerms";
import { StudentHeader } from "@/components/Student/StudentHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  ArrowRight,
  Calculator,
  Beaker,
  Lock,
  FileText,
  BarChart3,
  CheckSquare,
  BookOpen,
  Download,
  Trophy,
} from "lucide-react";
import { ProductTour } from "@/components/common/ProductTour";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const studentTourSteps = [
  {
    target: ".student-stats-grid",
    content:
      "Welcome to your command center! Here you can instantly see your overall progress and how many exams you have coming up next.",
    disableBeacon: true,
  },
  {
    target: ".student-assessments-grid",
    content:
      "This is your active assessment board. All your upcoming tests and past assignments are organized here by subject and timeline.",
  },
  {
    target: ".student-enter-lobby-button",
    content:
      "Ready to take a test? Click 'Enter Lobby' to securely start or resume your assessment when the time is right.",
  },
];

export default function StudentDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, loading, error } = useSelector(
    (s: RootState) => s.student,
  );
  const { user } = useSelector((s: RootState) => s.user);

  const [activeTab, setActiveTab] = useState<"active" | "ended" | "reports">("active");
  const [resultAssessment, setResultAssessment] = useState<any>(null);

  // Report card state
  const { sessionOptions, allTermOptions, getTermsForSession, currentSession, currentTerm } = useSessionsAndTerms();
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Auto-select current session/term
  useEffect(() => {
    if (currentSession && !selectedSession) setSelectedSession(currentSession);
    if (currentTerm && !selectedTerm) setSelectedTerm(currentTerm);
  }, [currentSession, currentTerm, selectedSession, selectedTerm]);

  const termOptionsForSession = selectedSession
    ? getTermsForSession(selectedSession)
    : allTermOptions;

  const studentId = (user as any)?.id || "";
  const classId =
    (user as any)?.classId ||
    (user as any)?.class?.id ||
    (user as any)?.studentProfile?.classId ||
    "";

  const { data: reportCard, isLoading: reportLoading, isError: reportError } =
    useGetStudentReportCardQuery(
      { studentId, session: selectedSession, term: selectedTerm },
      { skip: !studentId || !selectedSession || !selectedTerm || activeTab !== "reports" },
    );

  const handleDownloadPdf = async () => {
    if (!studentId || !selectedSession || !selectedTerm) {
      toast.error("Please select a session and term first");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadStudentReportCardPdf({ studentId, session: selectedSession, term: selectedTerm });
      toast.success("Report card downloaded!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to download report card");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Guard against React StrictMode double-invoke and repeated mounts
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    dispatch(fetchStudentAssessments());

    // Sync offline submissions when dashboard loads
    const syncOffline = async () => {
      if (hasSyncedRef.current) return;
      hasSyncedRef.current = true;

      try {
        const rawSubmissions = localStorage.getItem("offline_submissions");
        if (!rawSubmissions) return;

        const allSaved: any[] = JSON.parse(rawSubmissions);
        if (!Array.isArray(allSaved) || allSaved.length === 0) {
          localStorage.removeItem("offline_submissions");
          return;
        }

        // Drop items that have been retried too many times (stale/already submitted)
        const MAX_RETRIES = 3;
        const retryable = allSaved.filter(
          (s) => (s.syncAttempts ?? 0) < MAX_RETRIES,
        );

        if (retryable.length === 0) {
          // All items exhausted retries — clear and stop spamming
          localStorage.removeItem("offline_submissions");
          return;
        }

        toast.info(
          `Attempting to sync ${retryable.length} offline submission(s)...`,
        );

        try {
          await dispatch(syncOfflineSubmissions(retryable)).unwrap();
          localStorage.removeItem("offline_submissions");
          toast.success("Offline submissions synced successfully!");
          dispatch(fetchStudentAssessments());
        } catch (err: any) {
          const status = err?.statusCode ?? err?.status ?? err?.data?.statusCode;
          const isAlreadyProcessed =
            status === 400 || status === 409 || status === 422;

          if (isAlreadyProcessed) {
            // Backend already has these — safe to discard, they won't succeed on retry
            localStorage.removeItem("offline_submissions");
            console.info("[OfflineSync] Server rejected as already processed — cleared localStorage");
          } else {
            // Network or server error — increment retry counter and save back
            const incremented = allSaved.map((s) => ({
              ...s,
              syncAttempts: (s.syncAttempts ?? 0) + 1,
            }));
            localStorage.setItem(
              "offline_submissions",
              JSON.stringify(incremented),
            );
            console.warn("[OfflineSync] Sync failed, will retry next visit", err);
            toast.error("Failed to sync offline submissions. Will try again later.");
          }
        }
      } catch (parseErr) {
        // Corrupted localStorage entry — clear it
        localStorage.removeItem("offline_submissions");
        console.error("[OfflineSync] Corrupted offline_submissions data, cleared", parseErr);
      }
    };

    if (typeof window !== "undefined" && navigator.onLine) {
      syncOffline();
    }
  }, [dispatch]);

  // K-12 System: Backend already filters for published assessments only
  // All assessments in this list are guaranteed to be published and available for students
  const visibleAssessments = assessments || [];

  const activeList = visibleAssessments.filter((a) => a.status !== "ended");
  const endedList = visibleAssessments.filter((a) => a.status === "ended");

  const currentList = activeTab === "active" ? activeList : endedList;

  const completedCount = visibleAssessments.filter(
    (a) =>
      a.status === "submitted" ||
      a.submissions?.some((s) => s.status === "submitted" && !!s.finishedAt),
  ).length;

  const upcomingCount = activeList.filter((a) => {
    const isSubmitted =
      a.status === "submitted" ||
      a.submissions?.some((s) => s.status === "submitted" && !!s.finishedAt);
    return !isSubmitted;
  }).length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col relative font-sans overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#e0e7ff] opacity-60" />
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(at_0%_0%,hsla(253,16%,7%,1)_0,transparent_50%)] opactity-80" />
        <div className="absolute top-0 left-[50%] w-full h-[600px] bg-[radial-gradient(at_50%_0%,hsla(225,39%,30%,1)_0,transparent_50%)] opacity-60" />
        <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(at_100%_0%,hsla(339,49%,30%,1)_0,transparent_50%)] opacity-50" />
      </div>

      <div className="relative z-10 w-full">
        <ProductTour tourKey="student_dashboard" steps={studentTourSteps} />
        <StudentHeader transparent={true} />

        <main className="w-full pb-20">
          <div className="relative pt-16 pb-24 text-center px-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-semibold tracking-wider uppercase mb-2 backdrop-blur-sm shadow-sm">
                {/* FIX #11: Removed hardcoded year — use dynamic value when API provides it */}
                Online Assessment Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-sm tracking-tight">
                Welcome back, {user?.firstName || "Student"}!
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-light leading-relaxed">
                Your academic journey continues. You have{" "}
                <span className="font-bold text-white border-b-2 border-indigo-400 px-1">
                  {activeList.length} assessment
                  {activeList.length !== 1 ? "s" : ""}
                </span>{" "}
                waiting for you.
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
            {/* Stats Grid */}
            <div className="student-stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total Assessments
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {visibleAssessments.length}
                  </p>
                </div>
              </div>

              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Upcoming Exams
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {upcomingCount}
                  </p>
                </div>
              </div>

              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Completed Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {completedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center justify-center mb-10">
              <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 flex gap-2 shadow-sm">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "active"
                      ? "text-indigo-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {activeTab === "active" && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-xl shadow-md z-0"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <PlayCircle
                    className={`w-4 h-4 relative z-10 ${activeTab === "active" ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <span className="relative z-10">Active Exams</span>
                  {activeList.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`relative z-10 ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === "active"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {activeList.length}
                    </motion.span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("ended")}
                  className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "ended"
                      ? "text-red-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {activeTab === "ended" && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-xl shadow-md z-0"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <Clock
                    className={`w-4 h-4 relative z-10 ${activeTab === "ended" ? "text-red-600" : "text-slate-400"}`}
                  />
                  <span className="relative z-10">History</span>
                  {endedList.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`relative z-10 ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeTab === "ended"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {endedList.length}
                    </motion.span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === "reports"
                      ? "text-emerald-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {activeTab === "reports" && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-xl shadow-md z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <BookOpen
                    className={`w-4 h-4 relative z-10 ${activeTab === "reports" ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <span className="relative z-10">Report Cards</span>
                </button>
              </div>
            </div>

            {activeTab === "reports" ? (
              <StudentReportCardTab
                sessionOptions={sessionOptions}
                termOptions={termOptionsForSession}
                selectedSession={selectedSession}
                selectedTerm={selectedTerm}
                onSessionChange={(v) => { setSelectedSession(v); setSelectedTerm(""); }}
                onTermChange={setSelectedTerm}
                reportCard={reportCard}
                reportLoading={reportLoading}
                reportError={reportError}
                onDownload={handleDownloadPdf}
                downloadingPdf={downloadingPdf}
              />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
                <p className="text-white font-medium">
                  Loading your assessments...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50/90 backdrop-blur-md border border-red-100 p-8 rounded-3xl text-center max-w-2xl mx-auto shadow-lg">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Unavailable
                </h3>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <Button
                  onClick={() => dispatch(fetchStudentAssessments())}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-6"
                >
                  Retry Connection
                </Button>
              </div>
            ) : currentList.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-md border border-white/30 p-16 rounded-3xl text-center shadow-lg max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {activeTab === "active" ? (
                    <ClipboardList className="w-12 h-12 text-indigo-400" />
                  ) : (
                    <Clock className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 font-serif">
                  {activeTab === "active" ? "All Caught Up!" : "No History Yet"}
                </h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto">
                  {activeTab === "active"
                    ? "You have no pending assessments at the moment. Enjoy your free time!"
                    : "Your completed and expired exams will appear here in the future."}
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="student-assessments-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
              >
                <AnimatePresence mode="popLayout">
                  {currentList.map((assessment, idx) => {
                    const subjectName = assessment.subject?.name || "General";
                    // ... (rest of normalization logic inside map)
                    const isMath = subjectName.toLowerCase().includes("math");
                    const isScience =
                      subjectName.toLowerCase().includes("science") ||
                      subjectName.toLowerCase().includes("physics") ||
                      subjectName.toLowerCase().includes("chem");
                    const isSubmitted =
                      assessment.status === "submitted" ||
                      assessment.submissions?.some(
                        (s) => s.status === "submitted" || !!s.finishedAt,
                      );
                    const isOffline = assessment.isOnline === false;

                    let statusLabel = "Not Started";
                    let statusBgClass =
                      "bg-white/50 text-slate-600 border-white";
                    if (isSubmitted) {
                      statusLabel = "Completed";
                      statusBgClass =
                        "bg-emerald-100/80 text-emerald-700 border-emerald-200";
                    } else if (
                      assessment.status === "started" ||
                      assessment.submissions?.some(
                        (s) =>
                          s.status === "started" || s.status === "in_progress",
                      )
                    ) {
                      statusLabel = "In Progress";
                      statusBgClass =
                        "bg-amber-100/80 text-amber-700 border-amber-200";
                    } else if (assessment.status === "ended") {
                      statusLabel = "Ended";
                      statusBgClass =
                        "bg-red-100/80 text-red-700 border-red-200";
                    }

                    // Gradient colors based on subject
                    const gradientClass = isMath
                      ? "from-pink-500 to-rose-500"
                      : isScience
                        ? "from-cyan-500 to-blue-500"
                        : "from-indigo-500 to-purple-500";

                    const iconColorClass = isMath
                      ? "text-rose-600"
                      : isScience
                        ? "text-cyan-600"
                        : "text-indigo-600";

                    const bgIconClass = isMath
                      ? "bg-rose-50 border-rose-100"
                      : isScience
                        ? "bg-cyan-50 border-cyan-100"
                        : "bg-indigo-50 border-indigo-100";

                    return (
                      <motion.div
                        key={assessment.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="group bg-white/65 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex flex-col h-auto min-h-[340px] shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Glow Effect */}
                        <div
                          className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-current ${iconColorClass}`}
                        ></div>

                        <div
                          className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${gradientClass} text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-md uppercase tracking-wide z-10`}
                        >
                          {subjectName} {isOffline ? "(Offline)" : ""}
                        </div>

                        <div className="mt-4 flex justify-between items-start mb-6 z-10 relative">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${bgIconClass} ${iconColorClass}`}
                          >
                            {isMath ? (
                              <Calculator className="w-7 h-7" />
                            ) : isScience ? (
                              <Beaker className="w-7 h-7" />
                            ) : (
                              <ClipboardList className="w-7 h-7" />
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-sm backdrop-blur-sm ${statusBgClass}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <h2
                          className={`text-2xl font-bold text-slate-800 mb-2 transition-colors relative z-10 group-hover:${iconColorClass}`}
                        >
                          {assessment.title}
                        </h2>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                          {assessment.instructions ||
                            "No detailed instructions provided for this assessment."}
                        </p>

                        <div className="mt-auto space-y-4 relative z-10">
                          <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                            {!isOffline && (
                              <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-lg border border-white/20">
                                <Clock
                                  className={`w-4 h-4 ${iconColorClass}`}
                                />
                                <span>{assessment.durationMins} Mins</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-lg border border-white/20">
                              <CheckCircle
                                className={`w-4 h-4 ${iconColorClass}`}
                              />
                              <span>{assessment.questionCount || "?"} Qs</span>
                            </div>
                          </div>

                          {isSubmitted ? (
                            <Button
                              onClick={() => setResultAssessment(assessment)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-2xl shadow-md"
                            >
                              View Result <BarChart3 className="w-4 h-4 ml-2" />
                            </Button>
                          ) : isOffline ? (
                            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold py-6 rounded-2xl shadow-none cursor-not-allowed">
                              Paper Exam <Lock className="w-4 h-4 ml-2" />
                            </Button>
                          ) : statusLabel === "Ended" ? (
                            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-red-400 font-semibold py-6 rounded-2xl shadow-none cursor-not-allowed flex items-center justify-center gap-2">
                              Time Expired <Lock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Link
                              href={`/student/lobby?assessmentId=${assessment.id}`}
                              className="block"
                            >
                              <Button
                                className={`student-enter-lobby-button w-full bg-gradient-to-r ${gradientClass} bg-[length:200%_auto] hover:bg-[position:right_center] text-white py-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 font-bold shadow-lg group-hover:shadow-xl`}
                              >
                                {statusLabel === "In Progress"
                                  ? "Resume Exam"
                                  : "Enter Lobby"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Result Modal */}
      {resultAssessment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setResultAssessment(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Assessment Result</h2>
              <button
                onClick={() => setResultAssessment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">{resultAssessment.title}</p>
            <p className="text-sm text-slate-500 mb-6">
              {resultAssessment.subject?.name || "General"} •{" "}
              {resultAssessment.subject?.class?.name || ""}
            </p>
            {(() => {
              const submission = resultAssessment.submissions?.[0];
              const score = submission?.score ?? submission?.totalScore ?? null;
              const totalMarks = resultAssessment.totalMarks ?? resultAssessment.maxMarks ?? null;
              const passingMarks = resultAssessment.passingMarks ?? null;
              const passed = score !== null && passingMarks !== null ? score >= passingMarks : null;

              return (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-5 text-center">
                    {score !== null ? (
                      <>
                        <p className="text-5xl font-black text-slate-800">
                          {score}
                          {totalMarks !== null && (
                            <span className="text-2xl font-medium text-slate-400">/{totalMarks}</span>
                          )}
                        </p>
                        {totalMarks !== null && (
                          <p className="text-sm text-slate-500 mt-1">
                            {((score / totalMarks) * 100).toFixed(1)}%
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="py-3">
                        <Clock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">Awaiting Manual Grading</p>
                        <p className="text-sm text-slate-400 mt-1">Your teacher is reviewing your answers.</p>
                      </div>
                    )}
                  </div>
                  {passed !== null && (
                    <div className={`rounded-xl px-4 py-3 text-center font-semibold text-sm ${passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {passed ? "✓ Passed" : "✗ Did not meet passing mark"}
                      {passingMarks !== null && (
                        <span className="font-normal opacity-75"> (passing: {passingMarks})</span>
                      )}
                    </div>
                  )}
                  {submission?.finishedAt && (
                    <p className="text-xs text-slate-400 text-center">
                      Submitted {new Date(submission.finishedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Report Card Tab ─────────────────────────────────────────────────

type StudentReportCardTabProps = {
  sessionOptions: { value: string; label: string }[];
  termOptions: { value: string; label: string }[];
  selectedSession: string;
  selectedTerm: string;
  onSessionChange: (v: string) => void;
  onTermChange: (v: string) => void;
  reportCard: any;
  reportLoading: boolean;
  reportError: boolean;
  onDownload: () => void;
  downloadingPdf: boolean;
};

function StudentReportCardTab({
  sessionOptions,
  termOptions,
  selectedSession,
  selectedTerm,
  onSessionChange,
  onTermChange,
  reportCard,
  reportLoading,
  reportError,
  onDownload,
  downloadingPdf,
}: StudentReportCardTabProps) {
  const raw = reportCard?.data ?? reportCard;

  // The grades API returns: { studentId, term, session, grades: { overall: {...}, [subjectId]: SubjectGrade }, student: {...} }
  // When the student has no active enrollments/subjects, the backend returns overall.grade = 'N/A'
  const data = raw;
  const gradesMap: Record<string, any> = data?.grades ?? {};
  const overall = gradesMap.overall;
  const subjects: any[] = Object.entries(gradesMap)
    .filter(([k]) => k !== "overall")
    .map(([subjectId, grade]: [string, any]) => ({ subjectId, ...grade }));
  const studentName = data?.student
    ? `${data.student.firstName || ""} ${data.student.lastName || ""}`.trim()
    : data?.studentName ?? "";
  const average = overall?.percent ?? data?.summary?.average ?? data?.average ?? null;
  const overallGrade = overall?.grade ?? data?.summary?.overallGrade ?? data?.overallGrade ?? null;
  // grades API generates on-the-fly, no published status — treat data presence as availability
  const isAvailable = !!data && (subjects.length > 0 || !!overall);
  // 'N/A' grade means backend found no subjects/enrollments for this student — no real scores yet
  const hasNoScores = subjects.length === 0 && (overallGrade === "N/A" || overall?.score === 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Session / Term selectors */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        <Select value={selectedSession} onValueChange={onSessionChange}>
          <SelectTrigger className="h-11 flex-1 rounded-xl bg-white border-slate-200">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {sessionOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTerm} onValueChange={onTermChange} disabled={!selectedSession}>
          <SelectTrigger className="h-11 flex-1 rounded-xl bg-white border-slate-200">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {termOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* States */}
      {!selectedSession || !selectedTerm ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-12 rounded-3xl text-center">
          <BookOpen className="w-14 h-14 text-white/50 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">Select a session and term</p>
          <p className="text-white/70 mt-1 text-sm">Your report cards will appear here once you choose an academic period.</p>
        </div>
      ) : reportLoading ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-12 rounded-3xl text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white font-medium">Loading your report card…</p>
        </div>
      ) : reportError ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-12 rounded-3xl text-center">
          <AlertCircle className="w-14 h-14 text-red-300 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">Could Not Load Report Card</p>
          <p className="text-white/70 mt-1 text-sm max-w-sm mx-auto">
            There was a problem fetching your report card. Please try again or contact your school administrator.
          </p>
        </div>
      ) : !isAvailable ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-12 rounded-3xl text-center">
          <FileText className="w-14 h-14 text-white/40 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">No Report Card Available</p>
          <p className="text-white/70 mt-1 text-sm max-w-sm mx-auto">
            No grades have been recorded for this period yet. Check back after your teacher submits scores.
          </p>
        </div>
      ) : hasNoScores ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/30 p-12 rounded-3xl text-center">
          <BarChart3 className="w-14 h-14 text-white/40 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">No Scores Recorded Yet</p>
          <p className="text-white/70 mt-1 text-sm max-w-sm mx-auto">
            Your teacher hasn't uploaded scores for this term yet. Report cards will appear here once scores are available.
          </p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{studentName || "Report Card"}</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  {selectedSession} • {selectedTerm}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                {average != null && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span className="text-2xl font-black">{Number(average).toFixed(1)}%</span>
                  </div>
                )}
                {overallGrade && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                    Grade: {overallGrade}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subject scores */}
          {subjects.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-4 sm:px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Max</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">%</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((subj: any, i: number) => {
                    const name = subj.subjectName || subj.name || "—";
                    const score = subj.score ?? subj.totalScore ?? "—";
                    const max = subj.max ?? "—";
                    const pct = subj.percent != null ? Number(subj.percent).toFixed(1) + "%" : "—";
                    const grade = subj.grade ?? subj.letterGrade ?? "—";
                    const gradeColor =
                      grade === "A" ? "bg-emerald-100 text-emerald-700" :
                      grade === "B" ? "bg-blue-100 text-blue-700" :
                      grade === "C" ? "bg-yellow-100 text-yellow-700" :
                      grade === "F" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600";
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-5 font-medium text-slate-800 text-sm">{name}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 text-sm">{score}</td>
                        <td className="py-3 px-3 text-center text-slate-500 text-sm">{max}</td>
                        <td className="py-3 px-3 text-center text-slate-600 text-sm">{pct}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor}`}>
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Download button */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col gap-2">
            <Button
              onClick={onDownload}
              disabled={downloadingPdf || hasNoScores || subjects.length === 0}
              className="w-full sm:w-auto h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {downloadingPdf ? "Downloading…" : "Download PDF"}
            </Button>
            {subjects.length === 0 && (
              <p className="text-xs text-slate-400">PDF available once subject scores are recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
