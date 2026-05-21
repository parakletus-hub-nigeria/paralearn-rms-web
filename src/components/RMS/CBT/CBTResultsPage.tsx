"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAssessments,
  fetchSubjects,
  fetchClasses,
  fetchScoresByAssessment,
  fetchAssessmentSubmissions,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Users,
  Trophy,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MonitorCheck,
} from "lucide-react";
import { format } from "date-fns";

const DEFAULT_PRIMARY = "#641BC4";

export function CBTResultsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, subjects, classes } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [q, setQ] = useState("");
  const [scores, setScores] = useState<any[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "name" | "submitted">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchSubjects());
    dispatch(fetchClasses(undefined));
    dispatch(getTenantInfo());
  }, []);

  const cbtExams = useMemo(
    () => assessments.filter((a: any) => a.isOnline === true || a.isOnline === "true"),
    [assessments],
  );

  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) map.set(s.id, s.name);
    return map;
  }, [subjects]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classes) map.set(c.id, c.name);
    return map;
  }, [classes]);

  const selectedExam = useMemo(
    () => cbtExams.find((e: any) => e.id === selectedExamId),
    [cbtExams, selectedExamId],
  );

  useEffect(() => {
    if (!selectedExamId || selectedExamId === "all") {
      setScores([]);
      return;
    }
    setLoadingScores(true);
    dispatch(fetchScoresByAssessment(selectedExamId))
      .unwrap()
      .then((data) => setScores(Array.isArray(data) ? data : []))
      .catch(() => setScores([]))
      .finally(() => setLoadingScores(false));
  }, [selectedExamId]);

  const totalMarks = (selectedExam as any)?.totalMarks || 100;
  const passingMark = (selectedExam as any)?.passingMarks || 50;

  const sortedScores = useMemo(() => {
    let result = [...scores];

    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter((s) => {
        const name = `${s.student?.firstName || ""} ${s.student?.lastName || ""}`.toLowerCase();
        return name.includes(term) || (s.student?.email || "").toLowerCase().includes(term);
      });
    }

    result.sort((a, b) => {
      let valA: any, valB: any;
      if (sortBy === "score") { valA = a.score ?? 0; valB = b.score ?? 0; }
      else if (sortBy === "name") {
        valA = `${a.student?.firstName} ${a.student?.lastName}`.toLowerCase();
        valB = `${b.student?.firstName} ${b.student?.lastName}`.toLowerCase();
      } else {
        valA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        valB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [scores, q, sortBy, sortDir]);

  const stats = useMemo(() => {
    if (scores.length === 0) return null;
    const validScores = scores.filter((s) => s.score != null);
    const passCount = validScores.filter((s) => {
      const pct = totalMarks > 0 ? (s.score / totalMarks) * 100 : 0;
      return pct >= passingMark;
    }).length;
    const avg = validScores.length > 0 ? validScores.reduce((sum, s) => sum + (s.score || 0), 0) / validScores.length : 0;
    const highest = validScores.length > 0 ? Math.max(...validScores.map((s) => s.score || 0)) : 0;
    return { total: scores.length, passCount, failCount: scores.length - passCount, avg: avg.toFixed(1), highest };
  }, [scores, totalMarks, passingMark]);

  const toggleSort = (col: "score" | "name" | "submitted") => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const handleExport = () => {
    if (scores.length === 0) return;
    const rows = [
      ["Student Name", "Email", "Score", "Percentage", "Status", "Submitted At"],
      ...scores.map((s) => {
        const pct = totalMarks > 0 ? Math.round((s.score / totalMarks) * 100) : 0;
        const passed = pct >= passingMark;
        return [
          `${s.student?.firstName || ""} ${s.student?.lastName || ""}`.trim(),
          s.student?.email || "",
          s.score ?? "",
          `${pct}%`,
          passed ? "Pass" : "Fail",
          s.submittedAt ? format(new Date(s.submittedAt), "yyyy-MM-dd HH:mm") : "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedExam?.title || "results"}_scores.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col ? (
      sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
    ) : null;

  return (
    <div className="w-full">
      <Header schoolLogo={tenantInfo?.logoUrl} schoolName={tenantInfo?.name || "ParaLearn School"} />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-coolvetica flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: primaryColor }} />
            CBT Results
          </h1>
          <p className="text-slate-500 text-sm mt-1">Select an exam to view student results and score breakdowns.</p>
        </div>
        {scores.length > 0 && (
          <Button variant="outline" onClick={handleExport} className="gap-2 border-slate-200 shadow-sm h-10">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Exam selector */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="h-11 w-full md:w-[320px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Select an exam..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">— Select an exam —</SelectItem>
            {cbtExams.map((e: any) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} ({subjectNameById.get(e.subjectId || "") || "—"} · {classNameById.get(e.classId || "") || "—"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedExamId !== "all" && (
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm"
            />
          </div>
        )}
      </div>

      {selectedExamId === "all" ? (
        /* No exam selected — show overview */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Select an exam above</p>
          <p className="text-slate-400 text-sm mt-1">Results will appear here once you choose a CBT exam.</p>
        </div>
      ) : loadingScores ? (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200" style={{ borderTopColor: primaryColor }} />
        </div>
      ) : (
        <>
          {/* Exam info banner */}
          {selectedExam && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <MonitorCheck className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{selectedExam.title}</p>
                <p className="text-sm text-slate-500">
                  {subjectNameById.get((selectedExam as any).subjectId || "") || "—"} •{" "}
                  {classNameById.get((selectedExam as any).classId || "") || "—"} •{" "}
                  {totalMarks} marks total • Pass mark: {passingMark}%
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Submissions", value: stats.total, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Passed", value: stats.passCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Failed", value: stats.failCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                { label: "Avg Score", value: stats.avg, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          {sortedScores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No results yet</p>
              <p className="text-slate-400 text-sm mt-1">Results will appear here once students submit the exam on pln.ng.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-12 gap-3 bg-slate-50/50">
                <div className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">#</div>
                <div
                  className="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort("name")}
                >
                  Student <SortIcon col="name" />
                </div>
                <div
                  className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort("score")}
                >
                  Score <SortIcon col="score" />
                </div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">%</div>
                <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
                <div
                  className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-slate-700"
                  onClick={() => toggleSort("submitted")}
                >
                  Time <SortIcon col="submitted" />
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {sortedScores.map((score, idx) => {
                  const pct = totalMarks > 0 ? Math.round((score.score / totalMarks) * 100) : 0;
                  const passed = pct >= passingMark;
                  const isExpanded = expandedStudent === score.id;

                  return (
                    <div key={score.id}>
                      <div
                        className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedStudent(isExpanded ? null : score.id)}
                      >
                        <div className="col-span-1">
                          {sortBy === "score" && idx === 0 ? (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          ) : (
                            <span className="text-sm text-slate-400 font-medium">{idx + 1}</span>
                          )}
                        </div>
                        <div className="col-span-4">
                          <p className="font-semibold text-slate-900 text-sm">
                            {score.student?.firstName} {score.student?.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{score.student?.email}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-bold text-slate-900">{score.score ?? "—"}</span>
                          <span className="text-xs text-slate-400">/{totalMarks}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                              <div
                                className={`h-1.5 rounded-full ${passed ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{pct}%</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border-0 ${passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {passed ? "Pass" : "Fail"}
                          </Badge>
                        </div>
                        <div className="col-span-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-slate-50/30 border-t border-slate-100">
                          <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Submitted At</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {score.submittedAt ? format(new Date(score.submittedAt), "MMM d, yyyy HH:mm") : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Student ID</p>
                              <p className="mt-1 font-medium text-slate-700 font-mono text-xs">{score.student?.studentId || score.studentId || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Raw Score</p>
                              <p className="mt-1 font-medium text-slate-700">{score.score} / {totalMarks}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Result</p>
                              <p className={`mt-1 font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>
                                {passed ? "PASSED" : "FAILED"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
