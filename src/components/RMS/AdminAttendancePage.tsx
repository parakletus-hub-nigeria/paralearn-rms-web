"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchClasses } from "@/reduxToolKit/admin/adminThunks";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { useGetDailyClassAttendanceQuery, useBulkUpdateAttendanceMutation } from "@/reduxToolKit/api/endpoints/attendance";
import { Header } from "@/components/RMS/header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCheck, MoreVertical, Save, Search, Sun, Calendar as LucideCalendar } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

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

export function AdminAttendancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { classes } = useSelector((s: RootState) => s.admin);
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  // State
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Draft State: Stores ONLY the changes made by the user.
  const [draftAttendance, setDraftAttendance] = useState<
    Record<string, Partial<AttendanceRecord>>
  >({});

  // Fetch Tenant Info on mount
  useEffect(() => {
    dispatch(getTenantInfo());
    dispatch(fetchClasses(undefined)); // Fetch all classes (matching AdminClassesPage)
  }, [dispatch]);

  // Set default class if available and not selected
  useEffect(() => {
    if (!selectedClassId && classes && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);


  // Format date for API
  const dateStr = format(currentDate, "yyyy-MM-dd");

  // Fetch Attendance Query
  const { data: attendanceData, isLoading, refetch } = useGetDailyClassAttendanceQuery(
    { classId: selectedClassId, date: dateStr },
    { skip: !selectedClassId }
  );

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateAttendanceMutation();

  // Reset draft when class or date changes (only on actual changes, not re-renders)
  const prevClassIdRef = { current: selectedClassId };
  const prevDateRef = { current: dateStr };

  // Pre-fill draft from existing attendance data (matching teacher implementation)
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


  // Helper to get effective record
  const getEffectiveRecord = (record: any): AttendanceRecord => {
    const draft = draftAttendance[record.enrollmentId];
    return {
      status: draft?.status || record.attendance?.status || "ABSENT",
      remarks: draft?.remarks !== undefined ? draft.remarks : (record.attendance?.remarks || ""),
    };
  };

  // Handlers
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
    if (!attendanceData) return;
    const updates: Record<string, Partial<AttendanceRecord>> = {};
    attendanceData.forEach((record: any) => {
      updates[record.enrollmentId] = {
        ...draftAttendance[record.enrollmentId],
        status: "PRESENT",
      };
    });
    setDraftAttendance((prev) => ({ ...prev, ...updates }));
    toast.success("Marked all students as Present");
  };

  const handleSave = async () => {
    if (!attendanceData) return;
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
      toast.info(`Saving: ${presentCount} Present, ${absentCount} Absent`);

      await bulkUpdate({ date: dateStr, records }).unwrap();
      toast.success("Attendance saved successfully");
      refetch();
      setDraftAttendance({}); // Clear draft after save
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save attendance");
    }
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.filter((record: any) => {
      const fullName = `${record.student?.firstName} ${record.student?.lastName}`.toLowerCase();
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
  }, [attendanceData, draftAttendance]);

  const getInitials = (f?: string, l?: string) =>
    `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";

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
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-coolvetica">Admin Attendance</h1>
            <p className="text-slate-500 mt-1 font-coolvetica">
              Manage daily attendance for any class.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-center">
            
            {/* Class Selector */}
            <div className="relative w-full md:w-64">
                <Select
                    value={selectedClassId}
                    onValueChange={(val) => {
                      setSelectedClassId(val);
                      setDraftAttendance({}); // Clear draft when switching class
                    }}
                >
                    <SelectTrigger className="pl-4 h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-slate-700 w-full">
                    <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                    {classes?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Date Picker */}
            <div className="relative w-full md:w-auto">
                <Popover>
                    <PopoverTrigger 
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "w-full md:w-[240px] pl-3 text-left font-normal h-11 rounded-xl",
                            !currentDate && "text-muted-foreground"
                        )}
                    >
                        {currentDate ? (
                            format(currentDate, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <LucideCalendar className="ml-auto h-4 w-4 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(date) => {
                              if (date) {
                                setCurrentDate(date as Date);
                                setDraftAttendance({}); // Clear draft when switching date
                              }
                            }}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                        />
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 h-11 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-100 min-w-[150px] justify-center">
               <Sun className="w-4 h-4" />
               <span>{format(currentDate, "eeee")}</span>
            </div>

          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
             <Button
                onClick={handleMarkAllPresent}
                className="h-11 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl px-6"
                disabled={!selectedClassId || isLoading}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Present
             </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
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
              ) : !selectedClassId ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">Please select a class to view attendance.</TableCell>
                </TableRow>
              ) : !attendanceData || attendanceData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">No students found for this class.</TableCell>
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
                            {record.student.gender && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{record.student.gender}</span>}
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
      </div>

       {/* Persistent Footer */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 md:pl-[280px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            
            {/* Desktop Progress */}
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
