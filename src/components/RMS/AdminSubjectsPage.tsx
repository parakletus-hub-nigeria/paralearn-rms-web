"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { assignTeacherToSubject, createSubject, fetchClasses, fetchSubjects } from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { fetchAllUsers, getTenantInfo } from "@/reduxToolKit/user/userThunks";
import apiClient from "@/lib/api";
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
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

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
    classId: "",
    description: "",
  });
  const [assignTeacherId, setAssignTeacherId] = useState("");

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

  // Get unique levels from classes for filter tabs
  // Use level if available, otherwise use class name
  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    classes.forEach((c) => {
      // Use level if available, otherwise use name
      const label = c.level || c.name;
      if (label) levels.add(label);
    });
    return Array.from(levels).sort();
  }, [classes]);

  // Create class name lookup
  const classById = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of classes) map.set(c.id, c);
    return map;
  }, [classes]);

  // Create a map to store fetched subject details with teachers
  const [subjectDetailsMap, setSubjectDetailsMap] = useState<Map<string, any>>(new Map());
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Fetch subject details to get teacher assignments
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (subjects.length === 0 || fetchingDetails) return;
      
      setFetchingDetails(true);
      const newMap = new Map<string, any>();
      
      // Fetch details for each subject using apiClient
      // Try with include/expand parameters to get teacher data
      for (const subject of subjects) {
        try {
          // Try different endpoints/parameters to get teacher assignments
          let subjectData = null;
          
          // Attempt 1: Get subject with include parameter
          try {
            const response = await apiClient.get(`/api/proxy/subjects/${subject.id}?include=teachers,teacherAssignments`);
            subjectData = response.data?.data || response.data;
          } catch (e) {
            // Attempt 2: Get basic subject details
            const response = await apiClient.get(`/api/proxy/subjects/${subject.id}`);
            subjectData = response.data?.data || response.data;
          }
          
          // If no teacher data in subject, try to get it from the class endpoint
          if (subjectData && !subjectData.teachers && !subjectData.teacherAssignments && subject.classId) {
            try {
              const classResponse = await apiClient.get(`/api/proxy/classes/${subject.classId}`);
              const classData = classResponse.data?.data || classResponse.data;
              
              // Check if the class has subject-teacher assignments
              if (classData?.subjects) {
                const matchingSubject = classData.subjects.find((s: any) => s.id === subject.id);
                if (matchingSubject) {
                  subjectData = { ...subjectData, ...matchingSubject };
                }
              }
              
              // Also check teacherAssignments on class level
              if (classData?.teacherAssignments) {
                // Find assignments that might be linked to this subject
                const subjectAssignments = classData.teacherAssignments.filter(
                  (a: any) => a.subjectId === subject.id
                );
                if (subjectAssignments.length > 0) {
                  subjectData.teacherAssignments = subjectAssignments;
                }
              }
            } catch (classError: any) {
              // Ignore class fetch error
            }
          }
          
          if (subjectData) {
            newMap.set(subject.id, subjectData);
          }
        } catch (e: any) {
          // Ignore general fetch error
        }
      }
      
      setSubjectDetailsMap(newMap);
      setFetchingDetails(false);
    };

    // Only fetch if we don't have details yet
    if (subjects.length > 0 && subjectDetailsMap.size === 0) {
      fetchSubjectDetails();
    }
  }, [subjects]);

  // Filter subjects
  const filtered = useMemo(() => {
    let result = subjects;

    // Filter by class
    if (classFilter !== "all") {
      result = result.filter((s: any) => s.classId === classFilter);
    }

    // Filter by level (check both level and name)
    if (levelFilter !== "all") {
      result = result.filter((s: any) => {
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
    try {
      if (!form.name.trim()) return toast.error("Subject name is required");
      if (!form.classId.trim()) return toast.error("Please select a class");
      await dispatch(
        createSubject({
          name: form.name.trim(),
          code: form.code.trim() || undefined,
          classId: form.classId.trim(),
          description: form.description.trim() || undefined,
        })
      ).unwrap();
      setForm({ name: "", code: "", classId: "", description: "" });
      setShowCreateModal(false);
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(e || "Failed to create subject");
    }
  };

  const handleAssignTeacher = async () => {
    try {
      if (!selectedSubject) return toast.error("Please select a subject");
      if (!assignTeacherId) return toast.error("Please select a teacher");
      await dispatch(assignTeacherToSubject({ subjectId: selectedSubject.id, teacherId: assignTeacherId })).unwrap();
      toast.success("Teacher assigned to subject");
      setAssignTeacherId("");
      setShowAssignModal(false);
      setSelectedSubject(null);
      // Clear cached details so it re-fetches with new teacher data
      setSubjectDetailsMap(new Map());
      setFetchingDetails(false);
      dispatch(fetchSubjects());
    } catch (e: any) {
      toast.error(e || "Failed to assign teacher");
    }
  };

  const openAssignModal = (subject: any) => {
    setSelectedSubject(subject);
    setAssignTeacherId("");
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
    // First, check if we have fetched details for this subject
    const details = subjectDetailsMap.get(subject.id);
    const subjectToCheck = details || subject;
    
    // 1. Check teacherAssignments array (primary source from API)
    // Structure: teacherAssignments: [{ teacher: { id, firstName, lastName, email } }]
    if (subjectToCheck.teacherAssignments && subjectToCheck.teacherAssignments.length > 0) {
      const assignment = subjectToCheck.teacherAssignments[0];
      
      // The teacher object is nested inside the assignment
      if (assignment.teacher) {
        const teacher = assignment.teacher;
        if (teacher.firstName || teacher.lastName || teacher.email) {
          return teacher;
        }
      }
      
      // Fallback: If assignment only has teacherId, look up in our teachers list
      if (assignment.teacherId) {
        const found = teacherById.get(assignment.teacherId);
        if (found) {
          return found;
        }
      }
    }
    
    // 2. Check teachers array (alternative format from some endpoints)
    if (subjectToCheck.teachers && subjectToCheck.teachers.length > 0) {
      const teacher = subjectToCheck.teachers[0];
      if (teacher) {
        // Handle 'name' field (API format) - split into firstName/lastName
        if (teacher.name && !teacher.firstName) {
          const parts = teacher.name.split(' ');
          return {
            ...teacher,
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
          };
        }
        if (teacher.firstName || teacher.lastName || teacher.email) {
          return teacher;
        }
      }
    }
    
    // 3. Check direct teacher field
    if (subjectToCheck.teacher) {
      const teacher = subjectToCheck.teacher;
      if (teacher.firstName || teacher.lastName || teacher.email) {
        return teacher;
      }
    }
    
    // 4. Check teacherId field and look up
    if (subjectToCheck.teacherId) {
      const found = teacherById.get(subjectToCheck.teacherId);
      if (found) {
        return found;
      }
    }
    
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
            className="h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
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
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full">
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
                    const cls = classById.get(subject.classId);
                    const level = cls?.level || cls?.name || "—";
                    // Use shuffled colors based on global index in filtered list
                    const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx;
                    const levelColor = getColorByIndex(globalIdx);
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
                          <Badge className={`rounded-lg px-3 py-1 font-medium text-xs ${levelColor.bg} ${levelColor.text}`}>
                            {level}
                          </Badge>
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
                                <p className="text-slate-500 text-xs">
                                  {teacher.role || teacher.teacherId || "Subject Teacher"}
                                </p>
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
                          <button
                            onClick={() => openAssignModal(subject)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors inline-flex"
                          >
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Subject</h2>
                <p className="text-sm text-slate-500 mt-0.5">Add a new subject to a class</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Subject Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Code</label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. MATH101"
                    className="mt-2 h-11 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Class</label>
                  <div className="mt-2" style={{ position: "relative", zIndex: 10001 }}>
                    <Select value={form.classId} onValueChange={(v) => setForm((p) => ({ ...p, classId: v }))}>
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl" style={{ zIndex: 10002 }}>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.level ? `(${c.level})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                {loading ? "Creating..." : "Create Subject"}
              </Button>
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

            <div className="px-6 py-5">
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
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(name)}`}
                            >
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
