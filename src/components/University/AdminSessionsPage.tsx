"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  CalendarIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useActivateSessionMutation,
} from "@/reduxToolKit/uniFeatures/adminApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminSessionsPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const {
    data: sessionsResponse,
    isLoading,
    isFetching,
  } = useGetSessionsQuery();
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();
  const [activateSession, { isLoading: isActivating }] =
    useActivateSessionMutation();

  const sessions = Array.isArray(sessionsResponse?.data)
    ? sessionsResponse.data
    : Array.isArray(sessionsResponse)
      ? sessionsResponse
      : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    semester: 1,
    endDate: "",
  });

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Session name is required");
    try {
      await createSession(form).unwrap();
      toast.success("Academic session created successfully");
      setIsModalOpen(false);
      setForm({ name: "", semester: 1, endDate: "" });
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to create session");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateSession(id).unwrap();
      toast.success("Session activated successfully");
    } catch (e: any) {
      toast.error(
        e?.data?.message || e?.message || "Failed to activate session",
      );
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
              Academic Sessions
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Manage semesters and activate the current academic period.
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-11 px-6 rounded-xl text-white gap-2 transition-all shadow-md active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-none shadow-2xl p-0 overflow-hidden max-w-md">
              <div className="p-6 bg-[#641BC4] text-white">
                <DialogTitle className="text-xl font-bold font-coolvetica">
                  Add New Session
                </DialogTitle>
                <DialogDescription className="text-purple-100 mt-1">
                  Create a new academic period for your university.
                </DialogDescription>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Session Name
                  </Label>
                  <Input
                    placeholder="e.g. 2024/2025"
                    className="h-11 rounded-xl bg-slate-50 border-slate-100"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Semester
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={3}
                      className="h-11 rounded-xl bg-slate-50 border-slate-100"
                      value={form.semester}
                      onChange={(e) =>
                        setForm({ ...form, semester: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      className="h-11 rounded-xl bg-slate-50 border-slate-100"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="rounded-xl px-6 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 mb-4"
                style={{ borderTopColor: primaryColor }}
              />
              <p className="text-slate-500 font-medium font-coolvetica">
                Loading sessions...
              </p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium font-coolvetica">
              No academic sessions found.
            </p>
            <p className="text-slate-400 text-sm mt-1 font-coolvetica">
              Create your first session to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session: any) => {
              const isActive = session.status === "ACTIVE";
              return (
                <Card
                  key={session.id}
                  className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                    isActive
                      ? "border-purple-200 bg-purple-50/30 ring-4 ring-purple-50 shadow-lg"
                      : "border-slate-100 hover:border-slate-300 bg-white"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-[#641BC4] text-white hover:bg-[#641BC4] border-none px-3 py-1 flex items-center gap-1.5 font-bold shadow-md shadow-purple-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 pt-8">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <Calendar className="w-6 h-6 text-[#641BC4]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors font-coolvetica">
                        {session.data || "Unnamed Session"}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">
                        Semester {session.semester || "—"}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">
                          Ends:{" "}
                          {session.endDate
                            ? new Date(session.endDate).toLocaleDateString()
                            : "No deadline"}
                        </span>
                      </div>
                    </div>

                    {!isActive && (
                      <Button
                        onClick={() => handleActivate(session.id)}
                        disabled={isActivating}
                        variant="outline"
                        className="w-full h-11 rounded-xl border-slate-200 hover:border-[#641BC4] hover:text-[#641BC4] hover:bg-white transition-all font-bold"
                      >
                        Set as Active
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
