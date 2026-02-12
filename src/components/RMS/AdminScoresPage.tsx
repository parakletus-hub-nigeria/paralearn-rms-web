"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchScoresByAssessment, fetchClasses, fetchSubjects, fetchAssessments } from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, FileText, Copy, TrendingUp, BookOpen, Calendar, Target, AlertCircle, Eye } from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

// Calculate grade from score
const getGrade = (score: number, maxMarks: number) => {
  if (!maxMarks) return { letter: "—", color: "bg-slate-100 text-slate-600" };
  const percentage = (score / maxMarks) * 100;
  if (percentage >= 80) return { letter: "A", color: "bg-emerald-500 text-white" };
  if (percentage >= 70) return { letter: "B", color: "bg-blue-500 text-white" };
  if (percentage >= 60) return { letter: "C", color: "bg-amber-500 text-white" };
  if (percentage >= 50) return { letter: "D", color: "bg-orange-500 text-white" };
  return { letter: "F", color: "bg-red-500 text-white" };
};

export function AdminScoresPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { scores, classes, subjects, assessments, loading, error, success } = useSelector(
    (s: RootState) => s.admin
  );
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("1st Term");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchClasses(undefined));
    dispatch(fetchSubjects());
    dispatch(fetchAssessments());
    dispatch(getTenantInfo());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearAdminSuccess());
    }
  }, [error, success, dispatch]);

  // Filter assessments by class and subject
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (selectedClass && a.classId !== selectedClass) return false;
      if (selectedSubject && a.subjectId !== selectedSubject) return false;
      return true;
    });
  }, [assessments, selectedClass, selectedSubject]);

  // Get current assessment info
  const currentAssessment = useMemo(() => {
    return assessments.find((a) => a.id === selectedAssessment);
  }, [assessments, selectedAssessment]);

  const currentSubjectName = useMemo(() => {
    const s = subjects.find((s: any) => s.id === selectedSubject);
    return s?.name || "Select Subject";
  }, [subjects, selectedSubject]);

  const currentClassName = useMemo(() => {
    const c = classes.find((c) => c.id === selectedClass);
    return c?.name || "Select Class";
  }, [classes, selectedClass]);

  // Filter scores by search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return scores;
    return scores.filter(
      (s: any) =>
        String(s?.studentId || s?.student?.id || "").toLowerCase().includes(term) ||
        String(s?.student?.firstName || "").toLowerCase().includes(term) ||
        String(s?.student?.lastName || "").toLowerCase().includes(term)
    );
  }, [scores, q]);

  // Calculate class average
  const classAverage = useMemo(() => {
    if (scores.length === 0) return 0;
    const total = scores.reduce((acc: number, s: any) => {
      const score = s?.marksAwarded ?? s?.score ?? 0;
      return acc + score;
    }, 0);
    return Math.round((total / scores.length) * 10) / 10;
  }, [scores]);

  const loadScores = async () => {
    try {
      if (!selectedAssessment) return toast.error("Please select an assessment");
      await dispatch(fetchScoresByAssessment(selectedAssessment)).unwrap();
    } catch (e: any) {
      toast.error(e || "Failed to load scores");
    }
  };

  const exportScores = () => {
    if (scores.length === 0) {
      toast.error("No scores to export");
      return;
    }
    
    const headers = ["Student ID", "Student Name", "Marks Awarded", "Max Marks", "Percentage", "Grade"];
    const rows = scores.map((s: any) => {
      const studentId = s?.studentId || s?.student?.studentId || s?.student?.id || "";
      const name = s?.student ? `${s.student.firstName || ""} ${s.student.lastName || ""}`.trim() : "";
      const marksAwarded = s?.marksAwarded ?? s?.score ?? 0;
      const maxMarks = s?.maxMarks ?? currentAssessment?.totalMarks ?? 100;
      const percentage = maxMarks > 0 ? Math.round((marksAwarded / maxMarks) * 100) : 0;
      const grade = getGrade(marksAwarded, maxMarks);
      return [studentId, name, marksAwarded, maxMarks, `${percentage}%`, grade.letter];
    });

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scores-${currentAssessment?.title || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Scores exported successfully");
  };

  return (
    <div className="w-full">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Score Management</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Scores are entered by teachers. As an admin, you can view and export scores for reporting purposes.
            To enter scores, teachers should use their dashboard.
          </p>
        </div>
      </div>

      {/* Score Sheet Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Score Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {currentAssessment?.title || "Select an assessment"} • {currentAssessment?.session || "Academic Session"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search student by name or ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10 h-11 w-[280px] rounded-xl border-slate-200 bg-slate-50/50"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-11 rounded-xl gap-2 border-slate-200"
              onClick={exportScores}
              disabled={scores.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Subject</span>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="h-10 rounded-lg border-0 bg-white shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {subjects.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Class</span>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-10 rounded-lg border-0 bg-white shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Term</span>
            </div>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="h-10 rounded-lg border-0 bg-white shadow-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1st Term">1st Term</SelectItem>
                <SelectItem value="2nd Term">2nd Term</SelectItem>
                <SelectItem value="3rd Term">3rd Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-violet-600 uppercase tracking-wide font-semibold">Class Average</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-violet-700">{classAverage}</span>
              {classAverage > 0 && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Selection */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200">
                <SelectValue placeholder="Select Assessment" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {filteredAssessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={loadScores}
            disabled={loading || !selectedAssessment}
            className="h-11 rounded-xl text-white gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Eye className="w-4 h-4" />
            {loading ? "Loading..." : "View Scores"}
          </Button>
        </div>
      </div>

      {/* Score Table (View Only) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-violet-500 to-purple-600">
              <th className="text-left text-white font-semibold text-xs uppercase tracking-wide py-4 px-5 w-[100px]">Student ID</th>
              <th className="text-left text-white font-semibold text-xs uppercase tracking-wide py-4 px-3">Student Name</th>
              <th className="text-center text-white font-semibold text-xs uppercase tracking-wide py-4 px-3">Marks Awarded</th>
              <th className="text-center text-white font-semibold text-xs uppercase tracking-wide py-4 px-3">Max Marks</th>
              <th className="text-center text-white font-semibold text-xs uppercase tracking-wide py-4 px-3">Percentage</th>
              <th className="text-center text-white font-semibold text-xs uppercase tracking-wide py-4 px-3">Grade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((score: any, idx: number) => {
              const studentId = score?.student?.studentId || score?.studentId || score?.student?.id || `S-${idx + 101}`;
              const studentName = score?.student
                ? `${score.student.firstName || ""} ${score.student.lastName || ""}`.trim()
                : score?.studentName || "Student";
              const marksAwarded = score?.marksAwarded ?? score?.score ?? 0;
              const maxMarks = score?.maxMarks ?? currentAssessment?.totalMarks ?? 100;
              const percentage = maxMarks > 0 ? Math.round((marksAwarded / maxMarks) * 100) : 0;
              const grade = getGrade(marksAwarded, maxMarks);

              return (
                <tr
                  key={score?.id || idx}
                  className={`border-t border-slate-100 hover:bg-violet-50/30 transition-colors ${
                    idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-5 text-sm text-slate-500 font-medium">{studentId}</td>
                  <td className="py-4 px-3">
                    <span className="font-semibold text-slate-900">{studentName}</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="font-bold text-slate-900">{marksAwarded}</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-slate-600">{maxMarks}</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span
                      className="font-semibold"
                      style={{ color: percentage >= 70 ? "#10b981" : percentage >= 50 ? primaryColor : "#ef4444" }}
                    >
                      {percentage}%
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <Badge className={`w-9 h-9 rounded-xl text-sm font-bold ${grade.color}`}>
                      {grade.letter}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No scores loaded</p>
                  <p className="text-slate-400 text-sm mt-1">Select an assessment and click "View Scores"</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      {scores.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{scores.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Highest Score</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {Math.max(...scores.map((s: any) => s?.marksAwarded ?? s?.score ?? 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Lowest Score</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {Math.min(...scores.map((s: any) => s?.marksAwarded ?? s?.score ?? 0))}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Pass Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {Math.round(
                (scores.filter((s: any) => {
                  const marks = s?.marksAwarded ?? s?.score ?? 0;
                  const max = s?.maxMarks ?? currentAssessment?.totalMarks ?? 100;
                  return (marks / max) * 100 >= 50;
                }).length / scores.length) * 100
              )}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
