"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchAcademicCurrent,
  fetchClassReportSummary,
  generateAndNotifyReports,
} from "@/reduxToolKit/teacher/teacherThunks";
import { TeacherHeader } from "./TeacherHeader";
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
import {
  Download,
  FileText,
  Mail,
  Bell,
  Search,
  FileSpreadsheet,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  downloadStudentReportCardPdf,
  downloadCombinedClassReportCards,
} from "@/lib/reportPdf";

const DEFAULT_PRIMARY = "#641BC4";

export function TeacherReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses, academicCurrent, loading } = useSelector(
    (s: RootState) => s.teacher
  );
  const { user } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingStudent, setDownloadingStudent] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchAcademicCurrent());
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
  }, [dispatch, user]);

  // Set defaults from academic current
  useEffect(() => {
    if (academicCurrent?.session && !selectedSession) {
      setSelectedSession(academicCurrent.session);
    }
    if (academicCurrent?.term && !selectedTerm) {
      setSelectedTerm(academicCurrent.term);
    }
  }, [academicCurrent, selectedSession, selectedTerm]);

  // Extract unique classes
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, any>();
    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId || item.id;
      const className = item.class?.name || item.className || item.name;
      if (classId && className && !classMap.has(classId)) {
        classMap.set(classId, { id: classId, name: className });
      }
    });
    return Array.from(classMap.values());
  }, [teacherClasses]);

  // Fetch students and report summary when class changes
  useEffect(() => {
    if (!selectedClassId || !selectedSession || !selectedTerm) return;

    const loadData = async () => {
      setLoadingStudents(true);
      setLoadingReports(true);
      try {
        // Fetch students
        const studentData = await dispatch(
          fetchClassStudents(selectedClassId)
        ).unwrap();
        setStudents(studentData || []);

        // Fetch report summary
        try {
          const summary = await dispatch(
            fetchClassReportSummary({
              classId: selectedClassId,
              session: selectedSession,
              term: selectedTerm,
            })
          ).unwrap();
          setReportSummary(summary);
        } catch (e) {
          setReportSummary(null);
        }
      } catch (e: any) {
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setLoadingStudents(false);
        setLoadingReports(false);
      }
    };

    loadData();
  }, [dispatch, selectedClassId, selectedSession, selectedTerm]);

  // Get student report data from summary
  const getStudentReportData = (studentId: string) => {
    if (!reportSummary?.students) return null;
    return reportSummary.students.find((s: any) => s.id === studentId || s.studentId === studentId);
  };

  // Filter and paginate students
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.studentId || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleDownloadIndividual = async (student: any) => {
    if (!selectedSession || !selectedTerm || !selectedClassId) {
      return toast.error("Please select class, session and term");
    }
    setDownloadingStudent(student.id);
    try {
      await downloadStudentReportCardPdf({
        studentId: student.id,
        classId: selectedClassId,
        session: selectedSession,
        term: selectedTerm,
      });
      toast.success(`Downloaded report for ${student.firstName} ${student.lastName}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to download report");
    } finally {
      setDownloadingStudent(null);
    }
  };

  const handleDownloadCombined = async () => {
    if (!selectedClassId || !selectedSession || !selectedTerm) {
      return toast.error("Please select class, session and term");
    }
    setDownloadingAll(true);
    try {
      await downloadCombinedClassReportCards({
        classId: selectedClassId,
        session: selectedSession,
        term: selectedTerm,
      });
      toast.success("Combined class reports downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed to download combined reports");
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleExportExcel = async () => {
    toast.info("Excel export functionality coming soon");
  };

  const handleNotifyParents = async () => {
    if (!selectedClassId || !selectedSession || !selectedTerm) {
      return toast.error("Please select class, session and term");
    }
    const studentIds = students.map((s) => s.id);
    if (studentIds.length === 0) {
      return toast.error("No students to notify");
    }

    setNotifying(true);
    try {
      await dispatch(
        generateAndNotifyReports({
          studentIds,
          session: selectedSession,
          term: selectedTerm,
        })
      ).unwrap();
      toast.success("Parents notified successfully");
    } catch (e: any) {
      toast.error(e || "Failed to notify parents");
    } finally {
      setNotifying(false);
    }
  };

  const getStatusBadge = (studentId: string) => {
    const reportData = getStudentReportData(studentId);
    if (reportData?.isComplete || reportData?.average) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Ready
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Pending
      </Badge>
    );
  };

  const selectedClass = uniqueClasses.find((c) => c.id === selectedClassId);

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="space-y-6">
        {/* Header with title and filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Generate & Download Reports
                </h1>
                <p className="text-slate-500 mt-1">
                  Manage and distribute academic performance records
                  {selectedClass ? ` for ${selectedClass.name}` : ""}
                </p>
              </div>
              <Button
                onClick={handleNotifyParents}
                disabled={notifying || !selectedClassId}
                className="h-11 px-5 rounded-xl text-white gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {notifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Notify Parents
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="px-6 py-4 bg-slate-50/50 flex flex-wrap items-center gap-3">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="h-10 w-[180px] rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {uniqueClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={academicCurrent?.session || "2024/2025"}>
                  {academicCurrent?.session || "2024/2025"}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="h-10 w-[140px] rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="First Term">First Term</SelectItem>
                <SelectItem value="Second Term">Second Term</SelectItem>
                <SelectItem value="Third Term">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Class-Wide Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Download Combined PDF */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <FileText className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  Download Combined Class PDF
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Generate a single document containing all student reports for{" "}
                  {selectedClass?.name || "selected class"}
                </p>
                <Button
                  onClick={handleDownloadCombined}
                  disabled={downloadingAll || !selectedClassId}
                  className="mt-4 h-10 px-5 rounded-xl text-white gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {downloadingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download All PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Download Result Sheet */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  Download Result Sheet
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Export students&apos; data to Microsoft Excel format for grading
                  analysis
                </p>
                <Button
                  onClick={handleExportExcel}
                  disabled={!selectedClassId}
                  variant="outline"
                  className="mt-4 h-10 px-5 rounded-xl gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Result Sheet
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Student Reports */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-900">
                Individual Student Reports
              </span>
              <Badge variant="secondary" className="rounded-lg">
                {filteredStudents.length} Students found
              </Badge>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Students Table */}
          {loadingStudents ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200"
                style={{ borderTopColor: primaryColor }}
              />
            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {!selectedClassId
                  ? "Select a class to view students"
                  : "No students found"}
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">
                      STUDENT NAME
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      AVERAGE
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      RANK
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      STATUS
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-slate-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student: any, idx: number) => {
                    const reportData = getStudentReportData(student.id);
                    const average = reportData?.average || reportData?.overallPercentage || "—";
                    const rank = reportData?.rank || reportData?.classPosition || "—";

                    return (
                      <tr
                        key={student.id || idx}
                        className={`border-b border-slate-100 last:border-0 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {(student.firstName?.[0] || "")}{(student.lastName?.[0] || "")}
                            </div>
                            <span className="font-medium text-slate-900">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-slate-900">
                            {typeof average === "number" ? `${average.toFixed(1)}%` : average}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`font-semibold ${
                              rank === 1 || rank === "1st"
                                ? "text-amber-600"
                                : rank === 2 || rank === "2nd"
                                ? "text-slate-500"
                                : rank === 3 || rank === "3rd"
                                ? "text-amber-700"
                                : "text-slate-600"
                            }`}
                          >
                            {typeof rank === "number" ? `${rank}${getOrdinal(rank)}` : rank}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(student.id)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadIndividual(student)}
                              disabled={downloadingStudent === student.id}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                              title="Download PDF"
                            >
                              {downloadingStudent === student.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                              title="Email to Parent"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{" "}
                    {filteredStudents.length} results
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? "text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                            style={
                              currentPage === page
                                ? { backgroundColor: primaryColor }
                                : {}
                            }
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get ordinal suffix
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
