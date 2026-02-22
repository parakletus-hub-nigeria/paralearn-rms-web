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
  MoreVertical,
  Save,
  Search,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  LATE: "LATE",
  ABSENT: "ABSENT",
} as const;

type AttendanceStatusType = keyof typeof ATTENDANCE_STATUS;

interface AttendanceRecord {
  status: AttendanceStatusType;
  remarks: string;
}

export default function TeacherAttendancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);

  // State
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [currentDate] = useState(new Date());
  
  // Draft State: Stores ONLY the changes made by the user.
  // Key: enrollmentId, Value: Partial<AttendanceRecord>
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

  // Fetch Attendance Data
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const { data: attendanceData, isLoading, refetch } = useGetDailyClassAttendanceQuery(
    { classId: selectedClassId, date: dateStr },
    { skip: !selectedClassId }
  );

  // Hydrate local state from server data when it loads
  // This ensures that even if we don't have a "draft", we know the current state.
  useEffect(() => {
    if (attendanceData) {
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
  }, [attendanceData]);

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateAttendanceMutation();

  // REMOVED useEffect to prevent accidental clearing.
  // Now clearing explicitly in UI handlers.

  // Helper to get the effective status/remarks for a student
  const getEffectiveRecord = (record: any): AttendanceRecord => {
    const draft = draftAttendance[record.enrollmentId];
    return {
      status: draft?.status || record.attendance?.status || "ABSENT",
      remarks: draft?.remarks !== undefined ? draft.remarks : (record.attendance?.remarks || ""),
    };
  };

  // Handlers
  const handleStatusChange = (
    enrollmentId: string,
    status: AttendanceStatusType
  ) => {
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
    if (!attendanceData) return;
    
    const updates: Record<string, Partial<AttendanceRecord>> = {};
    attendanceData.forEach((record: any) => {
      updates[record.enrollmentId] = { 
        ...draftAttendance[record.enrollmentId],
        status: "PRESENT" 
      };
    });
    
    setDraftAttendance((prev) => ({ ...prev, ...updates }));
    toast.success("Marked all students as Present");
  };

  const handleSave = async () => {
    if (!attendanceData) return;

    try {
      // Construct payload by merging API data with Draft data
      const records = attendanceData.map((record: any) => {
        const effective = getEffectiveRecord(record);
        return {
          enrollmentId: record.enrollmentId,
          status: effective.status,
          remarks: effective.remarks,
        };
      });
      console.log('Sending Attendance Payload:', records); // DEBUG PAYLOAD
      
      const presentCount = records.filter((r: any) => r.status === "PRESENT").length;
      const absentCount = records.filter((r: any) => r.status === "ABSENT").length;
      toast.info(`Sending: ${presentCount} Present, ${absentCount} Absent`);

      await bulkUpdate({ date: dateStr, records }).unwrap();
      toast.success("Attendance saved successfully");
      
      // Clear draft state after successful save, as API will update
      // setDraftAttendance({}); <--- REMOVED to prevent race condition.
      // We keep the draft as the "Client Truth" until the user explicitly changes class/date.
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save attendance");
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

  // Stats calculation based on effective records
  const stats = useMemo(() => {
    if (!attendanceData) return { total: 0, present: 0, late: 0, absent: 0 };
    
    let present = 0;
    let late = 0;
    let absent = 0;

    attendanceData.forEach((record: any) => {
      const { status } = getEffectiveRecord(record);
      if (status === "PRESENT") present++;
      else if (status === "LATE") late++;
      else absent++;
    });

    return { total: attendanceData.length, present, late, absent };
  }, [attendanceData, draftAttendance]);

  const getInitials = (f?: string, l?: string) =>
    `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";

  // Shared Render Logic for Status Buttons
  const renderStatusButtons = (enrollmentId: string, status: string, isMobile = false) => (
    <div className={`inline-flex ${isMobile ? 'bg-[#F3F4F6]' : 'bg-slate-100'} p-1 rounded-lg gap-1`}>
      <button
        onClick={() => handleStatusChange(enrollmentId, "PRESENT")}
        className={`rounded-md flex items-center justify-center font-bold text-xs transition-all ${
          isMobile ? 'w-8 h-8' : 'w-9 h-8'
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
          isMobile ? 'w-8 h-8' : 'w-9 h-8'
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
          isMobile ? 'w-8 h-8' : 'w-9 h-8'
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

  return (
    <div className="w-full min-h-screen pb-32 md:pb-20 bg-slate-50/30">
      <div className="hidden md:block">
        <TeacherHeader />
      </div>
      
      {/* Mobile Header (simplified based on design) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#641BC4] rounded-full flex items-center justify-center text-white font-bold">
                P
            </div>
            <span className="font-bold text-xl tracking-tight">ParaLearn</span>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TODAY</p>
            <p className="text-xs font-bold text-slate-900">{format(currentDate, "MMM d, yyyy")}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-coolvetica">Class Attendance</h1>
            <p className="text-slate-500 mt-1 font-coolvetica">
              Mark attendance and track student presence.
            </p>
          </div>
        </div>

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

            {/* Date Display (Desktop) */}
            <div className="hidden md:flex items-center gap-2 px-4 h-11 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-100 min-w-[200px] justify-center">
              <Sun className="w-4 h-4" />
              <span>{format(currentDate, "eeee, d MMMM")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
             <p className="md:hidden text-xs font-bold text-slate-500 uppercase tracking-widest">
               Students ({filteredData.length})
             </p>

             {/* Mobile Date Badge */}
             <div className="md:hidden px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
               {format(currentDate, "eeee bbbb")}
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
        </div>

        {/* Content Area */}
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] font-bold text-xs uppercase text-slate-400 pl-8 py-5">S/N</TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5">Student Details</TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5 text-center">Attendance Status</TableHead>
                <TableHead className="font-bold text-xs uppercase text-slate-400 py-5">Last Remark</TableHead>
                <TableHead className="w-[100px] font-bold text-xs uppercase text-slate-400 py-5 text-right pr-8">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div></TableCell>
                </TableRow>
              ) : !attendanceData ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">No attendance data found for this date/class.</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">No students found matching your search.</TableCell>
                </TableRow>
              ) : (
                filteredData.map((record: any, index: number) => {
                  const { status, remarks } = getEffectiveRecord(record);
                  return (
                    <TableRow key={record.enrollmentId} className="hover:bg-slate-50/50 group">
                      <TableCell className="font-bold text-slate-400 pl-8">{String(index + 1).padStart(2, "0")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-orange-100 text-orange-600 border-2 border-white shadow-sm">
                            <AvatarImage src={record.student.profilePicture} />
                            <AvatarFallback className="font-bold">{getInitials(record.student.firstName, record.student.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900">{record.student.firstName} {record.student.lastName}</p>
                            <p className="text-xs text-slate-400 font-medium">{record.student.studentId || "#PL-000"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{renderStatusButtons(record.enrollmentId, status)}</TableCell>
                      <TableCell>
                        <Input value={remarks} onChange={(e) => handleRemarkChange(record.enrollmentId, e.target.value)} placeholder="Add remark..." className="h-9 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-purple-200 rounded-lg text-sm transition-all" />
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 text-slate-300 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end"><DropdownMenuItem>View Profile</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
           {isLoading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
           ) : !attendanceData ? (
             <div className="text-center py-10 text-slate-500">No attendance data found for this date/class.</div>
           ) : filteredData.length === 0 ? (
             <div className="text-center py-10 text-slate-500">No students found matching your search.</div>
           ) : (
             filteredData.map((record: any) => {
               const { status } = getEffectiveRecord(record);
               return (
                 <div key={record.enrollmentId} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-12 w-12 bg-orange-100 text-orange-600 border border-white shadow-sm">
                          <AvatarImage src={record.student.profilePicture} />
                          <AvatarFallback className="font-bold">{getInitials(record.student.firstName, record.student.lastName)}</AvatarFallback>
                       </Avatar>
                       <div>
                          <p className="font-bold text-slate-900 text-[15px]">{record.student.firstName} {record.student.lastName}</p>
                          <p className="text-xs text-slate-400 font-bold">{record.student.studentId || "#PL-001"}</p>
                       </div>
                    </div>
                    <div>
                       {renderStatusButtons(record.enrollmentId, status, true)}
                    </div>
                 </div>
               )
             })
           )}
        </div>
      </div>

      {/* Persistent Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 md:pl-[280px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            
            {/* Mobile Footer Top: Dots & Text */}
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

            {/* Desktop Progress (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-6 flex-1">
                <div className="flex flex-col gap-1 w-full max-w-md">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>Marked Progress</span>
                        <span className="text-purple-600">{stats.present + stats.late + stats.absent} / {stats.total} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#641BC4] transition-all duration-500"
                            style={{ width: `${stats.total ? ((stats.present + stats.late + stats.absent) / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Desktop Status Circles (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-2 mr-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700" title="Present">{stats.present}</div>
                     <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700" title="Late">{stats.late}</div>
                     <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700" title="Absent">{stats.absent}</div>
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
    </div>
  );
}
