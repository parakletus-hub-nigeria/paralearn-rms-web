"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAllUsers, getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { bulkEnrollStudents, fetchClasses, fetchClassDetails, removeStudentFromClass } from "@/reduxToolKit/admin/adminThunks";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, X, Download, Users, BarChart3, FileText } from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminEnrollmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { students, loading: usersLoading, tenantInfo } = useSelector((s: RootState) => s.user);
  const { classes, loading: adminLoading, selectedClassDetails } = useSelector((s: RootState) => s.admin);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [loadingClassDetails, setLoadingClassDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchClasses(undefined));
    dispatch(getTenantInfo());
  }, [dispatch]);

  // Load class details when a class is selected
  useEffect(() => {
    if (selectedClassId) {
      setLoadingClassDetails(true);
      dispatch(fetchClassDetails(selectedClassId))
        .finally(() => setLoadingClassDetails(false));
    }
  }, [selectedClassId, dispatch]);

  // Get selected class info
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Get enrolled students for the selected class
  const enrolledStudents = useMemo(() => {
    if (!selectedClassDetails) return [];
    const enrollments = selectedClassDetails.enrollments || selectedClassDetails.students || [];
    return enrollments.map((e: any) => ({
      ...(e.student || e),
      enrolledAt: e.enrolledAt || e.createdAt || e.student?.createdAt,
    }));
  }, [selectedClassDetails]);

  const enrolledStudentIds = useMemo(() => {
    return new Set(enrolledStudents.map((s: any) => s.id));
  }, [enrolledStudents]);

  // Get available students (not enrolled in selected class)
  const availableStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    let available = students.filter((s: any) => !enrolledStudentIds.has(s.id));
    
    if (term) {
      available = available.filter((s: any) => {
        const name = `${s?.firstName || ""} ${s?.lastName || ""}`.toLowerCase();
        const studentId = String(s?.studentId || s?.code || "").toLowerCase();
        return name.includes(term) || studentId.includes(term);
      });
    }
    
    return available;
  }, [students, enrolledStudentIds, search]);

  // Enroll a single student
  const enrollStudent = async (studentId: string) => {
    if (!selectedClassId) return toast.error("Please select a class first");
    
    setEnrolling(studentId);
    try {
      await dispatch(bulkEnrollStudents({ 
        classId: selectedClassId, 
        studentIds: [studentId] 
      })).unwrap();
      toast.success("Student enrolled successfully");
      dispatch(fetchClassDetails(selectedClassId));
    } catch (error: any) {
      toast.error(error || "Failed to enroll student");
    } finally {
      setEnrolling(null);
    }
  };

  // Remove a student from class
  const removeStudent = async (studentId: string) => {
    if (!selectedClassId) return;
    
    setRemoving(studentId);
    try {
      await dispatch(removeStudentFromClass({ 
        classId: selectedClassId, 
        studentId 
      })).unwrap();
      toast.success("Student removed from class");
      dispatch(fetchClassDetails(selectedClassId));
    } catch (error: any) {
      toast.error(error || "Failed to remove student");
    } finally {
      setRemoving(null);
    }
  };

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

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // Get class teacher name
  const classTeacher = useMemo(() => {
    if (!selectedClassDetails) return null;
    const teachers = selectedClassDetails.teacherAssignments || selectedClassDetails.teachers || [];
    const classTeacherAssignment = teachers.find((t: any) => t.isClassTeacher);
    if (classTeacherAssignment) {
      const teacher = classTeacherAssignment.teacher || classTeacherAssignment;
      return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Not assigned";
    }
    return teachers[0]?.teacher?.firstName 
      ? `${teachers[0].teacher.firstName} ${teachers[0].teacher.lastName || ""}`.trim()
      : "Not assigned";
  }, [selectedClassDetails]);

  const capacity = selectedClass?.capacity || 30;
  const enrolled = enrolledStudents.length;
  const capacityPercent = Math.min((enrolled / capacity) * 100, 100);

  return (
    <div className="w-full">
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Enrollment Manager</h1>
          <p className="text-slate-500 mt-1">
            Manage registration and student allocation for{" "}
            <span className="font-semibold text-slate-700">
              {selectedClass?.name || "your classes"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Class Selector */}
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="h-11 w-[200px] rounded-xl bg-white">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="h-11 rounded-xl text-white font-semibold gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlus className="w-4 h-4" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-col sm:flex-row h-auto w-full sm:w-fit">
          <TabsTrigger value="enrollment" className="rounded-lg px-4 sm:px-6 py-2 sm:py-1.5 data-[state=active]:bg-white w-full sm:w-auto">
            <Users className="w-4 h-4 mr-2" />
            Enrollment Portal
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg px-4 sm:px-6 py-2 sm:py-1.5 data-[state=active]:bg-white w-full sm:w-auto">
            <BarChart3 className="w-4 h-4 mr-2" />
            Class Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="mt-6">
          {!selectedClassId ? (
            <Card className="p-12 rounded-2xl border-slate-100 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Select a Class</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Choose a class from the dropdown above to manage student enrollments.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Students Panel */}
              <Card className="rounded-2xl border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Available Students</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{availableStudents.length} total</p>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search students by name or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Students List */}
                <div className="max-h-[500px] overflow-y-auto">
                  {availableStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium">No available students</p>
                      <p className="text-sm mt-1">All students are enrolled or no match found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {availableStudents.map((student: any) => (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(student.firstName + student.lastName)}`}>
                              {getInitials(student.firstName, student.lastName)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-slate-500">
                                ID: {student.studentId || student.code || "—"}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => enrollStudent(student.id)}
                            disabled={enrolling === student.id}
                            className="h-9 px-4 rounded-lg text-white font-medium"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {enrolling === student.id ? "..." : "Enroll"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Class Roster Panel */}
              <Card className="rounded-2xl border-slate-100 overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <div className="p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{selectedClass?.name} Roster</h3>
                      <p className="text-white/80 text-sm mt-0.5">
                        CLASS TEACHER: {classTeacher?.toUpperCase() || "NOT ASSIGNED"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Capacity</p>
                      <p className="text-2xl font-bold">{enrolled}/{capacity}</p>
                    </div>
                  </div>
                  
                  {/* Capacity Progress Bar */}
                  <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Enrolled Students List */}
                <div className="bg-white rounded-t-3xl -mt-3">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Currently Enrolled
                    </p>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto">
                    {loadingClassDetails ? (
                      <div className="p-8 text-center text-slate-500">
                        <div 
                          className="w-8 h-8 border-2 border-slate-200 rounded-full animate-spin mx-auto mb-2"
                          style={{ borderTopColor: primaryColor }}
                        />
                        <p className="text-sm">Loading students...</p>
                      </div>
                    ) : enrolledStudents.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium">No students enrolled</p>
                        <p className="text-sm mt-1">Enroll students from the left panel.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {enrolledStudents.map((student: any) => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(student.firstName + student.lastName)}`}>
                                {getInitials(student.firstName, student.lastName)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Reg: {formatDate(student.enrolledAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeStudent(student.id)}
                              disabled={removing === student.id}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {removing === student.id ? (
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Export Button */}
                  <div className="p-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl border-slate-200 gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export Class List (PDF)
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card className="p-8 rounded-2xl border-slate-100 text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Class Statistics</h3>
            <p className="text-slate-500 mt-2">
              Enrollment statistics and analytics coming soon.
            </p>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
