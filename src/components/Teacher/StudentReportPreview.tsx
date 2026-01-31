"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchStudentReportCard } from "@/reduxToolKit/teacher/teacherThunks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "react-toastify";

const DEFAULT_PRIMARY = "#641BC4";

interface StudentReportPreviewProps {
  studentId: string;
  studentName: string;
  session: string;
  term: string;
  onClose: () => void;
}

export function StudentReportPreview({
  studentId,
  studentName,
  session,
  term,
  onClose,
}: StudentReportPreviewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await dispatch(
          fetchStudentReportCard({ studentId, session, term })
        ).unwrap();
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

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast.info("Email functionality coming soon");
  };

  // Extract data from report
  const school = reportData?.school || {};
  const student = reportData?.student || {};
  const academic = reportData?.academic || {};
  const subjects = academic?.subjects || [];
  const rankings = reportData?.rankings || {};
  const principalRemark = reportData?.principalRemark || "";
  const promotionStatus = reportData?.promotionStatus || {};

  // Calculate totals
  const totalScore = subjects.reduce((sum: number, s: any) => sum + (s.marks || 0), 0);
  const averageGrade = subjects.length > 0 
    ? (subjects.reduce((sum: number, s: any) => sum + (s.marks || 0), 0) / subjects.length).toFixed(1)
    : 0;

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case "A": case "A+": return "text-emerald-600 bg-emerald-50";
      case "B": case "B+": return "text-blue-600 bg-blue-50";
      case "C": case "C+": return "text-amber-600 bg-amber-50";
      case "D": return "text-orange-600 bg-orange-50";
      case "E": case "F": return "text-red-600 bg-red-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative flex flex-1 max-w-6xl mx-auto my-4 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 bg-slate-100 rounded-l-2xl overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div
                className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200"
                style={{ borderTopColor: primaryColor }}
              />
            </div>
          ) : (
            <div className="p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <span>Students</span>
                <span>›</span>
                <span>{student.class || "Class"}</span>
                <span>›</span>
                <span className="text-slate-900 font-medium">Report Card Preview</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  Report Card Preview
                </h1>
                <span className="text-sm text-slate-500">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>

              {/* Report Card */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* School Header */}
                <div
                  className="p-6 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {school.name || "School Name"}
                        </h2>
                        <p className="text-white/70 text-sm">
                          {school.motto || "School Motto"}
                        </p>
                        <p className="text-white/70 text-sm">
                          Academic Session {session}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                          {(student.firstName?.[0] || "")}{(student.lastName?.[0] || "")}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {student.name || studentName}
                          </p>
                          <p className="text-sm text-white/70">
                            ID: {student.studentId || "N/A"} • {student.class || "Class"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-100">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Total Score</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalScore}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        / {subjects.length * 100}
                      </span>
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600 mb-1">Average Grade</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {averageGrade}
                      <span className="text-sm font-normal text-amber-400">
                        {" "}/ 100
                      </span>
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 mb-1">Class Position</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {rankings.classPosition || "—"}
                      <span className="text-sm font-normal text-blue-400">
                        {" "}/ {rankings.classSize || "—"} places
                      </span>
                    </p>
                  </div>
                </div>

                {/* Subject Table */}
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 text-sm font-semibold text-slate-600">
                          Subject
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-600">
                          CA (50)
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-600">
                          Exam (70)
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-600">
                          Total
                        </th>
                        <th className="text-center py-3 text-sm font-semibold text-slate-600">
                          Grade
                        </th>
                        <th className="text-left py-3 text-sm font-semibold text-slate-600">
                          Teacher Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
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
                            <tr
                              key={idx}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-3 font-medium text-slate-900">
                                {subject.subjectName || subject.name}
                              </td>
                              <td className="py-3 text-center text-slate-600">{ca}</td>
                              <td className="py-3 text-center text-slate-600">{exam}</td>
                              <td className="py-3 text-center font-semibold text-slate-900">
                                {total}
                              </td>
                              <td className="py-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-semibold ${getGradeColor(grade)}`}
                                >
                                  {grade}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-slate-500 italic">
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
        <div className="w-80 bg-white rounded-r-2xl border-l border-slate-100 flex flex-col">
          {/* Close Button */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <Award className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full h-11 rounded-xl text-white gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full h-11 rounded-xl gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </Button>
              <Button
                onClick={handleEmail}
                variant="outline"
                className="w-full h-11 rounded-xl gap-2"
              >
                <Mail className="w-4 h-4" />
                Email to Parent
              </Button>
            </div>
          </div>

          {/* Principal's Remark */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
              <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
              Principal's Remark
            </h3>
            <p className="text-sm text-slate-500 mb-3">
              This comment will appear at the bottom of the final printed report.
            </p>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-700">
                {principalRemark ||
                  "Alex has had a wonderful term. His dedication to Mathematics and Sciences is commendable. We encourage him to maintain this momentum."}
              </p>
              <button
                className="mt-3 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                SAVE REMARK
              </button>
            </div>
          </div>

          {/* Promotion Status */}
          <div className="p-6">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Promotion Status
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {promotionStatus.status || "Eligible for Promotion"}
                </span>
              </div>
              <p className="text-sm text-emerald-600">
                {promotionStatus.message ||
                  "Based on current grades, this student is eligible for promotion to next class."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
