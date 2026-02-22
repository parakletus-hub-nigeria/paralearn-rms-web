"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchCurrentSession } from "@/reduxToolKit/setUp/setUpThunk";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import {
  fetchClasses,
  fetchStudentsByClass,
  fetchClassReportCards,
} from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { useSessionsAndTerms } from "@/hooks/useSessionsAndTerms";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  FileText, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import apiClient from "@/lib/api";

const DEFAULT_PRIMARY = "#641BC4";

type TabType = "generation" | "download";

export function AdminReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSession } = useSelector((s: RootState) => s.setUp);
  const { classes, loading, error, success } = useSelector((s: RootState) => s.admin);
  const { user, tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("generation");

  // Filter state
  const [classId, setClassId] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");

  // Generation tab state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [generatingStudents, setGeneratingStudents] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Download tab state
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get dynamic session/term options
  const {
    sessionOptions,
    getTermsForSession,
    currentSession: apiCurrentSession,
    currentTerm: apiCurrentTerm,
    isLoading: isLoadingSessionData,
  } = useSessionsAndTerms();

  // Get term options based on selected session
  const termOptions = useMemo(() => {
    if (!session) return [];
    return getTermsForSession(session);
  }, [session, getTermsForSession]);



  // Wait for user role to be loaded
  const hasRole = user?.roles && user.roles.length > 0;

  // Initial Fetch
  useEffect(() => {
    if (!hasRole) return;
    // Removed fetchCurrentSession as it's handled by the hook
    dispatch(fetchClasses(undefined));
    dispatch(getTenantInfo());
  }, [dispatch, hasRole]);

  // Set defaults from API current session
  useEffect(() => {
    if (apiCurrentSession && !session) setSession(apiCurrentSession);
    if (apiCurrentTerm && !term) setTerm(apiCurrentTerm);
  }, [apiCurrentSession, apiCurrentTerm, session, term]);

  // Fetch data when tab, class, or filters change
  useEffect(() => {
    if (!hasRole || !classId || !session || !term) return;

    if (activeTab === "generation") {
      fetchStudents();
    } else {
      fetchReports();
    }
  }, [activeTab, classId, session, term, hasRole]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const result = await dispatch(fetchStudentsByClass({ classId })).unwrap();
      setStudents(result || []);
    } catch (e: any) {
      toast.error(e || "Failed to load students");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const result = await dispatch(
        fetchClassReportCards({ classId, session, term })
      ).unwrap();
      console.log('[AdminReportsPage] Fetched report cards:', result);
      
      // Flatten the nested structure: students -> reportCardsAsStudent[]
      const flattenedReports: any[] = [];
      if (result && Array.isArray(result)) {
        result.forEach((student: any) => {
          const studentReports = student.reportCardsAsStudent || [];
          studentReports.forEach((report: any) => {
            flattenedReports.push({
              ...report,
              studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
              studentId: student.id,
            });
          });
        });
      }
      
      console.log('[AdminReportsPage] Flattened report cards:', flattenedReports);
      if (flattenedReports.length > 0) {
        console.log('[AdminReportsPage] First flattened report:', flattenedReports[0]);
      }
      
      setReportCards(flattenedReports);
    } catch (e: any) {
      console.error('[AdminReportsPage] Error fetching reports:', e);
      toast.error(e || "Failed to load report cards");
      setReportCards([]);
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle toasts
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

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const query = search.toLowerCase();
    return students.filter((s: any) => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
      (s.studentId || "").toLowerCase().includes(query)
    );
  }, [students, search]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, classId]);

  // Selection handlers
  const toggleStudentSelection = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s: any) => s.id)));
    }
  };

  // Generate report card for a single student
  const generateReportCard = async (studentId: string) => {
    if (!classId || !session || !term) {
      toast.error("Please select class, session, and term");
      return;
    }

    setGeneratingStudents(prev => new Set(prev).add(studentId));
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/student/${studentId}/${classId}/report-card/pdf?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`
      );
      
      if (res.data?.success) {
        toast.success(res.data.message || "Report card generation started");
        // Refresh the list after a short delay
        setTimeout(() => {
          if (activeTab === "generation") fetchStudents();
        }, 2000);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to generate report card");
    } finally {
      setGeneratingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Generate selected report cards
  const generateSelected = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    const studentIds = Array.from(selectedStudents);
    toast.info(`Generating ${studentIds.length} report cards...`);

    for (const studentId of studentIds) {
      await generateReportCard(studentId);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSelectedStudents(new Set());
    toast.success("All selected report cards queued for generation");
  };

  // Generate all report cards
  const generateAll = async () => {
    if (filteredStudents.length === 0) {
      toast.error("No students found");
      return;
    }

    const confirmed = confirm(`Generate report cards for all ${filteredStudents.length} students?`);
    if (!confirmed) return;

    toast.info(`Generating ${filteredStudents.length} report cards...`);

    for (const student of filteredStudents) {
      await generateReportCard(student.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast.success("All report cards queued for generation");
  };

  // Download report card
  const downloadReportCard = (documentUrl: string, studentName: string) => {
    setDownloadingReport(documentUrl);
    try {
      window.open(documentUrl, "_blank");
      toast.success(`Opening report card for ${studentName}`);
    } catch (e) {
      toast.error("Failed to open report card");
    } finally {
      setTimeout(() => setDownloadingReport(null), 1000);
    }
  };

  // Get selected class info
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === classId);
  }, [classes, classId]);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "published":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-gray-600 mt-1">Manage student report card generation and downloads</p>
        </div>

        {/* Filters Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Class</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Session</label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map((opt) => (
                    <SelectItem key={opt.id || opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Term</label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((opt) => (
                    <SelectItem key={opt.id || opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("generation")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === "generation"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <FileText className="inline-block w-5 h-5 mr-2" />
              Generate Reports
            </button>
            <button
              onClick={() => setActiveTab("download")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === "download"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Download className="inline-block w-5 h-5 mr-2" />
              Download Reports
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {!classId || !session || !term ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select class, session, and term to get started</p>
            </div>
          </Card>
        ) : activeTab === "generation" ? (
          // GENERATION TAB
          <Card className="p-6 space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generateSelected}
                  disabled={selectedStudents.size === 0 || loadingStudents}
                >
                  Generate Selected ({selectedStudents.size})
                </Button>
                <Button
                  style={{ backgroundColor: primaryColor }}
                  onClick={generateAll}
                  disabled={filteredStudents.length === 0 || loadingStudents}
                >
                  Generate All ({filteredStudents.length})
                </Button>
              </div>
            </div>

            {/* Students Table */}
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No students found</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.has(student.id)}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.studentId || "N/A"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateReportCard(student.id)}
                              disabled={generatingStudents.has(student.id)}
                            >
                              {generatingStudents.has(student.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Generate
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{" "}
                      {filteredStudents.length} students
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        ) : (
          // DOWNLOAD TAB
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generated Report Cards</h2>
              <Button variant="outline" size="sm" onClick={fetchReports}>
                Refresh
              </Button>
            </div>

            {loadingReports ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : reportCards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No report cards found</p>
                <p className="text-sm mt-2">Generate report cards in the Generate Reports tab</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCards.map((report: any) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.studentName || "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {report.studentId || "N/A"}
                        </TableCell>
                        <TableCell>{report.className || selectedClass?.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatBytes(report.bytes)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(report.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = report.documentUrl || report.url || report.pdfUrl;
                              if (url) {
                                downloadReportCard(url, report.studentName);
                              } else {
                                console.error('[AdminReportsPage] No document URL found for report:', report);
                                toast.error('Document URL not available');
                              }
                            }}
                            disabled={
                              (!report.documentUrl && !report.url && !report.pdfUrl) ||
                              downloadingReport === (report.documentUrl || report.url || report.pdfUrl)
                            }
                          >
                            {downloadingReport === (report.documentUrl || report.url || report.pdfUrl) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open PDF
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
