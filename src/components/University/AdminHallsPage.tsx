"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, X, Pencil, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetHallsQuery,
  useCreateHallMutation,
  useUpdateHallMutation,
  useDeleteHallMutation,
} from "@/reduxToolKit/uniFeatures/hallsApi";
import type { Hall } from "@/reduxToolKit/uniFeatures/hallsApi";

const DEFAULT_PRIMARY = "#641BC4";

interface HallForm {
  name: string;
  capacity: string;
  building: string;
}

const emptyForm: HallForm = {
  name: "",
  capacity: "",
  building: "",
};

export function AdminHallsPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  const { data: hallsResponse, isLoading, isFetching } = useGetHallsQuery();
  const [createHall, { isLoading: isCreating }] = useCreateHallMutation();
  const [updateHall, { isLoading: isUpdating }] = useUpdateHallMutation();
  const [deleteHall, { isLoading: isDeleting }] = useDeleteHallMutation();

  const halls: Hall[] = Array.isArray(hallsResponse?.data)
    ? hallsResponse.data
    : Array.isArray(hallsResponse)
      ? hallsResponse
      : [];

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [deletingHall, setDeletingHall] = useState<Hall | null>(null);

  const [form, setForm] = useState<HallForm>(emptyForm);

  // Filter
  const filtered = halls.filter((h) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      h.name.toLowerCase().includes(term) ||
      (h.building || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const openCreate = () => {
    setForm(emptyForm);
    setShowCreateModal(true);
  };

  const openEdit = (hall: Hall) => {
    setEditingHall(hall);
    setForm({
      name: hall.name,
      capacity: hall.capacity != null ? String(hall.capacity) : "",
      building: hall.building ?? "",
    });
    setShowEditModal(true);
  };

  const openDelete = (hall: Hall) => {
    setDeletingHall(hall);
    setShowDeleteModal(true);
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    ...(form.capacity ? { capacity: Number(form.capacity) } : {}),
    ...(form.building.trim() ? { building: form.building.trim() } : {}),
  });

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Hall name is required");
    try {
      await createHall(buildPayload()).unwrap();
      toast.success("Hall created successfully");
      setShowCreateModal(false);
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to create hall");
    }
  };

  const handleUpdate = async () => {
    if (!editingHall) return;
    if (!form.name.trim()) return toast.error("Hall name is required");
    try {
      await updateHall({ id: editingHall.id, ...buildPayload() }).unwrap();
      toast.success("Hall updated successfully");
      setShowEditModal(false);
      setEditingHall(null);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to update hall");
    }
  };

  const handleDelete = async () => {
    if (!deletingHall) return;
    try {
      await deleteHall(deletingHall.id).unwrap();
      toast.success("Hall deleted");
      setShowDeleteModal(false);
      setDeletingHall(null);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to delete hall");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              Lecture Halls
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Manage lecture halls. Lecturers set attendance geofences when they open each session.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="h-11 rounded-xl gap-2 text-white"
            style={{ backgroundColor: DEFAULT_PRIMARY }}
          >
            <Plus className="w-4 h-4" />
            Add Hall
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search halls or buildings..."
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
                style={{ borderTopColor: DEFAULT_PRIMARY }}
              />
              <p className="text-slate-500 font-medium">Loading halls...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                      Hall Name
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Building
                    </th>
                    <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                      Capacity
                    </th>
                    <th className="py-4 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((hall, idx) => (
                    <tr
                      key={hall.id || idx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-5 font-semibold text-slate-900">
                        {hall.name}
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-sm">
                        {hall.building || (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-sm">
                        {hall.capacity != null ? (
                          hall.capacity
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(hall)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            title="Edit hall"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDelete(hall)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete hall"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-16 text-center text-slate-500 font-medium"
                      >
                        No halls found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

      {/* ── Create Modal ──────────────────────────────────── */}
      {showCreateModal &&
        typeof document !== "undefined" &&
        createPortal(
          <HallModal
            title="Add Hall"
            subtitle="Fill in the details and optionally set a geofence radius on the map."
            form={form}
            setForm={setForm}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreate}
            isSubmitting={isCreating}
            submitLabel="Create Hall"
          />,
          document.body,
        )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {showEditModal &&
        editingHall &&
        typeof document !== "undefined" &&
        createPortal(
          <HallModal
            title="Edit Hall"
            subtitle={`Editing "${editingHall.name}"`}
            form={form}
            setForm={setForm}
            onClose={() => {
              setShowEditModal(false);
              setEditingHall(null);
            }}
            onSubmit={handleUpdate}
            isSubmitting={isUpdating}
            submitLabel="Save Changes"
          />,
          document.body,
        )}

      {/* ── Delete Confirm Modal ──────────────────────────── */}
      {showDeleteModal &&
        deletingHall &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
              <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Delete hall?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">
                    {deletingHall.name}
                  </span>{" "}
                  will be permanently removed. This cannot be undone.
                </p>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="h-10 px-5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-10 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Shared Create/Edit Modal ───────────────────────────────────────────────────

interface HallModalProps {
  title: string;
  subtitle: string;
  form: HallForm;
  setForm: React.Dispatch<React.SetStateAction<HallForm>>;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

function HallModal({
  title,
  subtitle,
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
}: HallModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 mt-0.5"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Hall Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. LT1 — Main Lecture Theatre"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Building{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Input
                value={form.building}
                onChange={(e) =>
                  setForm((p) => ({ ...p, building: e.target.value }))
                }
                placeholder="e.g. Engineering Block A"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Capacity{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
                placeholder="e.g. 300"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl text-white"
            style={{ backgroundColor: DEFAULT_PRIMARY }}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
