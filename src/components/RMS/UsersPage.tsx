"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
import { fetchClasses } from "@/reduxToolKit/admin/adminThunks";
import { exportStudentsToPDF, exportTeachersToPDF } from "@/lib/pdfExport";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddUserModal } from "@/components/RMS/AddUserModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Default ParaLearn brand color
const DEFAULT_PRIMARY = "#641BC4";

type UserRow = {
  id: string;
  dbId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "teacher" | "student";
  classId?: string;
  className?: string;
  status: "active" | "offline";
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
};

export const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { students, teachers, loading } = useSelector((s: RootState) => s.user);
  const { classes } = useSelector((s: RootState) => s.admin);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);

  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "teacher" | "student">("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<"student" | "teacher">("student");
  
  // Action menu state
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [viewUserModal, setViewUserModal] = useState<UserRow | null>(null);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchClasses(undefined));
  }, [dispatch]);

  // Create a map of class IDs to class names
  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classes) {
      map.set(c.id, c.name);
    }
    return map;
  }, [classes]);

  // Build unified user list
  const allUsers = useMemo<UserRow[]>(() => {
    const studentRows: UserRow[] = (students || []).map((s: any) => {
      // Get classId from various possible locations in the response
      // Check enrollments array first (might be most recent structure)
      const firstEnrollment = s.enrollments?.[0] || s.enrollment || {};
      const classId = s.classId || firstEnrollment.classId || s.class?.id || firstEnrollment.class?.id || "";
      // Look up class name from our classes map, or use the one from the response
      const className = classNameById.get(classId) || s.className || s.class?.name || firstEnrollment.class?.name || "";
      
      // Also check if student profile has studentProfile with class info
      const profile = s.studentProfile || s.profile || {};
      const profileClassId = profile.classId || "";
      const profileClassName = classNameById.get(profileClassId) || profile.class?.name || "";
      
      return {
        id: s.studentId || profile.studentId || s.id || "",
        dbId: s.id || "",
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        email: s.email || "",
        role: "student" as const,
        classId: classId || profileClassId,
        className: className || profileClassName,
        status: "active" as const,
        avatar: s.avatar || "",
        phoneNumber: s.phoneNumber || "",
        dateOfBirth: s.dateOfBirth,
        address: s.address || "",
      };
    });

    const teacherRows: UserRow[] = (teachers || []).map((t: any) => {
      const src = t?.user ?? t?.profile ?? t ?? {};
      // Teachers may have multiple classes, but we'll show their primary/first class
      const classId = t.classId || t.primaryClassId || src.classId || "";
      const className = classNameById.get(classId) || t.className || src.className || "";
      
      return {
        id: t?.teacherId || t?.teacherCode || t?.staffId || t?.code || src?.teacherId || t?.id || "",
        dbId: t.id ?? src.id ?? "",
        firstName: src.firstName ?? t?.firstName ?? "",
        lastName: src.lastName ?? t?.lastName ?? "",
        email: src.email ?? t?.email ?? "",
        role: "teacher" as const,
        classId,
        className,
        status: "active" as const,
        avatar: src.avatar || t?.avatar || "",
        phoneNumber: src.phoneNumber ?? t?.phoneNumber ?? "",
        dateOfBirth: src.dateOfBirth ?? t?.dateOfBirth,
        address: src.address ?? t?.address ?? "",
      };
    });

    return [...studentRows, ...teacherRows];
  }, [students, teachers, classNameById]);

  // Filter and search
  const filteredUsers = useMemo(() => {
    let result = allUsers;

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (classFilter !== "all") {
      result = result.filter((u) => u.classId === classFilter);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [allUsers, roleFilter, classFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, classFilter]);

  const handleExport = () => {
    if (roleFilter === "teacher" || (roleFilter === "all" && teachers.length > 0)) {
      const teacherData = teachers.map((item: any) => {
        const src = item?.user ?? item?.profile ?? item ?? {};
        return {
          id: item?.teacherId || item?.teacherCode || item?.staffId || item?.id || "N/A",
          name: `${src.firstName ?? item?.firstName ?? ""} ${src.lastName ?? item?.lastName ?? ""}`.trim() || "N/A",
          email: src.email ?? item?.email ?? "N/A",
          dateOfBirth: src.dateOfBirth ? new Date(src.dateOfBirth).toLocaleDateString() : "N/A",
          phoneNumber: src.phoneNumber ?? item?.phoneNumber ?? "N/A",
          address: src.address ?? item?.address ?? "N/A",
        };
      });
      exportTeachersToPDF(teacherData);
      toast.success("Teachers exported successfully!");
    }
    
    if (roleFilter === "student" || (roleFilter === "all" && students.length > 0)) {
      const studentData = students.map((item: any) => ({
        id: item.studentId || "N/A",
        name: `${item.firstName} ${item.lastName}`,
        email: item.email || "N/A",
        dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : "N/A",
        address: item.address || "N/A",
        phoneNumber: item.phoneNumber || "N/A",
        guardianName: item.guardianName || "N/A",
        guardianPhone: item.guardianPhone || "N/A",
      }));
      exportStudentsToPDF(studentData);
      toast.success("Students exported successfully!");
    }
  };

  // Action handlers
  const handleViewUser = (user: UserRow) => {
    setViewUserModal(user);
    setActionMenuOpen(null);
  };

  const handleEditUser = (user: UserRow) => {
    // Navigate to user edit page or open edit modal
    toast.info(`Editing ${user.firstName} ${user.lastName}`);
    setActionMenuOpen(null);
  };

  const handleDeleteUser = (user: UserRow) => {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      toast.success(`User ${user.firstName} deleted`);
      // TODO: Dispatch delete action
    }
    setActionMenuOpen(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "??";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-violet-500",
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Directory</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage student and teacher access, roles, and class enrollments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="h-11 rounded-xl border-slate-200 gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setAddModalType("student");
                setAddModalOpen(true);
              }}
              className="h-11 rounded-xl gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50"
            />
          </div>
          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
              <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="student">Students</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200">
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
            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-200">
              <Filter className="w-4 h-4 text-slate-500" />
            </Button>
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
              <p className="text-slate-500 font-medium">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: primaryColor }}>
                    <th className="text-left text-white font-semibold text-sm py-4 px-5 w-8">
                      <input type="checkbox" className="rounded border-white/30" />
                    </th>
                    <th className="text-left text-white font-semibold text-sm py-4 px-3">User Name</th>
                    <th className="text-left text-white font-semibold text-sm py-4 px-3">Role</th>
                    <th className="text-left text-white font-semibold text-sm py-4 px-3">Class</th>
                    <th className="text-left text-white font-semibold text-sm py-4 px-3">Status</th>
                    <th className="text-center text-white font-semibold text-sm py-4 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, idx) => (
                    <tr
                      key={user.dbId || idx}
                      className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                        idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
                      }`}
                    >
                      <td className="py-4 px-5">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(
                                user.firstName + user.lastName
                              )}`}
                            >
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-slate-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <Badge
                          className={`rounded-lg px-3 py-1 font-medium text-xs ${
                            user.role === "teacher"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {user.role === "teacher" ? "Teacher" : "Student"}
                        </Badge>
                      </td>
                      <td className="py-4 px-3">
                        <div>
                          {user.className ? (
                            <>
                              <p className="font-medium text-slate-900 text-sm">
                                {user.className}
                              </p>
                              <p className="text-slate-500 text-xs">Enrolled</p>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                              {user.role === "student" ? "Not Enrolled" : "—"}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span className="text-sm text-slate-600 capitalize">
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center relative">
                        <button 
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          onClick={() => setActionMenuOpen(actionMenuOpen === user.dbId ? null : user.dbId)}
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                        
                        {/* Action Dropdown Menu */}
                        {actionMenuOpen === user.dbId && (
                          <div className="absolute right-4 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[160px]">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit User
                            </button>
                            <hr className="my-1 border-slate-100" />
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(page * ITEMS_PER_PAGE, filteredUsers.length)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{filteredUsers.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-3 rounded-lg border-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        type={addModalType}
        onTypeChange={setAddModalType}
        primaryColor={primaryColor}
        classes={classes}
        onSuccess={() => {
          dispatch(fetchAllUsers());
          setAddModalOpen(false);
        }}
      />

      {/* View User Modal */}
      {viewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setViewUserModal(null)} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-4">
                {viewUserModal.avatar ? (
                  <img
                    src={viewUserModal.avatar}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getAvatarColor(
                      viewUserModal.firstName + viewUserModal.lastName
                    )}`}
                  >
                    {getInitials(viewUserModal.firstName, viewUserModal.lastName)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {viewUserModal.firstName} {viewUserModal.lastName}
                  </h2>
                  <Badge
                    className={`mt-1 rounded-lg px-2.5 py-0.5 font-medium text-xs ${
                      viewUserModal.role === "teacher"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {viewUserModal.role === "teacher" ? "Teacher" : "Student"}
                  </Badge>
                </div>
              </div>
              <button 
                onClick={() => setViewUserModal(null)} 
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{viewUserModal.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-900">{viewUserModal.phoneNumber || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {viewUserModal.dateOfBirth 
                        ? new Date(viewUserModal.dateOfBirth).toLocaleDateString() 
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Address</p>
                    <p className="text-sm font-semibold text-slate-900">{viewUserModal.address || "—"}</p>
                  </div>
                </div>

                {viewUserModal.className && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Class</p>
                      <p className="text-sm font-semibold text-slate-900">{viewUserModal.className}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-600">ID</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">User ID</p>
                    <p className="text-sm font-semibold text-slate-900 font-mono">{viewUserModal.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setViewUserModal(null)} 
                className="h-11 px-6 rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleEditUser(viewUserModal);
                  setViewUserModal(null);
                }}
                className="h-11 px-6 rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};
