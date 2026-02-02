"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { 
  assignTeacherToClass, 
  createClass, 
  fetchClasses,
  fetchClassDetails,
  removeStudentFromClass,
  removeTeacherFromClass,
} from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
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
  Plus,
  Search,
  Users,
  TrendingUp,
  MoreVertical,
  Download,
  X,
  Grid,
  List,
  UserMinus,
  Eye,
  GraduationCap,
} from "lucide-react";

const DEFAULT_PRIMARY = "#641BC4";

// Color palette for class cards
const classColors = [
  { bg: "bg-violet-50", border: "border-violet-200", accent: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  { bg: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "bg-blue-50", border: "border-blue-200", accent: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-amber-50", border: "border-amber-200", accent: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  { bg: "bg-rose-50", border: "border-rose-200", accent: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  { bg: "bg-cyan-50", border: "border-cyan-200", accent: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700" },
];

export function AdminClassesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, loading, error, success, selectedClassDetails } = useSelector((s: RootState) => s.admin);
  const { teachers } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [q, setQ] = useState("");
  const [sessionFilter, setSessionFilter] = useState("2023/2024");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [form, setForm] = useState({
    name: "",
    level: "",
    stream: "",
    capacity: "",
    academicYear: "",
  });
  const  [assignTeacherId, setAssignTeacherId] = useState("");

  useEffect(() => {
    dispatch(fetchClasses(undefined));
    dispatch(fetchAllUsers());
  }, [dispatch]);

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

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(term) ||
        (c.level || "").toLowerCase().includes(term)
    );
  }, [classes, q]);

  const submit = async () => {
    try {
      if (!form.name.trim()) return toast.error("Class name is required");
      await dispatch(
        createClass({
          name: form.name.trim(),
          level: Number(form.level) || undefined,
          stream: form.stream.trim() || undefined,
          capacity: Number(form.capacity) || undefined,
          academicYear: form.academicYear.trim() || undefined,
        })
      ).unwrap();
      setForm({ name: "", level: "", stream: "", capacity: "", academicYear: "" });
      setShowCreateModal(false);
      dispatch(fetchClasses(undefined));
    } catch (e: any) {
      toast.error(e || "Failed to create class");
    }
  };

  const assignClassTeacher = async () => {
    try {
      if (!selectedClass) return toast.error("Please select a class");
      if (!assignTeacherId) return toast.error("Please select a teacher");
      await dispatch(assignTeacherToClass({ classId: selectedClass.id, teacherId: assignTeacherId })).unwrap();
      setAssignTeacherId("");
      setShowAssignModal(false);
      setSelectedClass(null);
      // Refresh class details if viewing
      if (showDetailsModal && selectedClass) {
        dispatch(fetchClassDetails(selectedClass.id));
      }
    } catch (e: any) {
      toast.error(e || "Failed to assign teacher");
    }
  };

  const viewClassDetails = async (cls: any) => {
    setSelectedClass(cls);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    try {
      await dispatch(fetchClassDetails(cls.id)).unwrap();
    } catch (e: any) {
      toast.error(e || "Failed to load class details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;
    try {
      await dispatch(removeStudentFromClass({ classId: selectedClass.id, studentId })).unwrap();
      dispatch(fetchClassDetails(selectedClass.id));
    } catch (e: any) {
      toast.error(e || "Failed to remove student");
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedClass) return;
    try {
      await dispatch(removeTeacherFromClass({ classId: selectedClass.id, teacherId })).unwrap();
      dispatch(fetchClassDetails(selectedClass.id));
    } catch (e: any) {
      toast.error(e || "Failed to remove teacher");
    }
  };

  const getColorByIndex = (idx: number) => classColors[idx % classColors.length];

  // Get enrolled students and teachers from class details
  // Handle various possible response structures
  const classStudents = useMemo(() => {
    if (!selectedClassDetails) return [];
    // Check multiple possible paths for students
    const enrollments = selectedClassDetails.enrollments || 
                        selectedClassDetails.students || 
                        selectedClassDetails.data?.enrollments ||
                        selectedClassDetails.data?.students ||
                        [];
    return Array.isArray(enrollments) ? enrollments : [];
  }, [selectedClassDetails]);

  const classTeachers = useMemo(() => {
    if (!selectedClassDetails) return [];
    // Check multiple possible paths for teacher assignments
    let assignments = selectedClassDetails.teacherAssignments || 
                      selectedClassDetails.teachers || 
                      selectedClassDetails.classTeachers ||
                      selectedClassDetails.data?.teacherAssignments ||
                      selectedClassDetails.data?.teachers ||
                      [];
    
    // If no teachers found in class details, check if any teachers in the users list are assigned to this class
    if ((!assignments || assignments.length === 0) && selectedClass && teachers && teachers.length > 0) {
      const classId = selectedClass.id;
      const matchedTeachers = teachers.filter((t: any) => {
        // Check various possible class assignment fields
        return t.classId === classId || 
               t.primaryClassId === classId ||
               t.assignedClasses?.includes(classId) ||
               t.classes?.some((c: any) => c.id === classId || c.classId === classId);
      });
      if (matchedTeachers.length > 0) {
        assignments = matchedTeachers.map((t: any) => ({ teacher: t }));
      }
    }
    
    console.log("[AdminClassesPage] Class details:", selectedClassDetails);
    console.log("[AdminClassesPage] Teacher assignments found:", assignments);
    return Array.isArray(assignments) ? assignments : [];
  }, [selectedClassDetails, selectedClass, teachers]);

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create classes, assign teachers, and view enrolled students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 gap-2">
            <Download className="w-4 h-4" />
            Export Rosters
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by class name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="2023/2024">2023/2024 Session</SelectItem>
              <SelectItem value="2024/2025">2024/2025 Session</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-slate-100" : "hover:bg-slate-50"}`}
            >
              <Grid className={`w-4 h-4 ${viewMode === "grid" ? "text-slate-700" : "text-slate-400"}`} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-slate-100" : "hover:bg-slate-50"}`}
            >
              <List className={`w-4 h-4 ${viewMode === "list" ? "text-slate-700" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div
              className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
              style={{ borderTopColor: primaryColor }}
            />
            <p className="text-slate-500 font-medium">Loading classes...</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cls: any, idx) => {
            const color = getColorByIndex(idx);
            // Get student count from various possible locations in the response
            const studentCount = cls.studentCount ?? 
                                 cls.enrollmentCount ?? 
                                 cls._count?.enrollments ?? 
                                 cls._count?.students ?? 
                                 cls.enrollments?.length ?? 
                                 cls.students?.length ?? 
                                 0;
            const teacherCount = cls.teacherCount ?? 
                                 cls._count?.teacherAssignments ?? 
                                 cls._count?.teachers ?? 
                                 cls.teacherAssignments?.length ?? 
                                 cls.teachers?.length ?? 
                                 0;
            
            // Debug log to see class structure
            if (idx === 0) {
              console.log("[AdminClassesPage] Sample class data:", cls);
            }

            return (
              <div
                key={cls.id}
                className={`rounded-2xl border ${color.border} ${color.bg} p-5 hover:shadow-md transition-all`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                    <p className={`text-sm font-medium ${color.accent}`}>
                      Level: {cls.level || cls.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`rounded-lg px-2.5 py-0.5 text-xs font-medium ${color.badge}`}>
                      {cls.stream || "A"} Stream
                    </Badge>
                    <button className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700 font-medium">
                      {studentCount} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">
                      {teacherCount > 0 ? `${teacherCount} Teachers` : "View Details"}
                    </span>
                  </div>
                </div>

                {/* Capacity */}
                {cls.capacity && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Capacity</span>
                      <span>{studentCount} / {cls.capacity}</span>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((studentCount / cls.capacity) * 100, 100)}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-10 rounded-xl text-sm font-semibold text-white gap-2"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => viewClassDetails(cls)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-3 rounded-xl border-slate-200 bg-white"
                    onClick={() => {
                      setSelectedClass(cls);
                      setShowAssignModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Add Class Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 p-5 min-h-[240px] flex flex-col items-center justify-center gap-3 group transition-all hover:shadow-sm"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Plus className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
            <div className="text-center">
              <p className="font-bold" style={{ color: primaryColor }}>
                Add New Class
              </p>
              <p className="text-sm text-slate-500">Create a new class</p>
            </div>
          </button>

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No classes found</p>
              <p className="text-slate-400 text-sm mt-1">Create your first class to get started</p>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th className="text-left text-white font-semibold text-sm py-4 px-5">Class Name</th>
                <th className="text-left text-white font-semibold text-sm py-4 px-3">Level</th>
                <th className="text-center text-white font-semibold text-sm py-4 px-3">Students</th>
                <th className="text-center text-white font-semibold text-sm py-4 px-3">Teachers</th>
                <th className="text-center text-white font-semibold text-sm py-4 px-3">Capacity</th>
                <th className="text-center text-white font-semibold text-sm py-4 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls: any, idx) => {
                const studentCount = cls.studentCount ?? 
                                     cls.enrollmentCount ?? 
                                     cls._count?.enrollments ?? 
                                     cls._count?.students ?? 
                                     cls.enrollments?.length ?? 
                                     cls.students?.length ?? 
                                     0;
                const teacherCount = cls.teacherCount ?? 
                                     cls._count?.teacherAssignments ?? 
                                     cls._count?.teachers ?? 
                                     cls.teacherAssignments?.length ?? 
                                     cls.teachers?.length ?? 
                                     0;
                return (
                  <tr
                    key={cls.id}
                    className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div>
                        <p className="font-semibold text-slate-900">{cls.name}</p>
                        <p className="text-xs text-slate-500">{cls.stream || "Stream A"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-600">{cls.level || "—"}</td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-semibold text-slate-900">{studentCount}</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-semibold text-blue-600">{teacherCount}</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="text-slate-600">{cls.capacity || "—"}</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <Button
                        size="sm"
                        className="h-9 rounded-xl text-white"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => viewClassDetails(cls)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Class</h2>
                <p className="text-sm text-slate-500 mt-0.5">Add a new class to your school</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Class Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. JSS 1A"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Level</label>
                  <Input
                    value={form.level}
                    onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                    placeholder="e.g. JSS1"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Stream</label>
                  <Input
                    value={form.stream}
                    onChange={(e) => setForm((p) => ({ ...p, stream: e.target.value }))}
                    placeholder="e.g. A"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Capacity</label>
                  <Input
                    value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="e.g. 40"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Academic Year</label>
                  <Input
                    value={form.academicYear}
                    onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
                    placeholder="2024/2025"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={loading}
                className="h-11 px-6 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Class Teacher</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Assign a teacher to {selectedClass?.name || "this class"}
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5">
              <label className="text-sm font-semibold text-slate-700">Select Teacher</label>
              <div className="mt-2">
                <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {(teachers || []).map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {`${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowAssignModal(false)} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={assignClassTeacher}
                disabled={loading}
                className="h-11 px-6 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? "Assigning..." : "Assign Teacher"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedClass?.name || "Class Details"}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Level: {selectedClass?.level || "—"} • Capacity: {selectedClass?.capacity || "—"}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="rounded-lg bg-emerald-100 text-emerald-700 px-3 py-1">
                    <Users className="w-3.5 h-3.5 mr-1.5 inline" />
                    {classStudents.length} Students
                  </Badge>
                  <Badge className="rounded-lg bg-blue-100 text-blue-700 px-3 py-1">
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5 inline" />
                    {classTeachers.length} Teachers
                  </Badge>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-10">
                  <div
                    className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200"
                    style={{ borderTopColor: primaryColor }}
                  />
                </div>
              ) : (
                <>
                  {/* Teachers Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        Assigned Teachers ({classTeachers.length})
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg gap-1"
                        onClick={() => {
                          setShowDetailsModal(false);
                          setShowAssignModal(true);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                    {classTeachers.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-700 font-medium">No teachers assigned yet.</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Use the &quot;+&quot; button on the class card to assign a class teacher, 
                          or assign teachers to subjects in the Subjects page.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {classTeachers.map((t: any, idx: number) => {
                          const teacher = t.teacher || t;
                          const isClassTeacher = t.type === "class_teacher" || !t.subjectName;
                          const subjectName = t.subjectName || teacher?.subjectName;
                          
                          return (
                            <div key={`${teacher?.id}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                  isClassTeacher 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "bg-purple-100 text-purple-700"
                                }`}>
                                  {(teacher?.firstName?.[0] || "T").toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {`${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim() || "Teacher"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">
                                      {teacher?.email || teacher?.teacherId || "—"}
                                    </p>
                                    <Badge className={`text-[10px] px-1.5 py-0 ${
                                      isClassTeacher 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "bg-purple-100 text-purple-700"
                                    }`}>
                                      {isClassTeacher ? "Class Teacher" : subjectName || "Subject Teacher"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {isClassTeacher && (
                                <button
                                  onClick={() => handleRemoveTeacher(teacher?.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Remove teacher"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Students Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        Enrolled Students ({classStudents.length})
                      </h3>
                    </div>
                    {classStudents.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No students enrolled yet. Go to Enrollments page to add students.</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {classStudents.map((e: any, idx: number) => {
                          const student = e.student || e;
                          return (
                            <div key={student?.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                  {(student?.firstName?.[0] || "S").toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {`${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Student"}
                                  </p>
                                  <p className="text-xs text-slate-500">{student?.studentId || student?.email || "—"}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveStudent(student?.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Remove student"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="h-11 px-6 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
