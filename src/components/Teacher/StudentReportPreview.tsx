"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reduxToolKit/store";
import { fetchStudentReportCard } from "@/reduxToolKit/teacher/teacherThunks";
import {
  Download,
  Printer,
  Mail,
  X,
  GraduationCap,
  Award,
  TrendingUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { downloadStudentReportCardPdf } from "@/lib/reportPdf";
import { toast } from "sonner";

interface StudentReportPreviewProps {
  studentId: string;
  classId: string;
  studentName: string;
  session: string;
  term: string;
  onClose: () => void;
}

const getGradeStyle = (grade: string): React.CSSProperties => {
  switch (grade?.toUpperCase()) {
    case "A": case "A+": return { color: "var(--emerald-signal)", background: "var(--emerald-tint)" };
    case "B": case "B+": return { color: "var(--cobalt-signal)", background: "var(--cobalt-tint)" };
    case "C": case "C+": return { color: "var(--amber-signal)", background: "var(--amber-tint)" };
    case "D": return { color: "oklch(0.62 0.19 45)", background: "oklch(0.97 0.04 80)" };
    case "E": case "F": return { color: "var(--crimson-signal)", background: "var(--crimson-tint)" };
    default: return { color: "var(--foreground-muted)", background: "var(--surface-muted)" };
  }
};

export function StudentReportPreview({
  studentId,
  classId,
  studentName,
  session,
  term,
  onClose,
}: StudentReportPreviewProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await dispatch(fetchStudentReportCard({ studentId, session, term })).unwrap();
        setReportData(data);
      } catch (e: any) {
        toast.error("Failed to load report card");
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [dispatch, studentId, session, term]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadStudentReportCardPdf({ studentId, session, term });
      toast.success("Report downloaded");
    } catch (e: any) {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleEmail = () => toast.info("Email functionality coming soon");

  const school = reportData?.school || {};
  const student = reportData?.student || {};
  const academic = reportData?.academic || {};
  const subjects = academic?.subjects || [];
  const rankings = reportData?.rankings || {};
  const principalRemark = reportData?.principalRemark || "";
  const promotionStatus = reportData?.promotionStatus || {};

  const totalScore = subjects.reduce((sum: number, s: any) => sum + (s.marks || 0), 0);
  const averageGrade = subjects.length > 0
    ? (subjects.reduce((sum: number, s: any) => sum + (s.marks || 0), 0) / subjects.length).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.5)" }} onClick={onClose} />

      {/* Modal Content */}
      <div className="relative flex flex-1 max-w-6xl mx-auto my-4 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-xl) 0 0 var(--radius-xl)" }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
            </div>
          ) : (
            <div className="p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                <span>Students</span>
                <span>›</span>
                <span>{student.class || "Class"}</span>
                <span>›</span>
                <span className="font-medium" style={{ color: "var(--foreground)" }}>Report Card Preview</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-manrope)" }}>
                  Report Card Preview
                </h1>
                <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>

              {/* Report Card */}
              <div className="overflow-hidden" style={{ background: "white", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
                {/* School Header */}
                <div className="p-6 text-white" style={{ background: "var(--violet-ink)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center" style={{ borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.2)" }}>
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{school.name || "School Name"}</h2>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{school.motto || "School Motto"}</p>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Academic Session {session}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-lg)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>
                          {(student.firstName?.[0] || "")}{(student.lastName?.[0] || "")}
                        </div>
                        <div>
                          <p className="font-semibold">{student.name || studentName}</p>
                          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                            ID: {student.studentId || "N/A"} • {student.class || "Class"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 p-6" style={{ borderBottom: "1px solid var(--border-fine)" }}>
                  <div className="p-4" style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-lg)" }}>
                    <p className="text-sm mb-1" style={{ color: "var(--foreground-muted)" }}>Total Score</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                      {totalScore}{" "}
                      <span className="text-sm font-normal" style={{ color: "var(--foreground-muted)" }}>
                        / {subjects.length * 100}
                      </span>
                    </p>
                  </div>
                  <div className="p-4" style={{ background: "var(--amber-tint)", borderRadius: "var(--radius-lg)" }}>
                    <p className="text-sm mb-1" style={{ color: "var(--amber-signal)" }}>Average Grade</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--amber-signal)" }}>
                      {averageGrade}
                      <span className="text-sm font-normal"> / 100</span>
                    </p>
                  </div>
                  <div className="p-4" style={{ background: "var(--cobalt-tint)", borderRadius: "var(--radius-lg)" }}>
                    <p className="text-sm mb-1" style={{ color: "var(--cobalt-signal)" }}>Class Position</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--cobalt-signal)" }}>
                      {rankings.classPosition || "—"}
                      <span className="text-sm font-normal"> / {rankings.classSize || "—"} places</span>
                    </p>
                  </div>
                </div>

                {/* Subject Table */}
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-fine)" }}>
                        {["Subject", "CA (50)", "Exam (70)", "Total", "Grade", "Teacher Remarks"].map((h, i) => (
                          <th key={h} className={`py-3 text-sm font-semibold ${i === 0 || i === 5 ? "text-left" : "text-center"}`} style={{ color: "var(--foreground-muted)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center" style={{ color: "var(--foreground-muted)" }}>
                            No subjects data available
                          </td>
                        </tr>
                      ) : (
                        subjects.map((subject: any, idx: number) => {
                          const ca = subject.caScore || subject.assessments?.find((a: any) =>
                            a.categoryName?.includes("CA") || a.category?.includes("Test"))?.marks || 0;
                          const exam = subject.examScore || subject.assessments?.find((a: any) =>
                            a.categoryName?.includes("Exam") || a.category?.includes("Exam"))?.marks || 0;
                          const total = subject.marks || (ca + exam);
                          const grade = subject.grade || "—";
                          const remark = subject.remark || subject.teacherRemark || "";

                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid var(--border-fine)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <td className="py-3 font-medium" style={{ color: "var(--foreground)" }}>
                                {subject.subjectName || subject.name}
                              </td>
                              <td className="py-3 text-center" style={{ color: "var(--foreground-muted)" }}>{ca}</td>
                              <td className="py-3 text-center" style={{ color: "var(--foreground-muted)" }}>{exam}</td>
                              <td className="py-3 text-center font-semibold" style={{ color: "var(--foreground)" }}>{total}</td>
                              <td className="py-3 text-center">
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 font-semibold"
                                  style={{ ...getGradeStyle(grade), borderRadius: "var(--radius-md)" }}
                                >
                                  {grade}
                                </span>
                              </td>
                              <td className="py-3 text-sm italic" style={{ color: "var(--foreground-muted)" }}>
                                {remark || "—"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col" style={{ background: "white", borderRadius: "0 var(--radius-xl) var(--radius-xl) 0", borderLeft: "1px solid var(--border-fine)" }}>
          {/* Close Button */}
          <div className="p-4 flex items-center justify-end" style={{ borderBottom: "1px solid var(--border-fine)" }}>
            <button
              onClick={onClose}
              className="p-2 transition-colors"
              style={{ borderRadius: "var(--radius-md)", border: "none", background: "transparent", color: "var(--foreground-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-6" style={{ borderBottom: "1px solid var(--border-fine)" }}>
            <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              <Award className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full h-11 font-semibold text-sm flex items-center justify-center gap-2 text-white transition-all disabled:opacity-70"
                style={{ background: "var(--violet-ink)", borderRadius: "var(--radius-lg)", border: "none" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="w-full h-11 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: "white", color: "var(--foreground)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "white")}
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
              <button
                onClick={handleEmail}
                className="w-full h-11 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: "white", color: "var(--foreground)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-medium)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "white")}
              >
                <Mail className="w-4 h-4" />
                Email to Parent
              </button>
            </div>
          </div>

          {/* Principal's Remark */}
          <div className="p-6" style={{ borderBottom: "1px solid var(--border-fine)" }}>
            <h3 className="flex items-center gap-2 font-semibold mb-3" style={{ color: "var(--foreground)" }}>
              <GraduationCap className="w-5 h-5" style={{ color: "var(--violet-ink)" }} />
              Principal's Remark
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--foreground-muted)" }}>
              This comment will appear at the bottom of the final printed report.
            </p>
            <div className="p-4" style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-lg)" }}>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                {principalRemark || "Alex has had a wonderful term. His dedication to Mathematics and Sciences is commendable. We encourage him to maintain this momentum."}
              </p>
              <button
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--violet-ink)", background: "transparent", border: "none" }}
              >
                SAVE REMARK
              </button>
            </div>
          </div>

          {/* Promotion Status */}
          <div className="p-6">
            <h3 className="flex items-center gap-2 font-semibold mb-3" style={{ color: "var(--foreground)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "var(--emerald-signal)" }} />
              Promotion Status
            </h3>
            <div className="p-4" style={{ background: "var(--emerald-tint)", borderRadius: "var(--radius-lg)" }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" style={{ color: "var(--emerald-signal)" }} />
                <span className="font-semibold" style={{ color: "var(--emerald-signal)" }}>
                  {promotionStatus.status || "Eligible for Promotion"}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                {promotionStatus.message || "Based on current grades, this student is eligible for promotion to next class."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
