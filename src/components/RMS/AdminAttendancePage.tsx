"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAttendance, recordAttendance } from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Save } from "lucide-react";

export function AdminAttendancePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { attendance, loading, error, success } = useSelector((s: RootState) => s.admin);

  const [filter, setFilter] = useState({
    studentId: "",
    classId: "",
    session: "",
    term: "",
  });

  const [form, setForm] = useState({
    studentId: "",
    session: "",
    term: "",
    daysPresent: "",
    totalDays: "",
  });

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

  const list = useMemo(() => attendance || [], [attendance]);

  const load = async () => {
    try {
      if (!filter.session.trim() || !filter.term.trim())
        return toast.error("Session and term are required to fetch attendance");
      await dispatch(
        fetchAttendance({
          studentId: filter.studentId.trim() || undefined,
          classId: filter.classId.trim() || undefined,
          session: filter.session.trim(),
          term: filter.term.trim(),
        })
      ).unwrap();
    } catch (e: any) {
      toast.error(e || "Failed to fetch attendance");
    }
  };

  const save = async () => {
    try {
      if (!form.studentId.trim()) return toast.error("Student ID is required");
      if (!form.session.trim() || !form.term.trim()) return toast.error("Session and term are required");
      const daysPresent = Number(form.daysPresent);
      const totalDays = Number(form.totalDays);
      if (!Number.isFinite(daysPresent) || !Number.isFinite(totalDays)) {
        return toast.error("Days present and total days must be numbers");
      }
      await dispatch(
        recordAttendance({
          studentId: form.studentId.trim(),
          session: form.session.trim(),
          term: form.term.trim(),
          daysPresent,
          totalDays,
        })
      ).unwrap();
      setForm({ studentId: "", session: "", term: "", daysPresent: "", totalDays: "" });
    } catch (e: any) {
      toast.error(e || "Failed to record attendance");
    }
  };

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Attendance</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Record and view attendance (Guide section 13).
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-900">Record Attendance</p>
          <p className="text-sm text-slate-500 mt-1">POST /attendance</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Student ID</label>
              <Input
                value={form.studentId}
                onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="student-uuid"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Session</label>
              <Input
                value={form.session}
                onChange={(e) => setForm((p) => ({ ...p, session: e.target.value }))}
                placeholder="2024/2025"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Term</label>
              <Input
                value={form.term}
                onChange={(e) => setForm((p) => ({ ...p, term: e.target.value }))}
                placeholder="First Term"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Days Present</label>
              <Input
                value={form.daysPresent}
                onChange={(e) => setForm((p) => ({ ...p, daysPresent: e.target.value }))}
                placeholder="55"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Total Days</label>
              <Input
                value={form.totalDays}
                onChange={(e) => setForm((p) => ({ ...p, totalDays: e.target.value }))}
                placeholder="60"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={save}
            disabled={loading}
            className="mt-6 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Record Attendance"}
          </Button>
        </Card>

        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-900">View Attendance</p>
          <p className="text-sm text-slate-500 mt-1">GET /attendance</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Student ID (optional)</label>
              <Input
                value={filter.studentId}
                onChange={(e) => setFilter((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="student-uuid"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Class ID (optional)</label>
              <Input
                value={filter.classId}
                onChange={(e) => setFilter((p) => ({ ...p, classId: e.target.value }))}
                placeholder="class-uuid"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Session</label>
              <Input
                value={filter.session}
                onChange={(e) => setFilter((p) => ({ ...p, session: e.target.value }))}
                placeholder="2024/2025"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Term</label>
              <Input
                value={filter.term}
                onChange={(e) => setFilter((p) => ({ ...p, term: e.target.value }))}
                placeholder="First Term"
                className="mt-2 h-11 rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={load}
            disabled={loading}
            className="mt-6 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? "Loading..." : "Load Attendance"}
          </Button>

          <div className="mt-6 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                  <TableHead className="text-white font-bold h-14">Student</TableHead>
                  <TableHead className="text-white font-bold h-14 text-center">Present</TableHead>
                  <TableHead className="text-white font-bold h-14 text-center">Total</TableHead>
                  <TableHead className="text-white font-bold h-14 text-center">Session</TableHead>
                  <TableHead className="text-white font-bold h-14 text-center">Term</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r: any, idx: number) => (
                  <TableRow
                    key={r?.id || idx}
                    className={`border-none transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                    }`}
                  >
                    <TableCell className="font-semibold text-slate-900">{r?.studentId || "—"}</TableCell>
                    <TableCell className="text-center text-slate-600">{r?.daysPresent ?? "—"}</TableCell>
                    <TableCell className="text-center text-slate-600">{r?.totalDays ?? "—"}</TableCell>
                    <TableCell className="text-center text-slate-600">{r?.session ?? filter.session ?? "—"}</TableCell>
                    <TableCell className="text-center text-slate-600">{r?.term ?? filter.term ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {!loading && list.length === 0 && (
                  <TableRow className="border-none bg-white">
                    <TableCell colSpan={5} className="py-10 text-center text-slate-500 font-medium">
                      No attendance records loaded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

