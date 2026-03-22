import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetAssessmentResultsQuery,
  usePublishResultsMutation,
} from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PRIMARY = "#641BC4";

type IntegrityLevel = "CLEAN" | "LOW" | "MEDIUM" | "HIGH";

function IntegrityBadge({ status }: { status: string }) {
  const s = (status || "CLEAN").toUpperCase() as IntegrityLevel;
  if (s === "CLEAN") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 className="w-3.5 h-3.5" />
        CLEAN
      </span>
    );
  }
  if (s === "LOW") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        <AlertTriangle className="w-3.5 h-3.5" />
        LOW
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
      <ShieldAlert className="w-3.5 h-3.5" />
      {s}
    </span>
  );
}

interface Props {
  assessmentId: string;
}

export function LecturerAssessmentResultsPage({ assessmentId }: Props) {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;
  const router = useRouter();

  const {
    data: resultsData,
    isLoading,
    isFetching,
  } = useGetAssessmentResultsQuery(assessmentId, { skip: !assessmentId });

  const [publishResults, { isLoading: isPublishing }] =
    usePublishResultsMutation();

  const results = resultsData?.attempts || [];
  const assessment = resultsData?.assessment;

  const handlePublish = async () => {
    if (
      !confirm(
        "Are you sure you want to publish these results? This will make scores visible to students.",
      )
    )
      return;
    try {
      await publishResults({ assessmentId }).unwrap();
      toast.success("Results published successfully!");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to publish results");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              onClick={() => router.push("/uni-lecturer/assessments")}
              className="h-12 w-12 rounded-2xl text-slate-600 border-slate-200 hover:bg-slate-50 p-0 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {assessment?.title || "Assessment Results"}
              </h1>
              <p className="text-slate-500 font-medium">
                Reviewing {results.length} student submissions
              </p>
            </div>
          </div>

          <Button
            onClick={handlePublish}
            disabled={isPublishing || results.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-purple-100 transition-all gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish All Results
          </Button>
        </div>

        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium">Loading results...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-6">
                    Student Information
                  </th>
                  <th className="text-left text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-4">
                    Score / Total
                  </th>
                  <th className="text-left text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-4">
                    Grading Status
                  </th>
                  <th className="text-left text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-4">
                    Integrity
                  </th>
                  <th className="text-left text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-4">
                    Submission Time
                  </th>
                  <th className="text-right text-slate-500 font-bold text-[10px] uppercase tracking-widest py-5 px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r: any) => {
                  const proctoringCount = Array.isArray(r.proctoringFlags)
                    ? r.proctoringFlags.length
                    : 0;
                  const submittedAt = r.submittedAt
                    ? new Date(r.submittedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not Submitted";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                            {r.student?.firstName} {r.student?.lastName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {r.student?.studentProfile?.matricNumber ||
                              r.student?.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <span className="font-black text-lg text-slate-900">
                            {r.score !== null ? r.score : "—"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            OUT OF {assessment?.totalMarks || 100}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <Badge
                          className={`h-6 border-0 ${
                            r.gradingStatus === "GRADED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.gradingStatus || "PENDING"}
                        </Badge>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <IntegrityBadge status={r.integrityStatus} />
                          {proctoringCount > 0 && (
                            <span className="text-[10px] font-bold text-red-500">
                              {proctoringCount} Security Alerts
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-slate-500 text-sm font-medium">
                        {submittedAt}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            router.push(
                              `/uni-lecturer/assessments/${assessmentId}/grade/${r.id}`,
                            )
                          }
                          className="text-purple-600 hover:bg-purple-50 font-bold text-xs gap-2 rounded-xl"
                        >
                          <FileText className="w-4 h-4" />
                          Manual Grade
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-24 text-center bg-slate-50/50"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-bold text-lg underline decoration-slate-200 underline-offset-8">
                          No submissions yet
                        </p>
                        <p className="text-slate-400 text-sm mt-4">
                          Student attempts will automatically appear here once
                          submitted.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
