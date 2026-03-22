"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetFacultiesQuery,
  useCreateFacultyMutation,
} from "@/reduxToolKit/uniFeatures/facultyApi";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminFacultiesPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY; // Customize from tenantInfo if available

  const {
    data: facultiesResponse,
    isLoading,
    isFetching,
  } = useGetFacultiesQuery();
  const [createFaculty, { isLoading: isCreating }] = useCreateFacultyMutation();

  const faculties = Array.isArray(facultiesResponse?.data)
    ? facultiesResponse.data
    : Array.isArray(facultiesResponse)
      ? facultiesResponse
      : [];

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
  });

  // Filter faculties
  const filtered = faculties.filter((f: any) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (f.name || "").toLowerCase().includes(term) ||
      (f.subtitle || "").toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedFaculties = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleCreateFaculty = async () => {
    try {
      if (!form.name.trim()) return toast.error("Faculty name is required");

      await createFaculty({
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || undefined,
      }).unwrap();

      toast.success("Faculty created successfully");
      setForm({ name: "", subtitle: "" });
      setShowCreateModal(false);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to create faculty");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              Faculties Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Create and manage university faculties/schools.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Faculty
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by faculty name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50"
            />
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
              <p className="text-slate-500 font-medium">Loading faculties...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Faculty Name
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Subtitle / Alternate Name
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Total Departments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFaculties.map((faculty: any, idx: number) => (
                    <tr
                      key={faculty.id || idx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <span className="font-semibold text-slate-900">
                          {faculty.name}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-sm">
                        {faculty.subtitle || "—"}
                      </td>
                      <td className="py-4 px-3 text-slate-600">
                        {faculty._count?.departments || 0}
                      </td>
                    </tr>
                  ))}
                  {paginatedFaculties.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-16 text-center text-slate-500 font-medium"
                      >
                        No faculties found. Create your first faculty to get
                        started!
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

      {/* Create Faculty Modal */}
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
                    Create Faculty
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Add a new faculty/school
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
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Faculty Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Faculty of Engineering"
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Subtitle (Optional)
                  </label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subtitle: e.target.value }))
                    }
                    placeholder="e.g. School of Applied Sciences"
                    className="mt-2 h-11 rounded-xl"
                  />
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
                  onClick={handleCreateFaculty}
                  disabled={isCreating}
                  className="h-11 px-6 rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isCreating ? "Creating..." : "Create Faculty"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
