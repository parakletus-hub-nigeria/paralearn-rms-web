"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Image from "next/image";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchAcademicCurrent,
  fetchClassReportCards,
} from "@/reduxToolKit/teacher/teacherThunks";
import { useSessionsAndTerms } from "@/hooks/useSessionsAndTerms";
import { useGetSchoolReportCardTemplatesQuery } from "@/reduxToolKit/api/endpoints/settings";
import { useDeleteReportCardMutation, useDeleteClassReportCardsMutation, useDeleteClassReportCardJobMutation } from "@/reduxToolKit/api/endpoints/reports";
import { TeacherHeader } from "./TeacherHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Download, FileText, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, ExternalLink, Users, LayoutTemplate, CheckCircle2, ImageOff, XCircle, Trash
} from "lucide-react";
import apiClient from "@/lib/api";
import { ProductTour } from "@/components/common/ProductTour";

interface ClassJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  format: 'combined' | 'individual';
  documentUrl?: string;
  failureReason?: string;
  createdAt: string;
}

function ClassJobBanner({
  job,
  onRefreshHistory,
  onOpenPdf,
}: {
  job: ClassJob;
  onRefreshHistory: () => void;
  onOpenPdf: (url: string) => void;
}) {
  if (job.status === "processing") {
    return (
      <div className="p-4 flex items-center justify-between" style={{ borderRadius: "var(--radius-lg)", background: "var(--cobalt-tint)", border: "1px solid color-mix(in oklch, var(--cobalt-signal) 20%, transparent)" }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full shrink-0" style={{ border: "3px solid var(--border-fine)", borderTopColor: "var(--cobalt-signal)", animation: "spin 0.6s linear infinite" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Generating Class Report Cards…</p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>This might take a few minutes. You can leave this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (job.status === "completed") {
    return (
      <div className="p-4 flex items-center justify-between" style={{ borderRadius: "var(--radius-lg)", background: "var(--emerald-tint)", border: "1px solid color-mix(in oklch, var(--emerald-signal) 20%, transparent)" }}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--emerald-signal)" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Generation Complete!</p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Your report cards are ready.</p>
          </div>
        </div>
        {job.format === "combined" && job.documentUrl ? (
          <button
            onClick={() => onOpenPdf(job.documentUrl!)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold"
            style={{ borderRadius: "var(--radius-md)", background: "var(--emerald-signal)", color: "white" }}
          >
            <ExternalLink className="w-4 h-4" /> Open PDF
          </button>
        ) : (
          <button
            onClick={onRefreshHistory}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold"
            style={{ borderRadius: "var(--radius-md)", border: "1px solid color-mix(in oklch, var(--emerald-signal) 30%, transparent)", color: "var(--emerald-signal)" }}
          >
            View in Downloads
          </button>
        )}
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="p-4 flex items-center justify-between" style={{ borderRadius: "var(--radius-lg)", background: "var(--crimson-tint)", border: "1px solid color-mix(in oklch, var(--crimson-signal) 20%, transparent)" }}>
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" style={{ color: "var(--crimson-signal)" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Generation Failed</p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{job.failureReason || "An unknown error occurred"}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const teacherReportsTourSteps = [
  {
    target: ".teacher-reports-filter-card",
    content: "Select Class, Session, Term and a template to get started.",
    disableBeacon: true,
  },
  {
    target: ".teacher-reports-tabs",
    content: "Switch between Generate and Download tabs.",
  },
  {
    target: ".teacher-reports-generate-actions",
    content: "Use individual Generate buttons or the class-wide bulk buttons.",
  },
];

type TabType = "generation" | "download";

// ── Template Picker Dialog ───────────────────────────────────────────────────
function TemplatePicker({
  open,
  onOpenChange,
  templates,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  templates: any[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Choose Report Card Template</DialogTitle>
        </DialogHeader>

        {templates.length === 0 ? (
          <div className="py-16 text-center space-y-2" style={{ color: "var(--foreground-muted)" }}>
            <ImageOff className="mx-auto h-10 w-10" />
            <p className="text-sm">No active templates. Add templates in School Settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Auto option */}
            <button
              onClick={() => { onSelect("__active__"); onOpenChange(false); }}
              className="relative overflow-hidden text-left transition-all"
              style={{
                borderRadius: "var(--radius-xl)",
                border: selectedId === "__active__" ? "2px solid var(--violet-ink)" : "2px solid var(--border-fine)",
                boxShadow: selectedId === "__active__" ? "var(--shadow-card)" : "none",
              }}
            >
              <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2" style={{ background: "var(--violet-tint)" }}>
                <LayoutTemplate className="w-10 h-10" style={{ color: "var(--violet-ink)", opacity: 0.6 }} />
                <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Default / Auto</span>
              </div>
              <div className="p-3" style={{ borderTop: "1px solid var(--border-fine)" }}>
                <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Auto (first active)</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>Use school's default active template</p>
              </div>
              {selectedId === "__active__" && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--violet-ink)" }}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            {templates.map((t: any) => {
              const tpl = t.template ?? {};
              const isSelected = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { onSelect(t.id); onOpenChange(false); }}
                  className="relative overflow-hidden text-left transition-all"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: isSelected ? "2px solid var(--violet-ink)" : "2px solid var(--border-fine)",
                    boxShadow: isSelected ? "var(--shadow-card)" : "none",
                  }}
                >
                  <div className="aspect-[3/4] overflow-hidden" style={{ background: "var(--surface-muted)" }}>
                    {tpl.thumbnailUrl ? (
                      <Image
                        src={tpl.thumbnailUrl}
                        alt={tpl.name ?? "Template"}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-10 w-10" style={{ color: "var(--border-medium)" }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3" style={{ borderTop: "1px solid var(--border-fine)" }}>
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
                      {tpl.name ?? "Template"}
                    </p>
                    {tpl.description && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--foreground-muted)" }}>{tpl.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--violet-ink)" }}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Selected Template Preview chip ──────────────────────────────────────────
function SelectedTemplateChip({
  templates,
  selectedId,
  onChangClick,
}: {
  templates: any[];
  selectedId: string;
  onChangClick: () => void;
}) {
  const selected = templates.find((t) => t.id === selectedId);
  const tpl = selected?.template ?? null;
  const thumb = tpl?.thumbnailUrl;
  const name = tpl?.name ?? "Auto (first active)";

  return (
    <button
      onClick={onChangClick}
      className="flex items-center gap-3 px-4 py-2.5 w-full transition-all"
      style={{
        borderRadius: "var(--radius-xl)",
        border: "2px dashed color-mix(in oklch, var(--violet-ink) 25%, transparent)",
        background: "var(--violet-tint)",
      }}
    >
      <div className="w-10 h-12 overflow-hidden shrink-0" style={{ borderRadius: "var(--radius-md)", background: "white", border: "1px solid var(--border-fine)" }}>
        {thumb ? (
          <Image src={thumb} alt={name} width={40} height={48} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--violet-tint)" }}>
            <LayoutTemplate className="w-5 h-5" style={{ color: "var(--violet-ink)" }} />
          </div>
        )}
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--violet-ink)" }}>Template</p>
        <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{name}</p>
      </div>
      <span className="text-xs font-semibold shrink-0" style={{ color: "var(--violet-ink)" }}>Change</span>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function TeacherReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
  const [activeTab, setActiveTab] = useState<TabType>("generation");

  const [deleteReportCard] = useDeleteReportCardMutation();
  const [deleteClassReports] = useDeleteClassReportCardsMutation();
  const [deleteClassJob] = useDeleteClassReportCardJobMutation();
  const [deletingReports, setDeletingReports] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deletingJobs, setDeletingJobs] = useState<Set<string>>(new Set());
  const [classId, setClassId] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("__active__");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [generatingStudents, setGeneratingStudents] = useState<Set<string>>(new Set());
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [search, setSearch] = useState("");

  const [reportCards, setReportCards] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const [classJob, setClassJob] = useState<ClassJob | null>(null);
  const classJobRef = useRef<ClassJob | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [classHistory, setClassHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    sessionOptions, getTermsForSession,
    currentSession: apiCurrentSession, currentTerm: apiCurrentTerm,
  } = useSessionsAndTerms();
  const termOptions = useMemo(() => (!session ? [] : getTermsForSession(session)), [session, getTermsForSession]);

  const { data: schoolTemplates = [] } = useGetSchoolReportCardTemplatesQuery();
  const activeTemplates = useMemo(() => schoolTemplates.filter((t: any) => t.isActive), [schoolTemplates]);

  const resolvedTemplateId = selectedTemplateId === "__active__" ? undefined : selectedTemplateId;
  const templateParam = resolvedTemplateId ? `&templateId=${encodeURIComponent(resolvedTemplateId)}` : "";

  const teacherId = (user as any)?.id || (user as any)?.teacherId;

  useEffect(() => {
    if (!teacherId) return;
    dispatch(fetchAcademicCurrent());
    dispatch(fetchTeacherClasses({ teacherId }));
  }, [dispatch, teacherId]);

  useEffect(() => {
    if (apiCurrentSession && !session) setSession(apiCurrentSession);
    if (apiCurrentTerm && !term) setTerm(apiCurrentTerm);
  }, [apiCurrentSession, apiCurrentTerm, session, term]);

  useEffect(() => {
    classJobRef.current = classJob;
  }, [classJob]);

  useEffect(() => {
    setClassJob(null);
  }, [classId, session, term]);

  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, any>();
    (teacherClasses || []).forEach((item: any) => {
      const cId = item.class?.id || item.classId || item.id;
      const cName = item.class?.name || item.className || item.name;
      if (cId && cName && !classMap.has(cId)) classMap.set(cId, { id: cId, name: cName });
    });
    return Array.from(classMap.values());
  }, [teacherClasses]);

  const fetchClassHistory = async () => {
    if (!classId) return;
    setLoadingHistory(true);
    try {
      const qs = new URLSearchParams();
      if (session) qs.set("session", session);
      if (term) qs.set("term", term);
      const res = await apiClient.get(`/api/proxy/reports/class/${classId}/report-cards/history?${qs}`);
      if (res.data?.success) {
        setClassHistory(res.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch class history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!classId || !session || !term) return;
    if (activeTab === "generation") {
      fetchStudents();
    } else {
      fetchReports();
      fetchClassHistory();
    }
  }, [activeTab, classId, session, term]);

  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      let isChecking = false;

      pollIntervalRef.current = setInterval(async () => {
        if (isChecking) return;
        const currentJob = classJobRef.current;
        if (!currentJob || currentJob.status !== "processing" || !classId) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          return;
        }

        isChecking = true;
        try {
          const res = await apiClient.get(
            `/api/proxy/reports/class/${classId}/report-cards/status?recordId=${currentJob.id}`
          );
          if (res.data?.success && res.data?.data) {
            const data = res.data.data;
            setClassJob({
              id: data.id,
              status: data.status,
              format: data.format,
              documentUrl: data.documentUrl,
              failureReason: data.failureReason,
              createdAt: data.createdAt,
            });

            if (data.status === "completed" || data.status === "failed") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (data.status === "completed") {
                if (data.format === "combined" && data.documentUrl) {
                  toast.success("Class report cards ready!");
                  window.open(data.documentUrl, "_blank");
                } else {
                  toast.success("Individual report cards generated!");
                  if (activeTab === "download") {
                    fetchReports();
                    fetchClassHistory();
                  }
                }
              } else {
                toast.error(data.failureReason || "Generation failed");
              }
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        } finally {
          isChecking = false;
        }
      }, 3000);
    };

    if (classJob?.status === "processing") {
      startPolling();
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [classJob?.status, classJob?.id, classId, activeTab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await apiClient.get(`/api/proxy/users?classId=${classId}&role=student`);
      const data = res.data?.data || res.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      try {
        const result = await dispatch(fetchClassStudents(classId)).unwrap();
        setStudents(result || []);
      } catch (e2: any) {
        toast.error(e2 || "Failed to load students");
        setStudents([]);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const [result, usersRes] = await Promise.all([
        dispatch(fetchClassReportCards({ classId, session, term })).unwrap(),
        apiClient.get(`/api/proxy/users?classId=${classId}&role=student`).catch(() => ({ data: [] })),
      ]);
      const usersData = usersRes.data?.data || usersRes.data || [];
      const userCodeMap: Record<string, string> = {};
      if (Array.isArray(usersData)) {
        usersData.forEach((u: any) => { if (u.id && u.studentId) userCodeMap[u.id] = u.studentId; });
      }
      const flat: any[] = [];
      if (Array.isArray(result)) {
        result.forEach((student: any) => {
          const code = userCodeMap[student.id] || student.studentId || student.code;
          (student.reportCardsAsStudent || []).forEach((report: any) => {
            flat.push({ ...report, studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(), studentId: code });
          });
        });
      }
      setReportCards(flat);
    } catch (e: any) {
      toast.error(e || "Failed to load report cards");
      setReportCards([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s: any) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || (s.studentId || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(
    () => filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredStudents, currentPage]
  );
  useEffect(() => { setCurrentPage(1); }, [search, classId]);

  const toggleStudent = (id: string) => {
    const s = new Set(selectedStudents);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedStudents(s);
  };
  const toggleAll = () => setSelectedStudents(
    selectedStudents.size === filteredStudents.length ? new Set() : new Set(filteredStudents.map((s: any) => s.id))
  );

  const generateOne = async (studentId: string) => {
    if (!classId || !session || !term) { toast.error("Select class, session, and term"); return; }
    setGeneratingStudents((p) => new Set(p).add(studentId));
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/student/${studentId}/${classId}/report-card/pdf?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}${templateParam}`
      );
      if (res.data?.success) toast.success(res.data.message || "Report card queued");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to generate");
    } finally {
      setGeneratingStudents((p) => { const s = new Set(p); s.delete(studentId); return s; });
    }
  };

  const generateSelected = async () => {
    if (!selectedStudents.size) { toast.error("Select at least one student"); return; }
    toast.info(`Queuing ${selectedStudents.size} report cards…`);
    for (const id of selectedStudents) { await generateOne(id); await new Promise((r) => setTimeout(r, 300)); }
    setSelectedStudents(new Set());
    toast.success("Selected report cards queued");
  };

  const generateAllClass = async (format: "combined" | "individual") => {
    if (!classId || !session || !term) { toast.error("Select class, session, and term"); return; }
    if (!filteredStudents.length) { toast.error("No students found"); return; }
    
    if (classJob?.status === "processing") {
      toast.error("A generation job is already running for this class");
      return;
    }

    const label = format === "combined" ? "combined PDF" : "individual PDFs";
    if (!confirm(`Queue ${label} generation for all ${filteredStudents.length} students?`)) return;
    
    setBulkGenerating(true);
    try {
      const payload = { session, term, format, ...(resolvedTemplateId && { templateId: resolvedTemplateId }) };
      const res = await apiClient.post(
        `/api/proxy/reports/class/${classId}/report-cards/queue`,
        payload,
        {
          params: payload
        }
      );
      if (res.data?.success && res.data?.data?.recordId) {
        toast.info(`Queued ${label} generation`);
        setClassJob({
          id: res.data.data.recordId,
          status: "processing",
          format,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to queue class report cards");
    } finally {
      setBulkGenerating(false);
    }
  };

  const openPdf = (url: string, name: string) => {
    setDownloadingReport(url);
    window.open(url, "_blank");
    toast.success(`Opening report card for ${name}`);
    setTimeout(() => setDownloadingReport(null), 1000);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report card? This cannot be undone.")) return;
    
    setDeletingReports(prev => new Set(prev).add(reportId));
    try {
      const res = await deleteReportCard(reportId).unwrap();
      if (res?.success) {
        toast.success(res.message || "Report card deleted");
        fetchReports();
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to delete report card");
    } finally {
      setDeletingReports(prev => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const handleDeleteClassJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this class PDF job? This action cannot be undone.")) return;
    
    setDeletingJobs(prev => new Set(prev).add(jobId));
    try {
      const res = await deleteClassJob(jobId).unwrap();
      if (res?.success) {
        toast.success(res.message || "Class PDF job deleted");
        fetchClassHistory();
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to delete class PDF job");
    } finally {
      setDeletingJobs(prev => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!classId || !session || !term) return toast.error("Select class, session, and term");
    if (!confirm("Are you sure you want to delete ALL report cards for this class, session, and term? This cannot be undone.")) return;

    setIsBulkDeleting(true);
    try {
      const res = await deleteClassReports({ classId, session, term }).unwrap();
      if (res?.success) {
        toast.success(res.message || "Class report cards deleted");
        fetchReports();
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to delete class report cards");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const selectedClass = useMemo(() => uniqueClasses.find((c) => c.id === classId), [uniqueClasses, classId]);

  const statusStyle = (s: string): React.CSSProperties => ({
    approved: { background: "var(--emerald-tint)", color: "var(--emerald-signal)" },
    published: { background: "var(--emerald-tint)", color: "var(--emerald-signal)" },
    pending: { background: "var(--amber-tint)", color: "var(--amber-signal)" },
    rejected: { background: "var(--crimson-tint)", color: "var(--crimson-signal)" },
  }[s?.toLowerCase()] ?? { background: "var(--surface-muted)", color: "var(--foreground-muted)" });

  const fmtBytes = (b: number) => { if (!b) return "N/A"; const k = b / 1024; return k < 1024 ? `${k.toFixed(1)} KB` : `${(k / 1024).toFixed(1)} MB`; };
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

  return (
    <div className="w-full">
      <TeacherHeader />
      <ProductTour tourKey="teacher_reports" steps={teacherReportsTourSteps} />

      <main className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-manrope)" }}>Report Cards</h1>
          <p className="mt-1" style={{ color: "var(--foreground-muted)" }}>
            Manage student report card generation and downloads
          </p>
        </div>

        {/* Filters Card */}
        <div className="teacher-reports-filter-card p-6 space-y-4 bg-white" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Class</label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Session</label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>
                  {sessionOptions.map((o) => (
                    <SelectItem key={o.id || o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Term</label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {termOptions.map((o) => (
                    <SelectItem key={o.id || o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template selector */}
          <div className="pt-1">
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--foreground)" }}>Report Card Template</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-sm">
                <SelectedTemplateChip
                  templates={activeTemplates}
                  selectedId={selectedTemplateId}
                  onChangClick={() => setTemplatePickerOpen(true)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplatePickerOpen(true)}
                className="gap-2 rounded-xl shrink-0"
              >
                <LayoutTemplate className="w-4 h-4" />
                Select Template
              </Button>
            </div>
          </div>
        </div>

        {/* Template Picker Dialog */}
        <TemplatePicker
          open={templatePickerOpen}
          onOpenChange={setTemplatePickerOpen}
          templates={activeTemplates}
          selectedId={selectedTemplateId}
          onSelect={setSelectedTemplateId}
        />

        {/* Tabs */}
        <div className="teacher-reports-tabs" style={{ borderBottom: "1px solid var(--border-fine)" }}>
          <nav className="-mb-px flex space-x-8">
            {(["generation", "download"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2"
                style={{
                  borderBottomColor: activeTab === tab ? "var(--violet-ink)" : "transparent",
                  color: activeTab === tab ? "var(--violet-ink)" : "var(--foreground-muted)",
                }}
              >
                {tab === "generation"
                  ? <><FileText className="w-5 h-5" />Generate Reports</>
                  : <><Download className="w-5 h-5" />Download Reports</>}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {!classId || !session || !term ? (
          <div className="p-12 bg-white" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
            <div className="text-center" style={{ color: "var(--foreground-muted)" }}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select class, session, and term to get started</p>
            </div>
          </div>
        ) : activeTab === "generation" ? (
          <div className="space-y-6">
            <div className="p-6 space-y-4 bg-white" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="teacher-reports-generate-actions flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Input
                  placeholder="Search students…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  onClick={generateSelected}
                  disabled={!selectedStudents.size || loadingStudents || bulkGenerating || classJob?.status === "processing"}
                >
                  Generate Selected ({selectedStudents.size})
                </Button>
              </div>

              {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full" style={{ border: "3px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--foreground-muted)" }}><p>No students found</p></div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Checkbox checked={selectedStudents.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{s.studentId || "N/A"}</TableCell>
                          <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateOne(s.id)}
                              disabled={generatingStudents.has(s.id) || bulkGenerating}
                            >
                              {generatingStudents.has(s.id)
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                                : <><FileText className="w-4 h-4 mr-2" />Generate</>}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                      Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            </div>

            {/* Class-Wide Generation Section */}
            <div className="p-6" style={{ borderRadius: "var(--radius-xl)", border: "1px solid color-mix(in oklch, var(--violet-ink) 15%, transparent)", background: "var(--violet-tint)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <LayoutTemplate className="w-5 h-5" style={{ color: "var(--violet-ink)" }} />
                    Class-Wide Generation
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Queue all {filteredStudents.length} students in {selectedClass?.name || 'this class'} for background processing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => generateAllClass("combined")}
                    disabled={!filteredStudents.length || loadingStudents || bulkGenerating || classJob?.status === "processing"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    style={{ borderRadius: "var(--radius-md)", background: "white", border: "1px solid var(--border-fine)", color: "var(--foreground)" }}
                  >
                    {classJob?.status === "processing" && classJob?.format === "combined"
                      ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border-fine)", borderTopColor: "var(--foreground-muted)", animation: "spin 0.6s linear infinite" }} />
                      : <Users className="w-4 h-4" />}
                    Combined PDF
                  </button>
                  <button
                    onClick={() => generateAllClass("individual")}
                    disabled={!filteredStudents.length || loadingStudents || bulkGenerating || classJob?.status === "processing"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ borderRadius: "var(--radius-md)", background: "var(--violet-ink)" }}
                  >
                    {classJob?.status === "processing" && classJob?.format === "individual"
                      ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.6s linear infinite" }} />
                      : <Users className="w-4 h-4" />}
                    Individual PDFs
                  </button>
                </div>
              </div>

              {classJob && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid color-mix(in oklch, var(--violet-ink) 15%, transparent)" }}>
                  <ClassJobBanner
                    job={classJob}
                    onRefreshHistory={() => {
                      setActiveTab("download");
                      fetchReports();
                      fetchClassHistory();
                    }}
                    onOpenPdf={(url) => openPdf(url, "Class Report")}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 space-y-4 bg-white" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <Users className="w-5 h-5" style={{ color: "var(--foreground-muted)" }} />
                    Class PDF History
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>Recent combined PDF generations for this class</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchClassHistory} disabled={loadingHistory}>
                  {loadingHistory ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Refresh
                </Button>
              </div>

              {classHistory.filter(h => h.format === "combined").length === 0 ? (
                <div className="text-center py-8 rounded-lg border border-dashed" style={{ color: "var(--foreground-muted)", background: "var(--surface-muted)", borderColor: "var(--border-medium)" }}>
                  <p className="text-sm">No combined class PDFs generated recently</p>
                </div>
              ) : (
                <div className="overflow-hidden" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-fine)" }}>
                  <Table>
                    <TableHeader style={{ background: "var(--surface-muted)" }}>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classHistory.filter(h => h.format === "combined").map((h: any) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{fmtDate(h.createdAt)}</TableCell>
                          <TableCell className="capitalize">{h.format}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={({
                              completed: { background: "var(--emerald-tint)", color: "var(--emerald-signal)" },
                              processing: { background: "var(--cobalt-tint)", color: "var(--cobalt-signal)" },
                              failed: { background: "var(--crimson-tint)", color: "var(--crimson-signal)" },
                            } as Record<string, React.CSSProperties>)[h.status] || { background: "var(--surface-muted)", color: "var(--foreground-muted)" }}>
                              {h.status}
                            </span>
                          </TableCell>
                          <TableCell style={{ color: "var(--foreground-muted)" }}>{h.session} - {h.term}</TableCell>
                          <TableCell style={{ color: "var(--foreground-muted)" }}>{fmtBytes(h.bytes)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {h.documentUrl && h.status === "completed" && h.format === "combined" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPdf(h.documentUrl, "Class Report")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" /> Open PDF
                                </Button>
                              ) : h.status === "failed" && h.failureReason ? (
                                <span className="text-xs truncate max-w-[200px] block" style={{ color: "var(--crimson-signal)" }} title={h.failureReason}>{h.failureReason}</span>
                              ) : (
                                <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>—</span>
                              )}
                              <button
                                className="flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-50"
                                style={{ borderRadius: "var(--radius-md)", border: "1px solid color-mix(in oklch, var(--crimson-signal) 25%, transparent)", color: "var(--crimson-signal)" }}
                                onClick={() => handleDeleteClassJob(h.id)}
                                disabled={deletingJobs.has(h.id)}
                                title="Delete class job"
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--crimson-tint)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                              >
                                {deletingJobs.has(h.id) ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border-fine)", borderTopColor: "var(--crimson-signal)", animation: "spin 0.6s linear infinite" }} /> : <Trash className="w-4 h-4" />}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4 bg-white" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <FileText className="w-5 h-5" style={{ color: "var(--foreground-muted)" }} />
                    Student Report Cards
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>Individual generated report cards</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchReports} disabled={isBulkDeleting}>Refresh</Button>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ borderRadius: "var(--radius-md)", border: "1px solid color-mix(in oklch, var(--crimson-signal) 25%, transparent)", color: "var(--crimson-signal)" }}
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting || reportCards.length === 0}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--crimson-tint)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    {isBulkDeleting ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border-fine)", borderTopColor: "var(--crimson-signal)", animation: "spin 0.6s linear infinite" }} /> : <Trash className="w-4 h-4" />}
                    Delete All
                  </button>
                </div>
              </div>
            {loadingReports ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full" style={{ border: "3px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
              </div>
            ) : reportCards.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--foreground-muted)" }}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No report cards found</p>
                <p className="text-sm mt-2">Generate report cards in the Generate Reports tab</p>
              </div>
            ) : (
              <div className="overflow-hidden" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-fine)" }}>
                <Table>
                  <TableHeader style={{ background: "var(--surface-muted)" }}>
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
                    {reportCards.map((r: any) => {
                      const url = r.documentUrl || r.url || r.pdfUrl;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.studentName || "N/A"}</TableCell>
                          <TableCell className="font-mono text-sm">{r.studentId || "N/A"}</TableCell>
                          <TableCell>{r.className || selectedClass?.name || "N/A"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={statusStyle(r.status)}>
                              {r.status || "Unknown"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm" style={{ color: "var(--foreground-muted)" }}>{fmtBytes(r.bytes)}</TableCell>
                          <TableCell className="text-sm" style={{ color: "var(--foreground-muted)" }}>{fmtDate(r.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => url ? openPdf(url, r.studentName) : toast.error("URL not available")}
                                disabled={!url || downloadingReport === url}
                              >
                                {downloadingReport === url
                                  ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
                                  : <><ExternalLink className="w-4 h-4 mr-2" />Open PDF</>}
                              </Button>
                              <button
                                className="flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-50"
                                style={{ borderRadius: "var(--radius-md)", border: "1px solid color-mix(in oklch, var(--crimson-signal) 25%, transparent)", color: "var(--crimson-signal)" }}
                                onClick={() => handleDeleteReport(r.id)}
                                disabled={deletingReports.has(r.id)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--crimson-tint)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                              >
                                {deletingReports.has(r.id) ? <div className="w-4 h-4 rounded-full" style={{ border: "2px solid var(--border-fine)", borderTopColor: "var(--crimson-signal)", animation: "spin 0.6s linear infinite" }} /> : <Trash className="w-4 h-4" />}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
