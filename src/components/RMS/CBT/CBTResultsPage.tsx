"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAssessments,
  fetchSubjects,
  fetchClasses,
  fetchScoresByAssessment,
} from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
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

const statCards = [
  { label: "Submissions", key: "total", icon: Users, bg: "var(--violet-tint)", color: "var(--violet-ink)" },
  { label: "Passed", key: "passCount", icon: CheckCircle2, bg: "var(--emerald-tint)", color: "var(--emerald-signal)" },
  { label: "Failed", key: "failCount", icon: XCircle, bg: "var(--crimson-tint)", color: "var(--crimson-signal)" },
  { label: "Avg Score", key: "avg", icon: TrendingUp, bg: "var(--cobalt-tint)", color: "var(--cobalt-signal)" },
];

export function CBTResultsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { assessments, subjects, classes } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);

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
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)", fontFamily: "var(--font-manrope)" }}>
            <BarChart3 className="w-6 h-6" style={{ color: "var(--violet-ink)" }} />
            CBT Results
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>Select an exam to view student results and score breakdowns.</p>
        </div>
        {scores.length > 0 && (
          <Button variant="outline" onClick={handleExport} className="gap-2 h-10" style={{ borderColor: "var(--border-fine)", borderRadius: "var(--radius-md)" }}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Exam selector */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="h-11 w-full md:w-[320px] bg-white" style={{ borderRadius: "var(--radius-md)", borderColor: "var(--border-fine)" }}>
            <SelectValue placeholder="Select an exam..." />
          </SelectTrigger>
          <SelectContent style={{ borderRadius: "var(--radius-md)" }}>
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
            <Input
              placeholder="Search students..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11 bg-white"
              style={{ borderRadius: "var(--radius-md)", borderColor: "var(--border-fine)" }}
            />
          </div>
        )}
      </div>

      {selectedExamId === "all" ? (
        <div className="bg-white py-16 text-center" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
          <BarChart3 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--border-medium)" }} />
          <p className="font-medium" style={{ color: "var(--foreground-muted)" }}>Select an exam above</p>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)", opacity: 0.7 }}>Results will appear here once you choose a CBT exam.</p>
        </div>
      ) : loadingScores ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full" style={{ border: "3px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* Exam info banner */}
          {selectedExam && (
            <div className="bg-white p-5 mb-6 flex items-center gap-4" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-tint)" }}>
                <MonitorCheck className="w-6 h-6" style={{ color: "var(--violet-ink)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: "var(--foreground)" }}>{selectedExam.title}</p>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
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
              {statCards.map((card) => (
                <div key={card.label} className="bg-white p-5" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ borderRadius: "var(--radius-lg)", background: card.bg }}>
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{(stats as any)[card.key]}</p>
                  <p className="text-xs uppercase tracking-wide font-semibold mt-0.5" style={{ color: "var(--foreground-muted)" }}>{card.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          {sortedScores.length === 0 ? (
            <div className="bg-white py-16 text-center" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--border-medium)" }} />
              <p className="font-medium" style={{ color: "var(--foreground-muted)" }}>No results yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)", opacity: 0.7 }}>Results will appear here once students submit the exam.</p>
            </div>
          ) : (
            <div className="bg-white overflow-hidden" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              {/* Table header */}
              <div className="px-5 py-3 grid grid-cols-12 gap-3" style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--border-fine)" }}>
                <div className="col-span-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>#</div>
                <div
                  className="col-span-4 text-xs font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: "var(--foreground-muted)" }}
                  onClick={() => toggleSort("name")}
                >
                  Student <SortIcon col="name" />
                </div>
                <div
                  className="col-span-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: "var(--foreground-muted)" }}
                  onClick={() => toggleSort("score")}
                >
                  Score <SortIcon col="score" />
                </div>
                <div className="col-span-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>%</div>
                <div className="col-span-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>Status</div>
                <div
                  className="col-span-1 text-xs font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: "var(--foreground-muted)" }}
                  onClick={() => toggleSort("submitted")}
                >
                  Time <SortIcon col="submitted" />
                </div>
              </div>

              <div>
                {sortedScores.map((score, idx) => {
                  const pct = totalMarks > 0 ? Math.round((score.score / totalMarks) * 100) : 0;
                  const passed = pct >= passingMark;
                  const isExpanded = expandedStudent === score.id;

                  return (
                    <div key={score.id}>
                      <div
                        className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center cursor-pointer transition-colors"
                        style={{ borderTop: "1px solid var(--border-fine)" }}
                        onClick={() => setExpandedStudent(isExpanded ? null : score.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-muted)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <div className="col-span-1">
                          {sortBy === "score" && idx === 0 ? (
                            <Trophy className="w-4 h-4" style={{ color: "var(--amber-signal)" }} />
                          ) : (
                            <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>{idx + 1}</span>
                          )}
                        </div>
                        <div className="col-span-4">
                          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                            {score.student?.firstName} {score.student?.lastName}
                          </p>
                          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{score.student?.email}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-bold" style={{ color: "var(--foreground)" }}>{score.score ?? "—"}</span>
                          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>/{totalMarks}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full max-w-[60px]" style={{ background: "var(--border-fine)" }}>
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${Math.min(pct, 100)}%`, background: passed ? "var(--emerald-signal)" : "var(--crimson-signal)" }}
                              />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5" style={{ borderRadius: "var(--radius-sm)", background: passed ? "var(--emerald-tint)" : "var(--crimson-tint)", color: passed ? "var(--emerald-signal)" : "var(--crimson-signal)" }}>
                            {passed ? "Pass" : "Fail"}
                          </span>
                        </div>
                        <div className="col-span-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
                          ) : (
                            <ChevronDown className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
                          )}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-4" style={{ background: "var(--surface-muted)", borderTop: "1px solid var(--border-fine)" }}>
                          <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {[
                              { label: "Submitted At", value: score.submittedAt ? format(new Date(score.submittedAt), "MMM d, yyyy HH:mm") : "—", mono: false },
                              { label: "Student ID", value: score.student?.studentId || score.studentId || "—", mono: true },
                              { label: "Raw Score", value: `${score.score} / ${totalMarks}`, mono: false },
                              { label: "Result", value: passed ? "PASSED" : "FAILED", mono: false, signal: passed ? "var(--emerald-signal)" : "var(--crimson-signal)" },
                            ].map((item) => (
                              <div key={item.label}>
                                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--foreground-muted)" }}>{item.label}</p>
                                <p className="mt-1 font-medium" style={{ color: item.signal || "var(--foreground)", fontFamily: item.mono ? "var(--font-geist-mono)" : undefined, fontSize: item.mono ? "0.75rem" : undefined }}>{item.value}</p>
                              </div>
                            ))}
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
