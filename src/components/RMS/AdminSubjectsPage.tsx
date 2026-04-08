"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  assignTeacherToSubject,
  createSubject,
  assignSubjectToClass,
  removeSubjectFromClass,
  updateSubjectDetails,
  fetchClasses,
  fetchSubjects,
} from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { fetchAllUsers, getTenantInfo } from "@/reduxToolKit/user/userThunks";
import {
  useDeleteSubjectMutation,
  useAssignTeacherToClassSubjectMutation,
  useRemoveTeacherFromClassSubjectMutation,
} from "@/reduxToolKit/api/endpoints/subjects";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  UserPlus,
  Link,
  Unlink,
} from "lucide-react";
import { ProductTour } from "@/components/common/ProductTour";

const subjectTourSteps = [
  {
    target: '.subjects-create-btn',
    content: "Create a new subject by defining its name, code, and class level. Subjects are linked directly to classes and assigned to specific teachers.",
    disableBeacon: true,
  },
  {
    target: '.subjects-filter-bar',
    content: "Filter subjects by class or level to keep your curriculum organized, especially when managing a large number of subjects across different classes.",
  },
  {
    target: '.subjects-table',
    content: "This table lists all your subjects. Click the 'Assign' button on any row to link a teacher to that subject, which enables them to create assessments and enter scores.",
  },
];

const DEFAULT_PRIMARY = "#641BC4";

