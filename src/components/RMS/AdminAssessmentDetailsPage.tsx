"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAssessmentDetail, fetchAssessmentSubmissions, deleteAssessment } from "@/reduxToolKit/admin/adminThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";

export function AdminAssessmentDetailsPage() {
  const params = useParams<{ assessmentId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAssessment, assessmentSubmissions, loading, error } = useSelector(
    (s: RootState) => s.admin
  );
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  useEffect(() => {
    if (params.assessmentId) {
      dispatch(fetchAssessmentDetail(params.assessmentId));
      dispatch(fetchAssessmentSubmissions(params.assessmentId));
      dispatch(getTenantInfo());
    }
  }, [params.assessmentId, dispatch]);

  const handleDelete = async () => {
    if (!selectedAssessment) return;
    
    if (window.confirm(`Are you sure you want to delete "${selectedAssessment.title}"? This action cannot be undone.`)) {
      try {
        const res = await dispatch(deleteAssessment(selectedAssessment.id)).unwrap();
        if (res) {
          toast.success("Assessment deleted successfully");
          router.push("/RMS/assessments");
        }
      } catch (err: any) {
        toast.error(err || "Failed to delete assessment");
      }
    }
  };

  // Helper to normalize isOnline to boolean (handles both string and boolean values)
  const isOnline = () => {
    const value = selectedAssessment?.isOnline;
    if (typeof value === "string") {
      return value === "true" || value === "1" || value === "yes";
    }
    return !!value;
  };

  if (loading && !selectedAssessment) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !selectedAssessment) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl m-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900">Error Loading Assessment</h2>
        <p className="text-red-700 mt-2">{error || "Assessment not found"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          className="mt-6 border-red-200 hover:bg-red-100"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const statusLabel = selectedAssessment.status === "started" ? "Active" : 
                    selectedAssessment.status === "ended" ? "Ended" : "Pending";
  const statusColor = selectedAssessment.status === "started" ? "bg-emerald-100 text-emerald-700" :
                    selectedAssessment.status === "ended" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="w-full pb-10">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">Back to Assessments</span>
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${statusColor} border-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider`}>
                  {statusLabel}
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {isOnline() ? "Online" : "Offline"}
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{selectedAssessment.title}</h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-primary">{selectedAssessment.subject?.name || "Subject"}</span>
                  <span className="text-slate-300">•</span>
                  <span>{selectedAssessment.class?.name || "Class"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/RMS/assessments/edit/${selectedAssessment.id}`)}
                className="rounded-xl border-slate-200"
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-0 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-white">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{selectedAssessment.durationMins || selectedAssessment.duration || "—"} Mins</p>
            </div>
            
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-white">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Marks</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{selectedAssessment.totalMarks || "—"}</p>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 border border-white">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Questions</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{selectedAssessment._count?.questions || selectedAssessment.questions?.length || 0}</p>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 border border-white">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Submissions</span>
              </div>
              <p className="text-xl font-bold text-emerald-600">{assessmentSubmissions.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Instructions
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed italic">
                {selectedAssessment.instructions || "No special instructions provided for this assessment."}
              </div>
            </section>

            {/* Questions List */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" /> Assessment Questions
                </h2>
                <Badge variant="outline" className="rounded-full border-slate-200">
                  {selectedAssessment.questions?.length || 0} Total
                </Badge>
              </div>
              <div className="divide-y divide-slate-50">
                {selectedAssessment.questions && selectedAssessment.questions.length > 0 ? (
                  selectedAssessment.questions.map((q, idx) => (
                    <div key={q.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Question {idx + 1}</p>
                          <p className="text-slate-800 font-medium text-lg leading-relaxed">{q.text || q.question}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((opt: string, i: number) => (
                                <div key={i} className={`text-sm p-2.5 rounded-xl border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                                  {opt === q.correctAnswer && <CheckCircle className="w-3 h-3 inline ml-2" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-primary">{q.marks || 0} Marks</p>
                          <Badge variant="outline" className="mt-2 text-[10px] font-bold uppercase rounded-lg border-slate-200 bg-slate-50 text-slate-500">
                            {q.type || "Multiple Choice"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No questions have been added to this assessment yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-8">
            {/* Timeline Info */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Schedule & Timeline
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start Time</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedAssessment.startsAt ? format(new Date(selectedAssessment.startsAt), "PPp") : "Not scheduled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Time</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedAssessment.endsAt ? format(new Date(selectedAssessment.endsAt), "PPp") : "Continuous"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Submissions Overview */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Submissions ({assessmentSubmissions.length})
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {assessmentSubmissions.length > 0 ? (
                  assessmentSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {sub.student?.firstName?.[0] || 'S'}
                         </div>
                         <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{sub.student?.firstName} {sub.student?.lastName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Score: <span className="text-primary font-bold">{sub.score ?? '—'}</span> / {selectedAssessment.totalMarks}</p>
                         </div>
                      </div>
                      <Badge className={`${sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} border-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter`}>
                        {sub.status || 'Submitted'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No submissions yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
