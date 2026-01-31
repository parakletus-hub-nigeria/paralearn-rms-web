"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchCurrentSession } from "@/reduxToolKit/setUp/setUpThunk";
import {
  fetchClasses,
  fetchClassDetails,
} from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Send, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import {
  bulkGenerateClassReportCards,
  downloadCombinedClassReportCards,
  downloadStudentReportCardPdf,
} from "@/lib/reportPdf";

const DEFAULT_PRIMARY = "#641BC4";

// Mock data for demonstration - in real app, this would come from API
interface StudentReport {
  id: string;
  firstName: string;
  lastName: string;
  average: number;
  rank: number;
  status: "ready" | "pending";
}

export function AdminReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSession } = useSelector((s: RootState) => s.setUp);
  const { classes, selectedClassDetails, loading, error, success } = useSelector(
    (s: RootState) => s.admin
  );
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [classId, setClassId] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const itemsPerPage = 10;

  // Session options
  const sessionOptions = ["2023/2024", "2024/2025", "2025/2026"];
  const termOptions = ["First Term", "Second Term", "Third Term"];

  useEffect(() => {
    dispatch(fetchCurrentSession());
    dispatch(fetchClasses(undefined));
  }, [dispatch]);

  // Set defaults from current session
  useEffect(() => {
    const s = currentSession?.session;
    const t = currentSession?.term;
    if (s && !session) setSession(s);
    if (t && !term) setTerm(t);
  }, [currentSession?.session, currentSession?.term, session, term]);

  // Load class details when class changes
  useEffect(() => {
    if (classId) {
      setLoadingStudents(true);
      dispatch(fetchClassDetails(classId))
        .finally(() => setLoadingStudents(false));
    }
  }, [classId, dispatch]);

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

  // Get selected class info
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === classId);
  }, [classes, classId]);

  // Get students with mock report data
  const studentReports: StudentReport[] = useMemo(() => {
    if (!selectedClassDetails) return [];
    const enrollments = selectedClassDetails.enrollments || selectedClassDetails.students || [];
    
    return enrollments.map((e: any, idx: number) => {
      const student = e.student || e;
      // Mock data - in real app, this would come from scores/grades API
      const mockAverage = Math.round((Math.random() * 30 + 60) * 10) / 10;
      return {
        id: student.id,
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        average: mockAverage,
        rank: idx + 1, // Would be calculated from actual scores
        status: Math.random() > 0.2 ? "ready" : "pending" as "ready" | "pending",
      };
    }).sort((a, b) => b.average - a.average).map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [selectedClassDetails]);

  // Pagination
  const totalPages = Math.ceil(studentReports.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return studentReports.slice(start, start + itemsPerPage);
  }, [studentReports, currentPage, itemsPerPage]);

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "?";
  };

  // Get avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-violet-500", "bg-blue-500", "bg-emerald-500", 
      "bg-amber-500", "bg-rose-500", "bg-cyan-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500"
    ];
    const index = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Get rank badge color
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-700";
    if (rank === 2) return "bg-slate-100 text-slate-700";
    if (rank === 3) return "bg-orange-100 text-orange-700";
    return "bg-slate-50 text-slate-600";
  };

  // Download handlers
  const handleDownloadAllPdf = async () => {
    if (!classId || !session || !term) {
      toast.error("Please select class, session, and term");
      return;
    }
    setDownloading("all_pdf");
    try {
      await downloadCombinedClassReportCards({ classId, session, term });
      toast.success("Download started");
    } catch (e: any) {
      toast.error(e?.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportResultSheet = async () => {
    if (!classId || !session || !term) {
      toast.error("Please select class, session, and term");
      return;
    }
    setDownloading("result_sheet");
    try {
      // This would call an Excel export endpoint
      await bulkGenerateClassReportCards({ classId, session, term, format: "individual" });
      toast.success("Export started");
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadStudentPdf = async (studentId: string) => {
    if (!session || !term) {
      toast.error("Please select session and term");
      return;
    }
    setDownloading(studentId);
    try {
      await downloadStudentReportCardPdf({ studentId, session, term });
      toast.success("Download started");
    } catch (e: any) {
      toast.error(e?.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleNotifyParents = () => {
    toast.info("Notify Parents feature coming soon");
  };

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Generate & Download Reports</h1>
          <p className="text-slate-500 mt-1">
            Manage and distribute academic performance records for{" "}
            <span className="font-semibold text-slate-700">
              {selectedClass?.name || "your classes"}
            </span>
          </p>
        </div>
        <Button
          onClick={handleNotifyParents}
          className="h-11 rounded-xl text-white font-semibold gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="w-4 h-4" />
          Notify Parents
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="h-11 w-[180px] rounded-xl bg-white">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={session} onValueChange={setSession}>
          <SelectTrigger className="h-11 w-[160px] rounded-xl bg-white">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {sessionOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={term} onValueChange={setTerm}>
          <SelectTrigger className="h-11 w-[160px] rounded-xl bg-white">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {termOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Class-Wide Actions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <h2 className="font-bold text-slate-900">Class-Wide Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Combined Class PDF */}
          <Card className="p-6 rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-100">
                <FileText className="w-8 h-8 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Download Combined Class PDF</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Generate a single document containing all student reports for {selectedClass?.name || "the selected class"}.
                </p>
                <Button
                  onClick={handleDownloadAllPdf}
                  disabled={!!downloading || !classId}
                  className="mt-4 h-10 rounded-xl text-white font-medium gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download className="w-4 h-4" />
                  {downloading === "all_pdf" ? "Generating..." : "Download All PDF"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Download Result Sheet */}
          <Card className="p-6 rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Download Result Sheet</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Export academic data to Microsoft Excel format for grading analysis.
                </p>
                <Button
                  onClick={handleExportResultSheet}
                  disabled={!!downloading || !classId}
                  variant="outline"
                  className="mt-4 h-10 rounded-xl font-medium gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {downloading === "result_sheet" ? "Exporting..." : "Export Result Sheet"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Individual Student Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <h2 className="font-bold text-slate-900">Individual Student Reports</h2>
          </div>
          <p className="text-sm text-slate-500">
            {studentReports.length} Students Found
          </p>
        </div>

        <Card className="rounded-2xl border-slate-100 overflow-hidden">
          {!classId ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Select a Class</h3>
              <p className="text-slate-500 mt-2">
                Choose a class from the dropdown above to view student reports.
              </p>
            </div>
          ) : loadingStudents ? (
            <div className="p-12 text-center">
              <div 
                className="w-10 h-10 border-2 border-slate-200 rounded-full animate-spin mx-auto mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500">Loading students...</p>
            </div>
          ) : studentReports.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No Students Found</h3>
              <p className="text-slate-500 mt-2">
                This class has no enrolled students.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Student Name
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3 text-center">
                      Average
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3 text-center">
                      Rank
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3 text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(student.firstName + student.lastName)}`}>
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3 text-center">
                        <span className="font-semibold text-slate-900">{student.average}%</span>
                      </TableCell>
                      <TableCell className="py-4 px-3 text-center">
                        <Badge className={`rounded-lg px-3 py-1 font-semibold ${getRankColor(student.rank)}`}>
                          {student.rank === 1 ? "1st" : student.rank === 2 ? "2nd" : student.rank === 3 ? "3rd" : `${student.rank}th`}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-3 text-center">
                        {student.status === "ready" ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownloadStudentPdf(student.id)}
                            disabled={downloading === student.id || student.status === "pending"}
                            className={`p-2 rounded-lg transition-colors ${
                              student.status === "pending" 
                                ? "text-slate-300 cursor-not-allowed" 
                                : "text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                            }`}
                            title="Download PDF"
                          >
                            {downloading === student.id ? (
                              <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-600 rounded-full animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            disabled={student.status === "pending"}
                            className={`p-2 rounded-lg transition-colors ${
                              student.status === "pending" 
                                ? "text-slate-300 cursor-not-allowed" 
                                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title="Send via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, studentReports.length)} of {studentReports.length} results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-3 rounded-lg border-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 rounded-lg ${
                          currentPage === page ? "text-white" : "border-slate-200"
                        }`}
                        style={currentPage === page ? { backgroundColor: primaryColor } : {}}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-9 px-3 rounded-lg border-slate-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