// Array of badge colors for shuffled assignment
const badgeColors = [
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

// Get color based on index (shuffled per row)
const getColorByIndex = (idx: number) => {
  return badgeColors[idx % badgeColors.length];
};

export function AdminSubjectsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { subjects, classes, loading, error, success } = useSelector((s: RootState) => s.admin);
  const { teachers, tenantInfo } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Form states
  const [form, setForm] = useState({
    name: "",
    code: "",
    classIds: [] as string[],
    description: "",
  });
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [deleteSubjectName, setDeleteSubjectName] = useState("");
  const [deleteSubject, { isLoading: deleting }] = useDeleteSubjectMutation();
  const [assignTeacherToClassSubject] = useAssignTeacherToClassSubjectMutation();
  const [removeTeacherFromClassSubject] = useRemoveTeacherFromClassSubjectMutation();

  // Edit subject (name/code at school level)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Manage class assignments for a subject
  const [showManageClassesModal, setShowManageClassesModal] = useState(false);
  const [managingSubject, setManagingSubject] = useState<any>(null);
  const [manageClassLoading, setManageClassLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchClasses(undefined));
    dispatch(fetchAllUsers());
    dispatch(getTenantInfo());
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

  // Create class name lookup
  const classById = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of classes) map.set(c.id, c);
    return map;
  }, [classes]);


  // Filter subjects — new model: classSubjects[] array instead of classId
  const filtered = useMemo(() => {
    let result = subjects;

    // Filter by class using classSubjects[] join records
    if (classFilter !== "all") {
      result = result.filter((s: any) => {
        const cs: any[] = s.classSubjects || [];
        // Fallback to legacy classId for backward compat
        return cs.some((c: any) => c.classId === classFilter) || s.classId === classFilter;
      });
    }

    // Filter by level via class lookup
    if (levelFilter !== "all") {
      result = result.filter((s: any) => {
        const cs: any[] = s.classSubjects || [];
        // Check classSubjects[].class
        if (cs.some((c: any) => {
          const cls = c.class || classById.get(c.classId);
          return cls?.level === levelFilter || cls?.name === levelFilter;
        })) return true;
        // Legacy fallback
        const cls = classById.get(s.classId);
        return cls?.level === levelFilter || cls?.name === levelFilter;
      });
    }

    // Search
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(term) ||
          (s.code || "").toLowerCase().includes(term)
      );
    }

    return result;
  }, [subjects, classFilter, levelFilter, search, classById]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedSubjects = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, classFilter, levelFilter]);

  const handleCreateSubject = async () => {
    if (!form.name.trim()) return toast.error("Subject name is required");
    try {
      // Step 1: Create the school-level subject (classId optional)
      const firstClassId = form.classIds[0];
      const created = await dispatch(
        createSubject({
          name: form.name.trim(),
          code: form.code.trim() || undefined,
          // Pass first classId inline if provided — backend auto-links it
          classId: firstClassId || undefined,
          description: form.description.trim() || undefined,
        })
      ).unwrap();

      // Step 2: Assign remaining classes (if any) via POST /subjects/:id/classes
      const remainingClassIds = form.classIds.slice(1);
      if (remainingClassIds.length > 0 && created?.id) {
        await Promise.all(
          remainingClassIds.map((classId) =>
            dispatch(assignSubjectToClass({ subjectId: created.id, classId })).unwrap()
          )
        );
      }

      toast.success(
        form.classIds.length > 1
          ? `Subject created and assigned to ${form.classIds.length} classes`
          : form.classIds.length === 1
            ? "Subject created and assigned to class"
            : "Subject created in school catalogue"
      );
      setForm({ name: "", code: "", classIds: [], description: "" });
      setShowCreateModal(false);
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : e?.message || "Failed to create subject");
    }
  };

  const handleEditSubject = async () => {
    if (!editSubject) return;
    if (!editForm.name.trim()) return toast.error("Subject name is required");
    setEditLoading(true);
    try {
      await dispatch(updateSubjectDetails({ id: editSubject.id, name: editForm.name.trim(), code: editForm.code.trim() || undefined })).unwrap();
      toast.success("Subject updated");
      setShowEditModal(false);
      setEditSubject(null);
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : e?.message || "Failed to update subject");
    } finally {
      setEditLoading(false);
    }
  };

  const handleAssignToClass = async (classId: string) => {
    if (!managingSubject) return;
    setManageClassLoading(true);
    try {
      await dispatch(assignSubjectToClass({ subjectId: managingSubject.id, classId })).unwrap();
      toast.success("Subject assigned to class");
      dispatch(fetchSubjects());
      // Update local managing subject state
      const res = await dispatch(fetchSubjects()).unwrap();
      const updated = (res as any[])?.find((s: any) => s.id === managingSubject.id);
      if (updated) setManagingSubject(updated);
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : e?.message || "Failed to assign to class");
    } finally {
      setManageClassLoading(false);
    }
  };

  const handleRemoveFromClass = async (classId: string) => {
    if (!managingSubject) return;
    if (!confirm("Remove this subject from the class? The subject stays in the school catalogue.")) return;
    setManageClassLoading(true);
    try {
      await dispatch(removeSubjectFromClass({ subjectId: managingSubject.id, classId })).unwrap();
      toast.success("Subject removed from class");
      dispatch(fetchSubjects());
      const res = await dispatch(fetchSubjects()).unwrap();
      const updated = (res as any[])?.find((s: any) => s.id === managingSubject.id);
      if (updated) setManagingSubject(updated);
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : e?.message || "Failed to remove from class");
    } finally {
      setManageClassLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;
    try {
      await deleteSubject(deleteSubjectId).unwrap();
      toast.success("Subject deleted successfully");
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Failed to delete subject");
    } finally {
      setDeleteSubjectId(null);
      setDeleteSubjectName("");
    }
  };

  // assignClassSubjectId: the classSubjectId to scope teacher assignment to
  // null means "no specific class" — falls back to legacy school-wide endpoint
  const [assignClassSubjectId, setAssignClassSubjectId] = useState<string | null>(null);

  const handleAssignTeacher = async () => {
    if (!selectedSubject) return toast.error("Please select a subject");
    if (!assignTeacherId) return toast.error("Please select a teacher");
    try {
      if (assignClassSubjectId) {
        // New model: assign to specific class-subject
        await assignTeacherToClassSubject({ classSubjectId: assignClassSubjectId, teacherId: assignTeacherId }).unwrap();
      } else {
        // Legacy fallback: school-wide assignment
        await dispatch(assignTeacherToSubject({ subjectId: selectedSubject.id, teacherId: assignTeacherId })).unwrap();
      }
      toast.success("Teacher assigned successfully");
      setAssignTeacherId("");
      setAssignClassSubjectId(null);
      setShowAssignModal(false);
      setSelectedSubject(null);
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : e?.data?.message || "Failed to assign teacher");
    }
  };

  // Open assign modal — if subject has classSubjects, pick the first classSubjectId
  // so we default to the new scoped assignment
  const openAssignModal = (subject: any, classSubjectId?: string) => {
    setSelectedSubject(subject);
    setAssignTeacherId("");
    // Use explicitly passed classSubjectId, or first classSubject from subject
    const csId = classSubjectId ?? subject.classSubjects?.[0]?.id ?? null;
    setAssignClassSubjectId(csId);
    setShowAssignModal(true);
  };

  // Create a map of teacher IDs to teacher data for lookup
  const teacherById = useMemo(() => {
    const map = new Map<string, any>();
    for (const t of (teachers || [])) {
      map.set(t.id, t);
    }
    return map;
  }, [teachers]);

  const getTeacherInfo = (subject: any) => {
    // 1. New model: teachers[] from GET /subjects/by-class (class-scoped TeacherClassSubject)
    if (subject.teachers?.length > 0) {
      return subject.teachers[0].teacher ?? null;
    }

    // 2. Legacy: teacherAssignments[] from GET /subjects (school-wide TeacherSubject)
    if (subject.teacherAssignments?.length > 0) {
      const a = subject.teacherAssignments[0];
      return a.teacher ?? teacherById.get(a.teacherId) ?? null;
    }

    // 3. Direct teacher field or teacherId lookup
    if (subject.teacher) return subject.teacher;
    if (subject.teacherId) return teacherById.get(subject.teacherId);

    return null;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase() || "?";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-violet-500",
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
    ];
    const index = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="w-full">
      <ProductTour tourKey="admin_subjects" steps={subjectTourSteps} />
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
      />

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">Subject Management</h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Manage curriculum, assign teachers, and organize classes.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="subjects-create-btn h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="subjects-filter-bar flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by subject code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">FILTER BY:</span>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* "All" indicator button */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setLevelFilter("all")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-white text-slate-900 shadow-sm"
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium">Loading subjects...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Subject Code
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Subject Name
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Class Level
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Assigned Teacher
                    </th>
                    <th className="text-center text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubjects.map((subject: any, idx) => {
                    // New model: classes come from classSubjects[]
                    const classSubjects: any[] = subject.classSubjects || [];
                    const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx;
                    const teacher = getTeacherInfo(subject);

                    return (
                      <tr
                        key={subject.id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <span className="font-mono text-sm text-slate-600">
                            {subject.code || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="font-semibold text-slate-900">
                            {subject.name}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          {classSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {classSubjects.slice(0, 3).map((cs: any, i: number) => {
                                const color = getColorByIndex(globalIdx + i);
                                const name = cs.class?.name || classById.get(cs.classId)?.name || cs.classId;
                                return (
                                  <Badge key={cs.id || i} className={`rounded-lg px-2 py-0.5 font-medium text-xs ${color.bg} ${color.text}`}>
                                    {name}
                                  </Badge>
                                );
                              })}
                              {classSubjects.length > 3 && (
                                <Badge className="rounded-lg px-2 py-0.5 font-medium text-xs bg-slate-100 text-slate-500">
                                  +{classSubjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm italic">No classes</span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          {teacher ? (
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(
                                  teacher.name || `${teacher.firstName || ""}${teacher.lastName || ""}`
                                )}`}
                              >
                                {teacher.name
                                  ? teacher.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                  : getInitials(teacher.firstName, teacher.lastName)
                                }
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Teacher"}
                                </p>
                                <p className="text-slate-500 text-xs">Subject Teacher</p>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAssignModal(subject)}
                              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                                <UserPlus className="w-4 h-4" />
                              </div>
                              <span className="italic">Unassigned</span>
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => { setEditSubject(subject); setEditForm({ name: subject.name, code: subject.code || "" }); setShowEditModal(true); }}
                              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit subject name/code"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                              onClick={() => openAssignModal(subject)}
                              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Assign teacher"
                            >
                              <UserPlus className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                              onClick={() => { setManagingSubject(subject); setShowManageClassesModal(true); }}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Manage class assignments"
                            >
                              <Link className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => { setDeleteSubjectId(subject.id); setDeleteSubjectName(subject.name); }}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete subject"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedSubjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500 font-medium">
                        No subjects found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{filtered.length}</span> results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-3 rounded-lg border-slate-200"
                  >
                    Previous
                  </Button>
                  
                  {/* Sliding pagination - shows 5 pages at a time */}
                  {(() => {
                    const maxVisible = 5;
                    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    
                    const pages = [];
                    
                    // Show first page + ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          className="h-9 w-9 rounded-lg border-slate-200"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis-start" className="px-2 text-slate-400">...</span>
                        );
                      }
                    }
                    
                    // Show visible page range
                    for (let p = startPage; p <= endPage; p++) {
                      pages.push(
                        <Button
                          key={p}
                          variant={page === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={`h-9 w-9 rounded-lg transition-all ${
                            page === p ? "text-white" : "border-slate-200"
                          }`}
                          style={page === p ? { backgroundColor: primaryColor } : {}}
                        >
                          {p}
                        </Button>
                      );
                    }
                    
                    // Show ellipsis + last page if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis-end" className="px-2 text-slate-400">...</span>
                        );
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          className="h-9 w-9 rounded-lg border-slate-200"
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="h-9 px-3 rounded-lg border-slate-200"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setForm({ name: "", code: "", classIds: [], description: "" }); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Subject</h2>
                <p className="text-sm text-slate-500 mt-0.5">Add a new subject to one or more classes</p>
              </div>
              <button onClick={() => { setShowCreateModal(false); setForm({ name: "", code: "", classIds: [], description: "" }); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Subject Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Mathematics"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Code</label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. MATH101"
                    className="mt-2 h-11 rounded-xl font-mono"
                  />
                  {form.classIds.length > 1 && form.code.trim() && (
                    <p className="text-xs text-slate-400 mt-1">
                      A class suffix will be appended for each class (e.g. {form.code.trim()}-JSS1A)
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Description (Optional)</label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the subject"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Right column — Classes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Classes
                    {form.classIds.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        ({form.classIds.length} selected)
                      </span>
                    )}
                  </label>
                  {form.classIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, classIds: [] }))}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {classes.map((c) => {
                      const checked = form.classIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) =>
                              setForm((p) => ({
                                ...p,
                                classIds: val
                                  ? [...p.classIds, c.id]
                                  : p.classIds.filter((id) => id !== c.id),
                              }))
                            }
                          />
                          <span className="text-sm text-slate-800">
                            {c.name}
                            {c.level ? (
                              <span className="text-slate-400 ml-1">({c.level})</span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                    {classes.length === 0 && (
                      <p className="px-4 py-4 text-sm text-slate-400 text-center">No classes found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubject}
                disabled={loading}
                className="h-11 px-6 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? "Creating..." : form.classIds.length > 1 ? `Create ${form.classIds.length} Subjects` : "Create Subject"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteSubjectId && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteSubjectId(null); setDeleteSubjectName(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Delete Subject</h2>
              <button onClick={() => { setDeleteSubjectId(null); setDeleteSubjectName(""); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteSubjectName}</span>?
                This will also remove teacher assignments for this subject. Associated assessments will be unlinked but not deleted.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => { setDeleteSubjectId(null); setDeleteSubjectName(""); }} className="h-10 px-5 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSubject}
                disabled={deleting}
                className="h-10 px-5 rounded-xl text-white bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Subject Modal */}
      {showEditModal && editSubject && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Subject</h2>
                <p className="text-sm text-slate-500 mt-0.5">Updates the school-wide subject name and code</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Subject Name</label>
                <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="mt-2 h-11 rounded-xl" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Code</label>
                <Input value={editForm.code} onChange={(e) => setEditForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="mt-2 h-11 rounded-xl font-mono" placeholder="e.g. MTH101" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="h-11 px-6 rounded-xl">Cancel</Button>
              <Button onClick={handleEditSubject} disabled={editLoading} className="h-11 px-6 rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Manage Class Assignments Modal */}
      {showManageClassesModal && managingSubject && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowManageClassesModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage Classes</h2>
                <p className="text-sm text-slate-500 mt-0.5">Assign or remove <span className="font-semibold">{managingSubject.name}</span> from classes</p>
              </div>
              <button onClick={() => setShowManageClassesModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-1">
              {classes.map((cls: any) => {
                const assigned = (managingSubject.classSubjects || []).some((cs: any) => cs.classId === cls.id);
                return (
                  <div key={cls.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{cls.name}</p>
                      {cls.level && <p className="text-slate-400 text-xs">{cls.level}</p>}
                    </div>
                    {assigned ? (
                      <button
                        onClick={() => handleRemoveFromClass(cls.id)}
                        disabled={manageClassLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Unlink className="w-3.5 h-3.5" /> Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignToClass(cls.id)}
                        disabled={manageClassLoading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Link className="w-3.5 h-3.5" /> Assign
                      </button>
                    )}
                  </div>
                );
              })}
              {classes.length === 0 && <p className="text-center text-slate-400 py-6 text-sm">No classes found</p>}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowManageClassesModal(false)} className="h-11 px-6 rounded-xl">Done</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedSubject && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Teacher</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Assign a teacher to <span className="font-semibold">{selectedSubject.name}</span>
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Class scope selector — shown when subject is in multiple classes */}
              {selectedSubject.classSubjects?.length > 1 && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Assign for Class</label>
                  <Select
                    value={assignClassSubjectId ?? ""}
                    onValueChange={(v) => setAssignClassSubjectId(v || null)}
                  >
                    <SelectTrigger className="mt-2 h-11 w-full rounded-xl">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl" style={{ zIndex: 10002 }}>
                      {selectedSubject.classSubjects.map((cs: any) => {
                        const name = cs.class?.name ?? classById.get(cs.classId)?.name ?? cs.classId;
                        return <SelectItem key={cs.id} value={cs.id}>{name}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 mt-1">Teacher will be scoped to this class only</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700">Select Teacher</label>
                <div className="mt-2" style={{ position: "relative", zIndex: 10001 }}>
                  <Select value={assignTeacherId} onValueChange={setAssignTeacherId}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]" style={{ zIndex: 10002 }}>
                      {(teachers || []).map((t: any) => {
                        const name = `${t.firstName || ""} ${t.lastName || ""}`.trim();
                        return (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(name)}`}>
                                {getInitials(t.firstName, t.lastName)}
                              </div>
                              <span>{name || t.email || t.id}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <Button variant="outline" onClick={() => setShowAssignModal(false)} className="h-11 px-6 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleAssignTeacher}
                disabled={loading}
                className="h-11 px-6 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? "Assigning..." : "Assign Teacher"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
