"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchTeacherClasses } from "@/reduxToolKit/teacher/teacherThunks";
import {
  useGetDailyClassAttendanceQuery,
  useBulkUpdateAttendanceMutation,
} from "@/reduxToolKit/api/endpoints/attendance";
import { TeacherHeader } from "./TeacherHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCheck,
  Clock,
  Eye,
  MoreVertical,
  Save,
  Search,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, subDays } from "date-fns";

const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  ABSENT: "ABSENT",
} as const;

type AttendanceStatusType = keyof typeof ATTENDANCE_STATUS;
type TabType = "today" | "history";

interface AttendanceRecord {
  status: AttendanceStatusType;
  remarks: string;
}

export default function TeacherAttendancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("today");

  // Dates
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  // History date picker — defaults to yesterday
  const [historyDateStr, setHistoryDateStr] = useState(
    format(subDays(today, 1), "yyyy-MM-dd")
  );

  // Derived: which date is currently being viewed
  const viewDateStr = activeTab === "today" ? todayStr : historyDateStr;
  const isReadOnly = activeTab === "history";

  // Class selection
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Draft State (only used in Today mode)
  const [draftAttendance, setDraftAttendance] = useState<
    Record<string, Partial<AttendanceRecord>>
  >({});

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Classes
  useEffect(() => {
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
  }, [dispatch, user]);

  // Unique Classes for Dropdown
  const uniqueClasses = useMemo(() => {
    const classMap = new Map();
    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId;
      const className = item.class?.name || item.className;
      if (classId && className && !classMap.has(classId)) {
        classMap.set(classId, { id: classId, name: className });
      }
    });
    return Array.from(classMap.values());
  }, [teacherClasses]);

  // Set default class
  useEffect(() => {
    if (!selectedClassId && uniqueClasses.length > 0) {
      setSelectedClassId(uniqueClasses[0].id);
    }
  }, [uniqueClasses, selectedClassId]);

  // Fetch Attendance Data (works for any date)
  const { data: attendanceData, isLoading, refetch } = useGetDailyClassAttendanceQuery(
    { classId: selectedClassId, date: viewDateStr },
    { skip: !selectedClassId }
  );

  // Hydrate local draft state from server data (Today mode only)
  useEffect(() => {
    if (attendanceData && !isReadOnly) {
      setDraftAttendance((prev) => {
        const next = { ...prev };
        let hasChanges = false;

        attendanceData.forEach((record: any) => {
          if (!next[record.enrollmentId] && record.attendance) {
            next[record.enrollmentId] = {
              status: record.attendance.status,
              remarks: record.attendance.remarks || "",
            };
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }
  }, [attendanceData, isReadOnly]);

  // Clear draft when switching to history tab
  useEffect(() => {
    if (isReadOnly) {
      setDraftAttendance({});
    }
  }, [isReadOnly]);

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateAttendanceMutation();

  // Helper: effective record (draft overrides server for Today mode)
  const getEffectiveRecord = (record: any): AttendanceRecord => {
    if (isReadOnly) {
      return {
        status: record.attendance?.status || "ABSENT",
        remarks: record.attendance?.remarks || "",
      };
    }
    const draft = draftAttendance[record.enrollmentId];
    return {
      status: draft?.status || record.attendance?.status || "ABSENT",
      remarks: draft?.remarks !== undefined ? draft.remarks : (record.attendance?.remarks || ""),
    };
  };

  // Handlers (Today mode only)
  const handleStatusChange = (enrollmentId: string, status: AttendanceStatusType) => {
    setDraftAttendance((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], status },
    }));
  };

  const handleRemarkChange = (enrollmentId: string, remarks: string) => {
    setDraftAttendance((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], remarks },
    }));
  };

  const handleMarkAllPresent = () => {
    // FIX #10: Apply only to the currently filtered/visible students
    if (!filteredData || filteredData.length === 0) return;
    const updates: Record<string, Partial<AttendanceRecord>> = {};
    filteredData.forEach((record: any) => {
      updates[record.enrollmentId] = {
        ...draftAttendance[record.enrollmentId],
        status: "PRESENT",
      };
    });
    setDraftAttendance((prev) => ({ ...prev, ...updates }));
    toast.success(
      filteredData.length === (attendanceData?.length || 0)
        ? "Marked all students as Present"
        : `Marked ${filteredData.length} visible students as Present`
    );
  };

  const handleSave = async () => {
    if (!attendanceData) return;
    // FIX #5: Don't blast the API with all-ABSENT if teacher hasn't touched anything
    if (Object.keys(draftAttendance).length === 0) {
      toast.warning("No attendance changes to save. Please mark at least one student.");
      return;
    }
    try {
      const records = attendanceData.map((record: any) => {
        const effective = getEffectiveRecord(record);
        return {
          enrollmentId: record.enrollmentId,
          status: effective.status,
          remarks: effective.remarks,
        };
      });

      const presentCount = records.filter((r: any) => r.status === "PRESENT").length;
      const absentCount = records.filter((r: any) => r.status === "ABSENT").length;
      toast.info(`Sending: ${presentCount} Present, ${absentCount} Absent`);

      await bulkUpdate({ date: viewDateStr, records }).unwrap();
      toast.success("Attendance saved successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to save attendance");
    }
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.filter((record: any) => {
      const fullName =
        `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [attendanceData, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!attendanceData) return { total: 0, present: 0, late: 0, absent: 0 };
    let present = 0, late = 0, absent = 0;
    attendanceData.forEach((record: any) => {
      const { status } = getEffectiveRecord(record);
      if (status === "PRESENT") present++;
      else if (status === "LATE") late++;
      else absent++;
    });
    return { total: attendanceData.length, present, late, absent };
  }, [attendanceData, draftAttendance, isReadOnly]);

  const getInitials = (f?: string, l?: string) =>
    `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";

  // ─── Render: Editable Status Buttons (Today mode) ───────────────────────
  const renderStatusButtons = (enrollmentId: string, status: string, isMobile = false) => (
    <div className={`inline-flex ${isMobile ? "bg-[#F3F4F6]" : "bg-slate-100"} p-1 rounded-lg gap-1`}>
      <button
        onClick={() => handleStatusChange(enrollmentId, "PRESENT")}
        className={`rounded-md flex items-center justify-center font-bold text-xs transition-all ${
          isMobile ? "w-8 h-8" : "w-9 h-8"
        } ${
          status === "PRESENT"
            ? "bg-[#00C853] text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
        }`}
        title="Present"
      >
        P
      </button>
      <button
        onClick={() => handleStatusChange(enrollmentId, "LATE")}
        className={`rounded-md flex items-center justify-center font-bold text-xs transition-all ${
          isMobile ? "w-8 h-8" : "w-9 h-8"
        } ${
          status === "LATE"
            ? "bg-[#FF9800] text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
        }`}
        title="Late"
      >
        L
      </button>
      <button
        onClick={() => handleStatusChange(enrollmentId, "ABSENT")}
        className={`rounded-md flex items-center justify-center font-bold text-xs transition-all ${
          isMobile ? "w-8 h-8" : "w-9 h-8"
        } ${
          status === "ABSENT"
            ? "bg-[#F44336] text-white shadow-sm"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
        }`}
        title="Absent"
      >
        A
      </button>
    </div>
  );

  // ─── Render: Read-Only Status Badge (History mode) ───────────────────────
  const renderStatusBadge = (status: string, isMobile = false) => {
    const size = isMobile ? "w-9 h-9" : "w-10 h-9";
    if (status === "PRESENT") {
      return (
        <span className={`inline-flex items-center justify-center ${size} rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs`}>
          P
        </span>
      );
    }
    if (status === "LATE") {
      return (
        <span className={`inline-flex items-center justify-center ${size} rounded-md bg-orange-100 text-orange-700 font-bold text-xs`}>
          L
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center justify-center ${size} rounded-md bg-red-100 text-red-700 font-bold text-xs`}>
        A
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen pb-32 md:pb-20 bg-slate-50/30">
      <div className="hidden md:block">
        <TeacherHeader />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#641BC4] rounded-full flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-bold text-xl tracking-tight">ParaLearn</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {activeTab === "today" ? "TODAY" : "HISTORY"}
          </p>
          <p className="text-xs font-bold text-slate-900">
            {activeTab === "today"
              ? format(today, "MMM d, yyyy")
              : format(parseISO(historyDateStr), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-coolvetica">Class Attendance</h1>
            <p className="text-slate-500 mt-1 font-coolvetica">
              {isReadOnly
                ? "Viewing past attendance records — read only."
                : "Mark attendance and track student presence."}
            </p>
          </div>

          {/* ── Tab Switcher ── */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("today")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "today"
                  ? "bg-white text-[#641BC4] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Sun className="w-4 h-4" />
              Today
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "history"
                  ? "bg-white text-[#641BC4] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              History
            </button>
          </div>
        </div>

        {/* ── Read-only Banner (History mode) ── */}
        {isReadOnly && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span>View-only · Past Record — you cannot edit historical attendance.</span>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-transparent md:bg-white md:p-4 md:rounded-2xl md:shadow-sm md:border md:border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Class Selector */}
            <div className="relative w-full md:w-80">
              <div className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Select
                value={selectedClassId}
                onValueChange={(val) => {
                  setSelectedClassId(val);
                  setDraftAttendance({});
                }}
              >
                <SelectTrigger className="pl-4 md:pl-10 h-12 md:h-11 bg-slate-100 md:bg-slate-50 border-transparent md:border-slate-200 rounded-xl font-bold text-slate-700 w-full mb-1">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date: Today display OR History date picker */}
            {activeTab === "today" ? (
              <div className="hidden md:flex items-center gap-2 px-4 h-11 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-100 min-w-[200px] justify-center">
                <Sun className="w-4 h-4" />
                <span>{format(today, "eeee, d MMMM")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={historyDateStr}
                  max={format(subDays(today, 1), "yyyy-MM-dd")}
                  onChange={(e) => {
                    // FIX #4: reject future dates that some browsers allow past max attr
                    if (e.target.value >= todayStr) {
                      toast.error("Cannot view attendance for today or future dates in History mode.");
                      return;
                    }
                    setHistoryDateStr(e.target.value);
                  }}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-full md:w-auto"
                />
              </div>
            )}
          </div>

          {/* Mark All Present — Today only */}
          {!isReadOnly && (
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <p className="md:hidden text-xs font-bold text-slate-500 uppercase tracking-widest">
                Students ({filteredData.length})
              </p>
              <div className="md:hidden px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                {format(today, "eeee bbbb")}
              </div>
              <Button
                onClick={handleMarkAllPresent}
                className="h-10 md:h-11 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl px-4 md:px-6 ml-auto md:ml-0"
              >
                <CheckCheck className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Mark All Present</span>
                <span className="md:hidden">Mark All</span>
              </Button>
            </div>
          )}

          {/* Search (History mode mobile label) */}
          {isReadOnly && (
            <div className="md:hidden flex items-center justify-between w-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Students ({filteredData.length})
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="pl-9 h-11 bg-white border-slate-200 rounded-xl"
          />
        </div>

        {/* ─── Desktop Table View ─── */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] font-bold text-xs uppercase text-slate-400 pl-8 py-5">S/N</TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5">Student Details</TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5 text-center">
                  Attendance Status
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5">
                  {isReadOnly ? "Remark" : "Last Remark"}
                </TableHead>
                <TableHead className="w-[100px] font-bold text-xs uppercase text-slate-400 py-5 text-right pr-8">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : !attendanceData ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    No attendance data found for this date/class.
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                    No students found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record: any, index: number) => {
                  const { status, remarks } = getEffectiveRecord(record);
                  return (
                    <TableRow
                      key={record.enrollmentId}
                      className={`hover:bg-slate-50/50 group ${isReadOnly ? "opacity-95" : ""}`}
                    >
                      <TableCell className="font-bold text-slate-400 pl-8">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={record?.student?.profilePicture} />
                            <AvatarFallback>
                              <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record?.student?.id || record?.student?.studentId || 'student'}`} 
                                alt=""
                                className="w-full h-full bg-slate-100"
                              />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">
                              {record.student.firstName} {record.student.lastName}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {record.student.studentId || "#PL-000"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isReadOnly
                          ? renderStatusBadge(status)
                          : renderStatusButtons(record.enrollmentId, status)}
                      </TableCell>
                      <TableCell>
                        {isReadOnly ? (
                          <span className="text-sm text-slate-500 italic">
                            {remarks || "—"}
                          </span>
                        ) : (
                          <Input
                            value={remarks}
                            onChange={(e) =>
                              handleRemarkChange(record.enrollmentId, e.target.value)
                            }
                            placeholder="Add remark..."
                            className="h-9 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-purple-200 rounded-lg text-sm transition-all"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-300 hover:text-slate-600">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ─── Mobile Card View ─── */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : !attendanceData ? (
            <div className="text-center py-10 text-slate-500">
              No attendance data found for this date/class.
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No students found matching your search.
            </div>
          ) : (
            filteredData.map((record: any) => {
              const { status } = getEffectiveRecord(record);
              return (
                <div
                  key={record.enrollmentId}
                  className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-white shadow-sm">
                      <AvatarImage src={record?.student?.profilePicture} />
                      <AvatarFallback>
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record?.student?.id || record?.student?.studentId || 'student'}`} 
                          alt=""
                          className="w-full h-full bg-slate-100"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900 text-[15px]">
                        {record.student.firstName} {record.student.lastName}
                      </p>
                      <p className="text-xs text-slate-400 font-bold">
                        {record.student.studentId || "#PL-001"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {isReadOnly
                      ? renderStatusBadge(status, true)
                      : renderStatusButtons(record.enrollmentId, status, true)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Persistent Footer ─── */}
      {/* Only shown in Today mode */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 md:pl-[280px]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">

            {/* Mobile Footer Top */}
            <div className="flex md:hidden items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#00C853]" />
                <div className="w-3 h-3 rounded-full bg-[#FF9800]" />
                <div className="w-3 h-3 rounded-full bg-[#F44336]" />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {stats.present + stats.late + stats.absent}/{stats.total} Marked Complete
              </div>
            </div>

            {/* Desktop Progress */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              <div className="flex flex-col gap-1 w-full max-w-md">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <span>Marked Progress</span>
                  <span className="text-purple-600">
                    {stats.present + stats.late + stats.absent} / {stats.total} Students
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#641BC4] transition-all duration-500"
                    style={{
                      width: `${
                        stats.total
                          ? ((stats.present + stats.late + stats.absent) / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Desktop Status Circles */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700" title="Present">
                  {stats.present}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700" title="Late">
                  {stats.late}
                </div>
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700" title="Absent">
                  {stats.absent}
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="h-12 w-full md:w-auto px-8 bg-[#651BC6] hover:bg-[#5215a3] text-white font-bold rounded-xl shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Attendance
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
