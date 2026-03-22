"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  Clock,
  ShieldCheck,
  Power,
  RefreshCcw,
  AlertTriangle,
  Target,
  Plus,
  MapPin,
  ChevronDown,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetLectureAttendanceQuery,
  useToggleAttendanceWindowMutation,
  useGetLecturerGeofencesQuery,
  useCreateGeofenceMutation,
  type Geofence,
} from "@/reduxToolKit/uniFeatures/attendanceApi";
import { useGetLecturerCourseRosterQuery } from "@/reduxToolKit/uniFeatures/courseApi";
import { useRouter } from "next/navigation";
import { uniLecturerRoutes } from "./LecturerSideBar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { RadiusGeo } from "./HallRadiusMap";

// Map is client-only (Leaflet needs browser)
const HallRadiusMap = dynamic(() => import("./HallRadiusMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
      Loading map...
    </div>
  ),
});

const DEFAULT_PRIMARY = "#641BC4";

// ── Geofence picker modal ──────────────────────────────────────────────────────

type GeofenceMode = "hall" | "saved" | "new";

interface GeofencePickerProps {
  hallHasGeofence: boolean;
  onConfirm: (opts: {
    geofenceId?: string;
    newGeofence?: { name: string; lat: number; lng: number; radiusMeters: number };
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function GeofencePicker({
  hallHasGeofence,
  onConfirm,
  onCancel,
  isSaving,
}: GeofencePickerProps) {
  const [mode, setMode] = useState<GeofenceMode>(
    hallHasGeofence ? "hall" : "new",
  );
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [newGeo, setNewGeo] = useState<RadiusGeo | null>(null);

  const { data: geofencesResponse } = useGetLecturerGeofencesQuery();
  const geofences: Geofence[] = Array.isArray(geofencesResponse?.data)
    ? geofencesResponse.data
    : Array.isArray(geofencesResponse)
      ? geofencesResponse
      : [];

  const handleConfirm = () => {
    if (mode === "hall") {
      onConfirm({});
      return;
    }
    if (mode === "saved") {
      if (!selectedId) return toast.error("Select a geofence");
      onConfirm({ geofenceId: selectedId });
      return;
    }
    // new
    if (!newName.trim()) return toast.error("Geofence name is required");
    if (!newGeo) return toast.error("Place the centre on the map");
    onConfirm({
      newGeofence: {
        name: newName.trim(),
        lat: newGeo.lat,
        lng: newGeo.lng,
        radiusMeters: newGeo.radiusMeters,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl mx-4 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Set Attendance Geofence
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Choose how to define where students must be to check in.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                key: "hall" as GeofenceMode,
                label: "Hall Default",
                sub: "Use the hall's pre-set geofence",
                icon: MapPin,
                disabled: !hallHasGeofence,
              },
              {
                key: "saved" as GeofenceMode,
                label: "Saved Geofence",
                sub: "Pick from your reusable geofences",
                icon: Target,
                disabled: geofences.length === 0,
              },
              {
                key: "new" as GeofenceMode,
                label: "Create New",
                sub: "Draw a fresh geofence on the map",
                icon: Plus,
                disabled: false,
              },
            ].map(({ key, label, sub, icon: Icon, disabled }) => (
              <button
                key={key}
                disabled={disabled}
                onClick={() => setMode(key)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === key
                    ? "border-[#641BC4] bg-purple-50"
                    : disabled
                      ? "border-slate-100 opacity-40 cursor-not-allowed"
                      : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-2 ${mode === key ? "text-[#641BC4]" : "text-slate-400"}`}
                />
                <p
                  className={`font-black text-sm ${mode === key ? "text-[#641BC4]" : "text-slate-700"}`}
                >
                  {label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">
                  {sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Mode content */}
        <div className="px-6 py-5 space-y-4">
          {mode === "hall" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-emerald-900 text-sm">
                  Hall geofence will be used
                </p>
                <p className="text-emerald-700 text-xs mt-0.5">
                  Students must be within the hall's defined radius to check in.
                </p>
              </div>
            </div>
          )}

          {mode === "saved" && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">
                Select a saved geofence
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {geofences.map((gf) => (
                  <button
                    key={gf.id}
                    onClick={() => setSelectedId(gf.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                      selectedId === gf.id
                        ? "border-[#641BC4] bg-purple-50"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target
                        className={`w-4 h-4 flex-shrink-0 ${selectedId === gf.id ? "text-[#641BC4]" : "text-slate-400"}`}
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {gf.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {gf.radiusMeters} m radius · {gf.lat.toFixed(5)},{" "}
                          {gf.lng.toFixed(5)}
                        </p>
                      </div>
                    </div>
                    {selectedId === gf.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#641BC4] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "new" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  Geofence Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. LT2 Entrance, Block C Courtyard"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Set Location &amp; Radius <span className="text-red-500">*</span>
                </label>
                <HallRadiusMap value={newGeo} onChange={setNewGeo} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end sticky bottom-0 bg-white border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-11 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="h-11 px-8 rounded-xl text-white font-black gap-2"
            style={{ backgroundColor: DEFAULT_PRIMARY }}
          >
            <Power className="w-4 h-4" />
            {isSaving ? "Opening..." : "Open Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function LecturerAttendancePage({ lectureId }: { lectureId: string }) {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  // resolvedId is the actual Lecture.id — may differ from the URL param
  // (URL param can be a Timetable ID; backend auto-creates the Lecture on first activation)
  const [resolvedId, setResolvedId] = useState<string>(lectureId);

  // Local open/closed state — updated immediately from toggleWindow response
  const [localOpen, setLocalOpen] = useState<boolean | null>(null);

  const {
    data: attendanceResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetLectureAttendanceQuery(resolvedId, { skip: !resolvedId });

  const [toggleWindow, { isLoading: toggling }] =
    useToggleAttendanceWindowMutation();

  const [showGeofencePicker, setShowGeofencePicker] = useState(false);

  const lecture = attendanceResponse?.lecture;
  // Prefer local state (updated instantly) over server state to avoid stale UI
  const isWindowOpen = localOpen ?? lecture?.attendanceOpen ?? false;
  const courseId = lecture?.course?.id;
  const hall = lecture?.hall;

  const logs = Array.isArray(attendanceResponse?.attendance)
    ? attendanceResponse.attendance
    : [];

  // Course roster for enrollment status badges
  const { data: rosterData } = useGetLecturerCourseRosterQuery(courseId!, {
    skip: !courseId,
  });
  const enrolledIds = new Set<string>(
    (rosterData?.enrolled ?? []).map((e: any) => e.id),
  );

  // Opening window → show geofence picker if window is currently closed
  const handleOpenClick = () => {
    setShowGeofencePicker(true);
  };

  // Closing window → no picker needed, just close
  const handleCloseWindow = async () => {
    try {
      const res = await toggleWindow({ lectureId: resolvedId, open: false }).unwrap();
      if (res?.lecture?.id) setResolvedId(res.lecture.id);
      setLocalOpen(false);
      toast.success("Attendance window CLOSED");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to close window");
    }
  };

  const handleGeofenceConfirm = async (opts: {
    geofenceId?: string;
    newGeofence?: { name: string; lat: number; lng: number; radiusMeters: number };
  }) => {
    try {
      const res = await toggleWindow({ lectureId, open: true, ...opts }).unwrap();
      // Backend may have created a new Lecture from the timetable entry; capture its real ID
      if (res?.lecture?.id) setResolvedId(res.lecture.id);
      setLocalOpen(true);
      toast.success("Attendance window OPENED");
      setShowGeofencePicker(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to open window");
    }
  };

  const hallHasGeofence =
    hall?.geoLat != null && hall?.geoRadiusMeters != null;

  const unEnrolledCount = logs.filter(
    (l: any) => !enrolledIds.has(l.student?.id),
  ).length;

  return (
    <div className="w-full pb-10">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="space-y-6">
        {/* Hero / Control Center */}
        <div className="bg-[#641BC4] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(uniLecturerRoutes.TIMETABLE)}
                className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <Badge className="bg-white/20 text-white border-white/20 mb-2 font-bold tracking-widest uppercase text-[10px]">
                  Session Monitoring
                </Badge>
                <h1 className="text-3xl font-black font-coolvetica leading-tight">
                  {lecture?.name || "Attendance Manager"}
                </h1>
                <p className="text-purple-100/70 font-medium text-sm">
                  {lecture?.course?.code} — {lecture?.course?.title}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isWindowOpen ? (
                <Button
                  onClick={handleCloseWindow}
                  disabled={toggling}
                  className="h-14 px-8 rounded-2xl font-black text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                >
                  <Power className="mr-2 h-5 w-5" />
                  End Attendance Window
                </Button>
              ) : (
                <Button
                  onClick={handleOpenClick}
                  disabled={toggling}
                  className="h-14 px-8 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  <Power className="mr-2 h-5 w-5" />
                  Open Attendance Check-in
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 active:rotate-180 transition-all duration-500"
              >
                <RefreshCcw
                  className={cn("w-6 h-6", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                isWindowOpen
                  ? "bg-emerald-50 text-emerald-500 animate-pulse"
                  : "bg-red-50 text-red-500",
              )}
            >
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Status
              </p>
              <h3
                className={cn(
                  "text-xl font-black",
                  isWindowOpen ? "text-emerald-600" : "text-red-600",
                )}
              >
                {isWindowOpen ? "LIVE & OPEN" : "CLOSED"}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Check-ins
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {logs.length}{" "}
                <span className="text-sm text-slate-400">Present</span>
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Security
              </p>
              <h3 className="text-xl font-black text-slate-900 uppercase">
                Geofenced
              </h3>
              {lecture?.geofence && (
                <p className="text-[10px] text-slate-400 font-medium">
                  {lecture.geofence.name} · {lecture.geofence.radiusMeters} m
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Unenrolled alert */}
        {unEnrolledCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-900 text-sm">
                {unEnrolledCount} student
                {unEnrolledCount > 1 ? "s are" : " is"} attending without
                formal enrollment
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                They cannot sit exams until they enroll via Academic Registry.
              </p>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h2 className="font-black text-slate-900 font-coolvetica">
              Check-in History
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-time Feed
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <RefreshCcw className="w-10 h-10 text-slate-200 animate-spin" />
              <p className="text-slate-400 font-bold">Synchronizing Logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Student Information
                    </th>
                    <th className="px-5 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Exam Eligibility
                    </th>
                    <th className="px-5 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Check-in Time
                    </th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {logs.map((log: any, i: number) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-purple-100 text-purple-700 font-black">
                                {log.student.firstName[0]}
                                {log.student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors">
                                {log.student.firstName} {log.student.lastName}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                {log.student.studentProfile?.matricNumber ||
                                  "ID-PENDING"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          {enrolledIds.has(log.student.id) ? (
                            <Badge
                              variant="outline"
                              className="border-none bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase flex items-center gap-1 w-fit"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Enrolled
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border border-amber-200 bg-amber-50 text-amber-700 font-black text-[10px] uppercase flex items-center gap-1 w-fit"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Not Enrolled
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(log.timeStamp), "hh:mm a")}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-300 hover:text-red-500 rounded-xl transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {logs.length === 0 && (
                    <tr className="min-h-[300px]">
                      <td colSpan={4} className="py-32 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                          <Users className="w-16 h-16 text-slate-400 mb-4" />
                          <p className="font-black text-xl font-coolvetica uppercase tracking-tighter">
                            Awaiting check-ins
                          </p>
                          <p className="text-sm font-bold max-w-xs mt-1">
                            Students will appear here as they scan and verify
                            their geolocation.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Geofence picker modal */}
      {showGeofencePicker &&
        typeof document !== "undefined" &&
        createPortal(
          <GeofencePicker
            hallHasGeofence={hallHasGeofence}
            onConfirm={handleGeofenceConfirm}
            onCancel={() => setShowGeofencePicker(false)}
            isSaving={toggling}
          />,
          document.body,
        )}
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
