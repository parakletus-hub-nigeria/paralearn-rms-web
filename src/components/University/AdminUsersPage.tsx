"use client";

import { useState } from "react";
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
import {
  FileUp,
  UserPlus,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useCreateUniUserMutation,
  useImportStudentsCSVMutation,
  useImportLecturersCSVMutation,
} from "@/reduxToolKit/uniFeatures/usersApi";
import { useGetUniUsersQuery } from "@/reduxToolKit/uniFeatures/adminApi";
import { Badge } from "@/components/ui/badge";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminUsersPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  // API Hooks
  const [createUser, { isLoading: isCreating }] = useCreateUniUserMutation();
  const [importStudents, { isLoading: isUploadingStudents }] =
    useImportStudentsCSVMutation();
  const [importLecturers, { isLoading: isUploadingLecturers }] =
    useImportLecturersCSVMutation();

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
  } = useGetUniUsersQuery({
    page,
    limit,
    search: search || undefined,
    role: roleFilter === "ALL" ? undefined : roleFilter,
  });

  const users = usersData?.data || [];
  const meta = usersData?.meta || { total: 0, totalPages: 1 };

  const [activeTab, setActiveTab] = useState<"list" | "single" | "bulk">(
    "list",
  );

  // Single Form State
  const [singleForm, setSingleForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    matricNumber: "",
    staffId: "",
  });

  // Bulk State
  const [bulkRole, setBulkRole] = useState("student");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSingleSubmit = async () => {
    try {
      if (!singleForm.firstName) return toast.error("First Name required");
      if (!singleForm.lastName) return toast.error("Last Name required");
      if (!singleForm.email) return toast.error("Email required");

      const payload: any = {
        ...singleForm,
        role: singleForm.role.toUpperCase(),
      };
      if (singleForm.role !== "student") delete payload.matricNumber;
      if (singleForm.role !== "lecturer") delete payload.staffId;

      const res = await createUser(payload).unwrap();
      const tempPassword =
        res?.temporaryPassword || res?.data?.temporaryPassword;
      toast.success(
        tempPassword
          ? `${singleForm.role} created! Temporary password: ${tempPassword}`
          : `${singleForm.role} account created successfully! Check email for password.`,
        { duration: 15000 },
      );
      setSingleForm({
        ...singleForm,
        firstName: "",
        lastName: "",
        email: "",
        matricNumber: "",
        staffId: "",
      });
      setActiveTab("list");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to create user");
    }
  };

  const handleDownloadTemplate = () => {
    const headers =
      bulkRole === "student"
        ? "firstName,lastName,email,matricNumber"
        : "firstName,lastName,email,staffId,title";
    const blob = new Blob([headers + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      bulkRole === "student"
        ? "student-import-template.csv"
        : "lecturer-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkSubmit = async () => {
    try {
      if (!selectedFile) return toast.error("Please select a CSV file first");

      const csvText = await selectedFile.text();
      const res =
        bulkRole === "student"
          ? await importStudents({ csvText }).unwrap()
          : await importLecturers({ csvText }).unwrap();

      const created = res.created ?? res.recordsProcessed ?? "many";
      const skipped = res.skipped != null ? ` (${res.skipped} skipped)` : "";
      toast.success(`Successfully created ${created} records${skipped}.`);

      if (Array.isArray(res.errors) && res.errors.length > 0) {
        res.errors.forEach((err: any) => {
          toast.error(`Row ${err.row}: ${err.reason}`);
        });
      }

      setSelectedFile(null);
      setActiveTab("list");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Bulk upload failed");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Monitor, search, and manage all users in your university.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "list" ? "default" : "outline"}
              onClick={() => setActiveTab("list")}
              className="rounded-xl gap-2 font-bold"
              style={
                activeTab === "list" ? { backgroundColor: primaryColor } : {}
              }
            >
              <Users className="w-4 h-4" />
              User List
            </Button>
            <Button
              variant={activeTab !== "list" ? "default" : "outline"}
              onClick={() => setActiveTab("single")}
              className="rounded-xl gap-2 font-bold"
              style={
                activeTab !== "list" ? { backgroundColor: primaryColor } : {}
              }
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Tabs for Add/Bulk */}
        {activeTab !== "list" && (
          <div className="flex gap-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab("single")}
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "single"
                  ? "border-[#641BC4] text-[#641BC4]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Add Single User
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "bulk"
                  ? "border-[#641BC4] text-[#641BC4]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Bulk Import Users
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === "list" ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-100 font-medium"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="min-w-[150px]">
                <Select
                  value={roleFilter}
                  onValueChange={(v) => {
                    setRoleFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="All Roles" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="LECTURER">Lecturers</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm transition-opacity duration-200"
              style={{ opacity: isFetchingUsers ? 0.6 : 1 }}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Identity
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td
                          colSpan={5}
                          className="px-6 py-6 h-12 bg-slate-50/20"
                        />
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-400 font-medium font-coolvetica"
                      >
                        No users found matching these criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u: any) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#641BC4]">
                              <UserCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors">
                                {u.firstName} {u.lastName}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`font-black tracking-widest text-[10px] uppercase border-none px-3 py-1 ${
                              u.role === "STUDENT"
                                ? "bg-blue-50 text-blue-600"
                                : u.role === "LECTURER"
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-purple-50 text-purple-600"
                            }`}
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-700 font-mono">
                            {u.role === "STUDENT"
                              ? u.studentProfile?.matricNumber ||
                                u.studentProfile?.studentId ||
                                "PENDING"
                              : u.role === "LECTURER"
                                ? u.lecturerProfile?.staffId || "PENDING"
                                : "ADMIN"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold">
                            ACTIVE
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            className="h-9 px-4 text-xs font-bold text-[#641BC4] hover:bg-purple-50 rounded-xl"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-500 font-medium">
                Showing{" "}
                <span className="text-slate-900 font-bold">{users.length}</span>{" "}
                of{" "}
                <span className="text-slate-900 font-bold">{meta.total}</span>{" "}
                users
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1 || isFetchingUsers}
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-100 shadow-sm"
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center px-4 font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-100">
                  {page} / {meta.totalPages}
                </div>
                <Button
                  disabled={page >= meta.totalPages || isFetchingUsers}
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-100 shadow-sm"
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : activeTab === "single" ? (
          <div className="max-w-2xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Role
                </label>
                <div className="mt-2 text-black">
                  <Select
                    value={singleForm.role}
                    onValueChange={(v) =>
                      setSingleForm({ ...singleForm, role: v })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {singleForm.role === "student" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Matric/Reg Number (Optional)
                  </label>
                  <Input
                    value={singleForm.matricNumber}
                    onChange={(e) =>
                      setSingleForm({
                        ...singleForm,
                        matricNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 21/B/1234"
                    className="mt-2 h-11 rounded-xl bg-white"
                  />
                </div>
              )}

              {singleForm.role === "lecturer" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Staff ID (Optional)
                  </label>
                  <Input
                    value={singleForm.staffId}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, staffId: e.target.value })
                    }
                    placeholder="e.g. STF/001"
                    className="mt-2 h-11 rounded-xl bg-white"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  First Name
                </label>
                <Input
                  value={singleForm.firstName}
                  onChange={(e) =>
                    setSingleForm({ ...singleForm, firstName: e.target.value })
                  }
                  placeholder="John"
                  className="mt-2 h-11 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Last Name
                </label>
                <Input
                  value={singleForm.lastName}
                  onChange={(e) =>
                    setSingleForm({ ...singleForm, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  className="mt-2 h-11 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <Input
                type="email"
                value={singleForm.email}
                onChange={(e) =>
                  setSingleForm({ ...singleForm, email: e.target.value })
                }
                placeholder="john.doe@example.edu"
                className="mt-2 h-11 rounded-xl bg-white"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSingleSubmit}
                disabled={isCreating}
                className="h-11 px-8 rounded-xl text-white gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <UserPlus className="w-4 h-4" />
                {isCreating ? "Adding..." : "Add User"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Target Role
              </label>
              <p className="text-xs text-slate-500 mb-2">
                All users in the CSV will receive this role.
              </p>
              <div className="max-w-xs text-black">
                <Select value={bulkRole} onValueChange={setBulkRole}>
                  <SelectTrigger className="h-11 rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-white text-center hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select CSV File"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Expected columns: firstName, lastName, email
                  {bulkRole === "student" && ", matricNumber"}
                </p>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Download Template CSV
              </button>
              <Button
                onClick={handleBulkSubmit}
                disabled={
                  isUploadingStudents || isUploadingLecturers || !selectedFile
                }
                className="h-11 px-8 rounded-xl text-white gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <FileUp className="w-4 h-4" />
                {isUploadingStudents || isUploadingLecturers
                  ? "Uploading..."
                  : "Upload & Process"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
