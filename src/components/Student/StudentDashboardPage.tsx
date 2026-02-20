"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchStudentAssessments } from "@/reduxToolKit/student/studentThunks";
import { StudentHeader } from "@/components/Student/StudentHeader";
import { Button } from "@/components/ui/button";
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
  CheckSquare
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, loading, error } = useSelector((s: RootState) => s.student);
  const { user } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    dispatch(fetchStudentAssessments());
  }, [dispatch]);

  // Calculate stats
  const completedCount = assessments.filter(a => a.status === 'submitted' || a.submission?.status === 'submitted').length;
  /* Fix: strict check for null/undefined to include 0 as valid score */
  const averageScore = assessments.reduce((acc, curr) => {
    if (curr.submission?.score != null) return acc + curr.submission.score;
    return acc;
  }, 0) / (completedCount || 1);

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
        <StudentHeader transparent={true} />
        
        <main className="w-full pb-20">
          <div className="relative pt-16 pb-24 text-center px-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-semibold tracking-wider uppercase mb-2 backdrop-blur-sm shadow-sm">
                Academic Session 2024/2025
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-sm tracking-tight">
                Welcome back, {user?.firstName || "Student"}!
              </h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-light leading-relaxed">
                Your academic journey continues. You have <span className="font-bold text-white border-b-2 border-indigo-400 px-1">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''}</span> waiting for you.
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming Exams</p>
                  <p className="text-2xl font-bold text-gray-800">{assessments.length}</p>
                </div>
              </div>
              
              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Average Score</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(averageScore)}%</p>
                </div>
              </div>

              <div className="bg-white/65 backdrop-blur-xl border border-white/40 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed Tests</p>
                  <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-md rounded-3xl border border-white/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4" />
                <p className="text-white font-medium">Loading your assessments...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50/90 backdrop-blur-md border border-red-100 p-8 rounded-3xl text-center max-w-2xl mx-auto shadow-lg">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Unavailable</h3>
                <p className="text-red-700 font-medium mb-6">{error}</p>
                <Button onClick={() => dispatch(fetchStudentAssessments())} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 py-6">Retry Connection</Button>
              </div>
            ) : assessments.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-md border border-white/30 p-16 rounded-3xl text-center shadow-lg max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <ClipboardList className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3 font-serif">All Caught Up!</h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto">You have no pending assessments at the moment. Enjoy your free time!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {assessments
                  .filter(a => a.isOnline !== false || (a.status === 'submitted' || a.submission?.status === 'submitted'))
                  .map((assessment, idx) => {
                  const subjectName = assessment.subject?.name || "General";
                  const isMath = subjectName.toLowerCase().includes('math');
                  const isScience = subjectName.toLowerCase().includes('science') || subjectName.toLowerCase().includes('physics') || subjectName.toLowerCase().includes('chem');
                  const isSubmitted = assessment.status === 'submitted' || assessment.submission?.status === 'submitted';
                  const isOffline = assessment.isOnline === false;
                  
                  let statusLabel = "Not Started";
                  let statusBgClass = "bg-white/50 text-slate-600 border-white";
                  if (isSubmitted) {
                    statusLabel = "Completed";
                    statusBgClass = "bg-emerald-100/80 text-emerald-700 border-emerald-200";
                  } else if (assessment.status === 'started' || assessment.submission?.status === 'started' || assessment.submission?.status === 'in_progress') {
                    statusLabel = "In Progress";
                    statusBgClass = "bg-amber-100/80 text-amber-700 border-amber-200";
                  } else if (assessment.status === 'ended') {
                    statusLabel = "Ended";
                    statusBgClass = "bg-red-100/80 text-red-700 border-red-200";
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
                    <div key={assessment.id} className="group bg-white/65 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex flex-col h-auto min-h-[340px] shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                      {/* Glow Effect */}
                      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-current ${iconColorClass}`}></div>
                      
                      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${gradientClass} text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-md uppercase tracking-wide z-10`}>
                        {subjectName} {isOffline ? "(Offline)" : ""}
                      </div>

                      <div className="mt-4 flex justify-between items-start mb-6 z-10 relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${bgIconClass} ${iconColorClass}`}>
                          {isMath ? <Calculator className="w-7 h-7" /> : isScience ? <Beaker className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border shadow-sm backdrop-blur-sm ${statusBgClass}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <h2 className={`text-2xl font-bold text-slate-800 mb-2 transition-colors relative z-10 group-hover:${iconColorClass}`}>
                        {assessment.title}
                      </h2>
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {assessment.instructions || "No detailed instructions provided for this assessment."}
                      </p>

                      <div className="mt-auto space-y-4 relative z-10">
                        <div className="flex items-center gap-4 text-slate-600 text-sm font-medium">
                          {!isOffline && (
                            <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-lg border border-white/20">
                              <Clock className={`w-4 h-4 ${iconColorClass}`} />
                              <span>{assessment.durationMins} Mins</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-lg border border-white/20">
                            <CheckCircle className={`w-4 h-4 ${iconColorClass}`} />
                            <span>{assessment.questionCount || "?"} Qs</span>
                          </div>
                        </div>

                        {isSubmitted ? (
                          <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-400 font-semibold py-6 rounded-2xl shadow-none cursor-not-allowed">
                            View Result <Lock className="w-4 h-4 ml-2" />
                          </Button>
                        ) : isOffline ? (
                           <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold py-6 rounded-2xl shadow-none cursor-not-allowed">
                            Paper Exam <Lock className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Link href={`/student/lobby?assessmentId=${assessment.id}`} className="block">
                            <Button className={`w-full bg-gradient-to-r ${gradientClass} bg-[length:200%_auto] hover:bg-[position:right_center] text-white py-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 font-bold shadow-lg group-hover:shadow-xl`}>
                              {statusLabel === "In Progress" ? "Resume Exam" : "Enter Lobby"}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
