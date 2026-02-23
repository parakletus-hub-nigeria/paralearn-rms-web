"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAssessmentDetails, startAssessment } from "@/reduxToolKit/student/studentThunks";
import { StudentHeader } from "@/components/Student/StudentHeader";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  Wifi, 
  Camera, 
  Mic, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Lock,
  Calendar,
  Layers,
  Timer,
  BadgeCheck
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

export default function ExamLobbyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");

  const { currentAssessment: assessment, loading, error } = useSelector((s: RootState) => s.student);
  const { user } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    if (assessmentId) {
      dispatch(fetchAssessmentDetails(assessmentId));
    }
  }, [dispatch, assessmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3efff]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!assessment || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3efff] p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Unavailable</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">{error || "The assessment you're looking for was not found."}</p>
        <Button onClick={() => router.push('/student/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const isSubmitted = assessment.status === 'submitted' || assessment.submissions?.some(s => s.status === 'submitted' || !!s.finishedAt);
  const isEnded = assessment.status === 'ended';

  if (isSubmitted || isEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3efff] p-6 text-center">
        <Lock className="w-16 h-16 text-indigo-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Locked</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          {isSubmitted 
            ? "You have already submitted this assessment. Multiple attempts are not permitted." 
            : "This assessment has ended and is no longer accepting submissions."}
        </p>
        <Button onClick={() => router.push('/student/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c7d2fe] flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-x-hidden font-sans">
      
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(at_47%_33%,hsla(268,69%,78%,1)_0px,transparent_50%),radial-gradient(at_82%_65%,hsla(238,62%,75%,1)_0px,transparent_50%)] opactity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-300/30 rounded-full blur-[100px] mix-blend-multiply filter"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply filter"></div>
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-pink-200/30 rounded-full blur-[80px] mix-blend-multiply filter animate-pulse"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-inner font-bold text-sm">PL</div>
          <span className="text-lg font-bold tracking-tight text-slate-900 pr-2">ParaLearn</span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="hidden md:flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-sm font-semibold text-slate-700 shadow-sm">
             <ShieldCheck className="w-4 h-4" /> Help Center
          </div>
        </div>
      </nav>

      <main className="w-full max-w-[1200px] bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-2xl overflow-hidden relative z-10 mt-16 mb-8 flex flex-col">
        {/* Header Section */}
        <div className="relative bg-[#0f172a] p-8 md:p-12 text-white overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="space-y-4 max-w-3xl">
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wider border border-white/10 uppercase text-indigo-200">
                       <Calendar className="w-3 h-3" /> Session 2024/2025
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md text-xs font-bold tracking-wider border border-purple-400/30 uppercase text-purple-200">
                       {assessment.category?.name || "Assessment"}
                    </div>
                 </div>
                 <div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 pb-2">
                       {assessment.title}
                    </h1>
                    <p className="text-indigo-200/80 text-xl font-medium tracking-wide">
                       {assessment.subject?.name || "General Subject"} • {assessment.instructions?.split('.')[0] || "Online Assessment"}
                    </p>
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                 <div className="flex items-center gap-3 bg-indigo-900/40 backdrop-blur-xl px-5 py-3 rounded-xl border border-white/10 shadow-lg group hover:border-white/20 transition-all">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                    </div>
                    <span className="text-sm font-bold tracking-wide text-green-100">Exam Live</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row bg-white/30 backdrop-blur-lg flex-grow">
           {/* Left Config Panel */}
           <div className="flex-1 p-8 md:p-10 space-y-10">
              <div>
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-slate-400"></span> Exam Configuration
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:border-purple-300 transition-all shadow-sm backdrop-blur-sm flex items-start gap-4 group">
                       <div className="w-10 h-10 rounded-lg bg-indigo-50/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                          <Layers className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Volume</p>
                          <p className="text-xl font-bold text-slate-800">{assessment.questionCount || "?"} Questions</p>
                       </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:border-purple-300 transition-all shadow-sm backdrop-blur-sm flex items-start gap-4 group">
                       <div className="w-10 h-10 rounded-lg bg-indigo-50/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                          <Timer className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Time Limit</p>
                          <p className="text-xl font-bold text-slate-800">{assessment.durationMins} Minutes</p>
                       </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:border-purple-300 transition-all shadow-sm backdrop-blur-sm flex items-start gap-4 group">
                       <div className="w-10 h-10 rounded-lg bg-indigo-50/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                          <BadgeCheck className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Pass Criteria</p>
                          <p className="text-xl font-bold text-slate-800">{assessment.passingMarks || "50%"} Score</p>
                       </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/40 border border-white/60 hover:border-purple-300 transition-all shadow-sm backdrop-blur-sm flex items-start gap-4 group">
                       <div className="w-10 h-10 rounded-lg bg-indigo-50/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                          <ClipboardList className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Format</p>
                          <p className="text-xl font-bold text-slate-800">MCQ & Theory</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-2">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-slate-400"></span> Protocol
                 </h2>
                 <div className="bg-white/40 border border-white/60 rounded-2xl p-6 backdrop-blur-sm">
                    <ul className="space-y-4">
                       <li className="flex items-start gap-4 text-slate-700 group">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                          <span className="leading-relaxed text-sm font-medium">Do not switch browser tabs. Focus is monitored and violations will be flagged immediately.</span>
                       </li>
                       <li className="flex items-start gap-4 text-slate-700 group">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                          <span className="leading-relaxed text-sm font-medium">The timer is absolute. Ensure you submit before the countdown reaches zero.</span>
                       </li>
                       <li className="flex items-start gap-4 text-slate-700 group">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                          <span className="leading-relaxed text-sm font-medium">Network interruptions are handled automatically. Do not refresh manually.</span>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>

           {/* Right Sidebar - System Check */}
           <div className="lg:w-[420px] bg-white/40 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/20 p-8 md:p-10 flex flex-col relative">
              <div className="flex items-center gap-4 mb-8 p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
                 <div className="relative">
                    <img alt="Student profile" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" src="/avatar-placeholder.png" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></div>
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 text-lg">{user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Student"}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold tracking-wide">
                       <span className="text-indigo-400 uppercase">ID:</span>
                       {user?.id?.slice(0, 10).toUpperCase()}
                    </div>
                 </div>
              </div>

              <div className="rounded-2xl p-6 mb-auto border border-emerald-500/20 bg-emerald-50/30 backdrop-blur-sm relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-50"></div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5 border-b border-emerald-500/10 pb-3">
                       <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wider">System Status</h3>
                       </div>
                       <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-emerald-200">READY</span>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-emerald-900/70 font-medium">
                             <Camera className="w-4 h-4" /> Webcam
                          </div>
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-emerald-900/70 font-medium">
                             <Mic className="w-4 h-4" /> Microphone
                          </div>
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 text-emerald-900/70 font-medium">
                             <Wifi className="w-4 h-4" /> Network
                          </div>
                          <span className="text-emerald-700 font-bold text-xs bg-emerald-100/50 px-2 py-0.5 rounded">45ms</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-10 space-y-6 relative z-10">
                 <div className="flex items-start gap-3 px-1">
                    <input className="w-5 h-5 mt-0.5 text-purple-600 border-slate-300 rounded focus:ring-purple-500 custom-checkbox cursor-pointer bg-white/50 backdrop-blur-sm" id="agree" type="checkbox" />
                    <label className="text-sm text-slate-700 cursor-pointer select-none leading-tight font-medium" htmlFor="agree">I acknowledge that this session is proctored and recorded.</label>
                 </div>

                 <button 
                    onClick={async () => {
                        if (!assessmentId) return;
                        try {
                          await dispatch(startAssessment(assessmentId)).unwrap();
                          router.push(`/student/exam?assessmentId=${assessment.id}`);
                        } catch (error: any) {
                          console.error("Failed to start assessment:", error);
                          alert(error || "Failed to start assessment. Please try again.");
                        }
                    }}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-5 px-6 rounded-2xl shadow-xl shadow-purple-900/20 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between group border border-white/10"
                 >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12"></div>
                    <span className="text-lg relative z-10">Start Assessment</span>
                    <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors relative z-10">
                       <ArrowRight className="w-4 h-4 text-white block" />
                    </div>
                 </button>

                 <div className="flex justify-center items-center gap-2 opacity-60">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        ParaLearn Secure Browser™
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
