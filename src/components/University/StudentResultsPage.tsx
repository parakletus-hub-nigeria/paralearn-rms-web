"use client";

import { Header } from "@/components/RMS/header";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetStudentResultsQuery } from "@/reduxToolKit/uniFeatures/cbtApi";
import { Trophy } from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

function getGrade(score: number, total: number): string {
  if (!total || total === 0) return "N/A";
  const pct = (score / total) * 100;
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  return "F";
}

function getGradePct(score: number, total: number): string {
  if (!total || total === 0) return "—";
  return ((score / total) * 100).toFixed(1) + "%";
}

export function StudentResultsPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const {
    data: resultsResponse,
    isLoading,
    isFetching,
  } = useGetStudentResultsQuery();

  const results = Array.isArray(resultsResponse?.data)
    ? resultsResponse.data
    : Array.isArray(resultsResponse)
      ? resultsResponse
      : [];

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col mb-8">
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
            My Results
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-coolvetica">
            View your graded assessment results and performance.
          </p>
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
        ) : results.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-base">
              No results available yet.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Your graded assessments will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                    Assessment
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Course
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Score
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Grade %
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Grade
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Status
                  </th>
                  <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result: any, idx: number) => {
                  const score = result.score ?? 0;
                  const total = result.assessment?.totalMarks ?? 100;
                  const isGraded = result.gradingStatus === "GRADED";
                  const submittedAt = result.submittedAt
                    ? new Date(result.submittedAt).toLocaleString()
                    : "—";

                  return (
                    <tr
                      key={result.id || idx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-900">
                          {result.assessment?.title || "Untitled Assessment"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-700 text-sm">
                        {result.assessment?.course
                          ? `${result.assessment.course.code} – ${result.assessment.course.title}`
                          : "—"}
                      </td>
                      <td className="py-4 px-3 text-slate-900 font-bold text-lg">
                        {isGraded ? score : "—"}
                        <span className="text-slate-400 font-medium text-sm">
                          {" "}
                          / {total}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-700 font-semibold">
                        {isGraded ? getGradePct(score, total) : "—"}
                      </td>
                      <td className="py-4 px-3">
                        {isGraded ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-sm font-bold"
                            style={{
                              backgroundColor: "#EDEAFB",
                              color: primaryColor,
                            }}
                          >
                            {getGrade(score, total)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {isGraded ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            GRADED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-slate-500 text-sm">
                        {submittedAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
