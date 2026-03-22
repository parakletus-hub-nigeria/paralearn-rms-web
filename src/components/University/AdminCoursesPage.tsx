"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useAssignLecturerMutation,
  useRemoveLecturerMutation,
} from "@/reduxToolKit/uniFeatures/courseApi";
import { useGetDepartmentsQuery } from "@/reduxToolKit/uniFeatures/departmentApi";
import { useGetUniUsersQuery } from "@/reduxToolKit/uniFeatures/adminApi";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminCoursesPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const {
    data: coursesResponse,
    isLoading,
    isFetching,
    refetch: refetchCourses,
  } = useGetCoursesQuery();
  const { data: deptsResponse } = useGetDepartmentsQuery();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

  const [assignLecturer, { isLoading: isAssigning }] =
    useAssignLecturerMutation();
  const [removeLecturer, { isLoading: isRemoving }] =
    useRemoveLecturerMutation();

  const { data: lecturersResponse, isLoading: loadingLecturers } =
    useGetUniUsersQuery({ role: "LECTURER", limit: 100 });

  const courses = Array.isArray(coursesResponse?.data)
    ? coursesResponse.data
    : Array.isArray(coursesResponse)
      ? coursesResponse
      : [];
  const departments = Array.isArray(deptsResponse?.data)
    ? deptsResponse.data
    : Array.isArray(deptsResponse)
      ? deptsResponse
      : [];
  const lecturers = lecturersResponse?.data || [];

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Form states
  const [form, setForm] = useState({
    code: "",
    title: "",
    creditUnits: 3,
    departmentId: "",
  });

  // Filter courses
  const filtered = courses.filter((c: any) => {
    if (deptFilter !== "all" && c.departmentId !== deptFilter) return false;

    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (c.title || "").toLowerCase().includes(term) ||
      (c.code || "").toLowerCase().includes(term) ||
      (c.department?.name || "").toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCourses = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleCreateCourse = async () => {
    try {
      if (!form.code.trim()) return toast.error("Course code is required");
      if (!form.title.trim()) return toast.error("Course title is required");
      if (!form.departmentId) return toast.error("Please select a department");
      if (form.creditUnits < 1)
        return toast.error("Credit units must be valid");

      await createCourse({
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        creditUnits: Number(form.creditUnits),
        departmentId: form.departmentId,
      }).unwrap();

      toast.success("Course created successfully");
      setForm({ code: "", title: "", creditUnits: 3, departmentId: "" });
      setShowCreateModal(false);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to create course");
    }
  };

  const handleAssignLecturer = async (lecturerId: string) => {
    if (!selectedCourse) return;
    try {
      await assignLecturer({
        courseId: selectedCourse.id,
        lecturerId,
      }).unwrap();
      toast.success("Lecturer assigned successfully");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Assignment failed");
    }
  };

  const handleRemoveLecturer = async (lecturerId: string) => {
    if (!selectedCourse) return;
    try {
      await removeLecturer({
        courseId: selectedCourse.id,
        lecturerId,
      }).unwrap();
      toast.success("Lecturer removed successfully");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Removal failed");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              Courses Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Create and manage courses logic across departments.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by title, code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
              FILTER BY DEPT:
            </span>
            <Select
              value={deptFilter}
              onValueChange={(val) => {
                setDeptFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-[200px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Code
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Title
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Units
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Lecutrers
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Dept
                    </th>
                    <th className="text-center text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.map((course: any, idx: number) => (
                    <tr
                      key={course.id || idx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-sm">
                          {course.code}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-900 font-medium">
                        {course.title}
                      </td>
                      <td className="py-4 px-3 text-slate-600">
                        {course.creditUnits}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1">
                          {course.courseLecturers?.map((cl: any) => (
                            <Badge
                              key={cl.lecturerId}
                              variant="secondary"
                              className="text-[10px] h-5"
                            >
                              {cl.lecturer?.user?.firstName || "Lec"}
                            </Badge>
                          ))}
                          {(!course.courseLecturers ||
                            course.courseLecturers.length === 0) && (
                            <span className="text-[10px] text-slate-400">
                              No lecturers
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-sm">
                        {course.department?.name || "—"}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowAssignModal(true);
                          }}
                          className="h-8 px-3 rounded-lg border-purple-100 text-purple-600 hover:bg-purple-50 gap-1.5 font-bold text-xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {paginatedCourses.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-500 font-medium"
                      >
                        No courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filtered.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(page - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filtered.length}
                  </span>{" "}
                  results
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
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

      {/* Create Course Modal */}
      {showCreateModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Create Course
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Add a new course to a department
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Course Code
                    </label>
                    <Input
                      value={form.code}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. CS101"
                      className="mt-2 h-11 rounded-xl font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Credit Units
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={form.creditUnits}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          creditUnits: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Course Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Introduction to Programming"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Department
                  </label>
                  <div
                    className="mt-2"
                    style={{ position: "relative", zIndex: 10001 }}
                  >
                    <Select
                      value={form.departmentId}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, departmentId: v }))
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl"
                        style={{ zIndex: 10002 }}
                      >
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="h-11 px-6 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCourse}
                  disabled={isCreating}
                  className="h-11 px-6 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isCreating ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Assign Lecturer Modal */}
      {showAssignModal &&
        selectedCourse &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Assign Lecturers
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage lecturers for{" "}
                    <span className="font-bold text-purple-600">
                      {selectedCourse.code}: {selectedCourse.title}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {loadingLecturers ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">
                      Loading lecturers...
                    </p>
                  </div>
                ) : lecturers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <p className="text-sm text-slate-500 font-medium">No lecturer found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lecturers.map((lecturer: any) => {
                      const isAssigned =
                        selectedCourse.courseLecturers?.some(
                          (cl: any) =>
                            cl.lecturerId === lecturer.lecturerProfile?.id,
                        ) || false;

                      return (
                        <div
                          key={lecturer.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isAssigned
                              ? "bg-purple-50/50 border-purple-100"
                              : "bg-slate-50/50 border-transparent hover:border-slate-100 hover:bg-slate-100/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center font-bold text-purple-600 text-sm shadow-sm">
                              {lecturer.firstName?.[0]}
                              {lecturer.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {lecturer.firstName} {lecturer.lastName}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                {lecturer.email}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            disabled={isAssigning || isRemoving}
                            onClick={() =>
                              isAssigned
                                ? handleRemoveLecturer(
                                    lecturer.lecturerProfile.id,
                                  )
                                : handleAssignLecturer(
                                    lecturer.lecturerProfile.id,
                                  )
                            }
                            variant={isAssigned ? "outline" : "default"}
                            className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm transition-all ${
                              isAssigned
                                ? "border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                                : "text-white shadow-purple-100"
                            }`}
                            style={
                              !isAssigned
                                ? { backgroundColor: primaryColor }
                                : {}
                            }
                          >
                            {isAssigned ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Assign
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-end bg-slate-50/30">
                <Button
                  onClick={() => setShowAssignModal(false)}
                  className="h-11 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
