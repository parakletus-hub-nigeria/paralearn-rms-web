"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { addCommentAdmin, bulkAddComments, fetchStudentComments } from "@/reduxToolKit/admin/adminThunks";
import { clearAdminError, clearAdminSuccess } from "@/reduxToolKit/admin/adminSlice";
import { Header } from "@/components/RMS/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
import { generateTemplate } from "@/lib/templates";


export function AdminCommentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, error, success } = useSelector((s: RootState) => s.admin);

  const [studentQuery, setStudentQuery] = useState({ studentId: "", session: "", term: "" });
  const [single, setSingle] = useState({
    studentId: "",
    subjectId: "",
    session: "",
    term: "",
    type: "subject_teacher",
    comment: "",
  });
  const [bulk, setBulk] = useState({
    studentIds: "",
    session: "",
    term: "",
    type: "class_teacher",
    comment: "",
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

  const load = async () => {
    try {
      if (!studentQuery.studentId.trim()) return toast.error("Student ID is required");
      if (!studentQuery.session.trim() || !studentQuery.term.trim())
        return toast.error("Session and term are required");
      await dispatch(
        fetchStudentComments({
          studentId: studentQuery.studentId.trim(),
          session: studentQuery.session.trim(),
          term: studentQuery.term.trim(),
        })
      ).unwrap();
    } catch (e: any) {
      toast.error(e || "Failed to fetch comments");
    }
  };

  const addOne = async () => {
    try {
      if (!single.studentId.trim()) return toast.error("Student ID is required");
      if (!single.session.trim() || !single.term.trim()) return toast.error("Session and term are required");
      if (!single.comment.trim()) return toast.error("Comment is required");
      await dispatch(
        addCommentAdmin({
          studentId: single.studentId.trim(),
          subjectId: single.subjectId.trim() || undefined,
          session: single.session.trim(),
          term: single.term.trim(),
          type: single.type,
          comment: single.comment.trim(),
        })
      ).unwrap();
      setSingle((p) => ({ ...p, comment: "" }));
    } catch (e: any) {
      toast.error(e || "Failed to add comment");
    }
  };

  const addBulk = async () => {
    try {
      const ids = bulk.studentIds
        .split(/[,\n]/)
        .map((x) => x.trim())
        .filter(Boolean);
      if (ids.length === 0) return toast.error("Student IDs required");
      if (!bulk.session.trim() || !bulk.term.trim()) return toast.error("Session and term are required");
      if (!bulk.comment.trim()) return toast.error("Comment is required");
      await dispatch(
        bulkAddComments({
          studentIds: ids,
          session: bulk.session.trim(),
          term: bulk.term.trim(),
          type: bulk.type,
          comment: bulk.comment.trim(),
        })
      ).unwrap();
    } catch (e: any) {
      toast.error(e || "Failed to bulk add comments");
    }
  };

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Comments</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Add and review comments (Guide section 12).
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-900">Fetch Student Comments</p>
          <p className="text-sm text-slate-500 mt-1">GET /comments/student/:studentId</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Input
                value={studentQuery.studentId}
                onChange={(e) => setStudentQuery((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="student-uuid"
                className="h-11 rounded-xl"
              />
            </div>
            <Input
              value={studentQuery.session}
              onChange={(e) => setStudentQuery((p) => ({ ...p, session: e.target.value }))}
              placeholder="Session"
              className="h-11 rounded-xl"
            />
            <Input
              value={studentQuery.term}
              onChange={(e) => setStudentQuery((p) => ({ ...p, term: e.target.value }))}
              placeholder="Term"
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            onClick={load}
            disabled={loading}
            className="mt-4 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
          >
            {loading ? "Loading..." : "Load"}
          </Button>

          <div className="mt-6 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                  <TableHead className="text-white font-bold h-14">Type</TableHead>
                  <TableHead className="text-white font-bold h-14">Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((c: any, idx: number) => (
                  <TableRow
                    key={c?.id || idx}
                    className={`border-none transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                    }`}
                  >
                    <TableCell className="font-semibold text-slate-900">{c?.type || "—"}</TableCell>
                    <TableCell className="text-slate-700">{c?.comment || "—"}</TableCell>
                  </TableRow>
                ))}
                {!loading && comments.length === 0 && (
                  <TableRow className="border-none bg-white">
                    <TableCell colSpan={2} className="py-10 text-center text-slate-500 font-medium">
                      No comments loaded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
            <p className="text-lg font-bold text-slate-900">Add Comment</p>
            <p className="text-sm text-slate-500 mt-1">POST /comments</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={single.studentId}
                onChange={(e) => setSingle((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="Student ID"
                className="h-11 rounded-xl"
              />
              <Input
                value={single.subjectId}
                onChange={(e) => setSingle((p) => ({ ...p, subjectId: e.target.value }))}
                placeholder="Subject ID (optional)"
                className="h-11 rounded-xl"
              />
              <Input
                value={single.session}
                onChange={(e) => setSingle((p) => ({ ...p, session: e.target.value }))}
                placeholder="Session"
                className="h-11 rounded-xl"
              />
              <Input
                value={single.term}
                onChange={(e) => setSingle((p) => ({ ...p, term: e.target.value }))}
                placeholder="Term"
                className="h-11 rounded-xl"
              />
              <div className="md:col-span-2">
                <select
                  value={single.type}
                  onChange={(e) => setSingle((p) => ({ ...p, type: e.target.value }))}
                  className="h-11 rounded-xl border border-slate-200 px-3 bg-white w-full"
                >
                  <option value="subject_teacher">subject_teacher</option>
                  <option value="class_teacher">class_teacher</option>
                  <option value="principal">principal</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Textarea
                  value={single.comment}
                  onChange={(e) => setSingle((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Comment"
                  className="min-h-[120px] rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  onClick={addOne}
                  disabled={loading}
                  className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
            <p className="text-lg font-bold text-slate-900">Bulk Add Comments</p>
            <p className="text-sm text-slate-500 mt-1">POST /comments/bulk</p>
            
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 h-10 border-slate-200 text-slate-700"
                onClick={() => generateTemplate("comments")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <div className="relative flex-1">
                 <input
                    type="file" 
                    accept=".csv,.xlsx"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        toast.info("File selected. Client-side parsing coming soon.");
                        // TODO: Parse CSV and fill text area or call upload endpoint
                      }
                    }}
                 />
                 <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                 </Button>
              </div>
            </div>

            <div className="mt-4 space-y-3">

              <Textarea
                value={bulk.studentIds}
                onChange={(e) => setBulk((p) => ({ ...p, studentIds: e.target.value }))}
                placeholder="Student IDs (comma/newline separated)"
                className="min-h-[100px] rounded-xl"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={bulk.session}
                  onChange={(e) => setBulk((p) => ({ ...p, session: e.target.value }))}
                  placeholder="Session"
                  className="h-11 rounded-xl"
                />
                <Input
                  value={bulk.term}
                  onChange={(e) => setBulk((p) => ({ ...p, term: e.target.value }))}
                  placeholder="Term"
                  className="h-11 rounded-xl"
                />
              </div>
              <select
                value={bulk.type}
                onChange={(e) => setBulk((p) => ({ ...p, type: e.target.value }))}
                className="h-11 rounded-xl border border-slate-200 px-3 bg-white w-full"
              >
                <option value="class_teacher">class_teacher</option>
                <option value="subject_teacher">subject_teacher</option>
                <option value="principal">principal</option>
              </select>
              <Textarea
                value={bulk.comment}
                onChange={(e) => setBulk((p) => ({ ...p, comment: e.target.value }))}
                placeholder="Comment"
                className="min-h-[100px] rounded-xl"
              />
              <Button
                onClick={addBulk}
                disabled={loading}
                className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
              >
                Bulk Add
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

