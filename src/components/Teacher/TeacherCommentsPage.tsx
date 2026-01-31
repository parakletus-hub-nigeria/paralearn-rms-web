"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { TeacherHeader } from "./TeacherHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addComment,
  fetchAcademicCurrent,
  fetchMyComments,
  type CommentType,
} from "@/reduxToolKit/teacher/teacherThunks";
import { clearTeacherError, clearTeacherSuccess } from "@/reduxToolKit/teacher/teacherSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TeacherCommentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { academicCurrent, comments, loading, error, success } = useSelector(
    (s: RootState) => s.teacher
  );

  const defaults = useMemo(
    () => ({
      session: academicCurrent?.session || "",
      term: academicCurrent?.term || "",
    }),
    [academicCurrent?.session, academicCurrent?.term]
  );

  const [form, setForm] = useState<{
    studentId: string;
    subjectId?: string;
    session: string;
    term: string;
    type: CommentType;
    comment: string;
  }>({
    studentId: "",
    subjectId: "",
    session: "",
    term: "",
    type: "subject_teacher",
    comment: "",
  });

  useEffect(() => {
    dispatch(fetchAcademicCurrent());
  }, [dispatch]);

  useEffect(() => {
    if (!defaults.session || !defaults.term) return;
    setForm((p) => ({
      ...p,
      session: p.session || defaults.session,
      term: p.term || defaults.term,
    }));
    dispatch(fetchMyComments({ session: defaults.session, term: defaults.term }));
  }, [dispatch, defaults.session, defaults.term]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTeacherError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearTeacherSuccess());
    }
  }, [error, success, dispatch]);

  const submit = async () => {
    try {
      if (!form.studentId.trim()) return toast.error("Student ID is required");
      if (!form.session.trim() || !form.term.trim())
        return toast.error("Session and term are required");
      if (!form.comment.trim()) return toast.error("Comment is required");

      await dispatch(
        addComment({
          studentId: form.studentId.trim(),
          subjectId: form.subjectId?.trim() ? form.subjectId.trim() : undefined,
          session: form.session.trim(),
          term: form.term.trim(),
          type: form.type,
          comment: form.comment.trim(),
        })
      ).unwrap();

      // Refresh list
      await dispatch(fetchMyComments({ session: form.session, term: form.term })).unwrap();

      setForm((p) => ({ ...p, studentId: "", subjectId: "", comment: "" }));
    } catch (e: any) {
      toast.error(e || "Failed to add comment");
    }
  };

  return (
    <div className="w-full">
      <TeacherHeader />

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Comments</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Add meaningful remarks that will appear on report cards.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-900">Add Comment</p>
          <p className="text-sm text-slate-500 mt-1">Sends directly to `POST /comments`.</p>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">Student ID</label>
                <Input
                  value={form.studentId}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                  placeholder="e.g. student-uuid"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Subject ID (optional)
                </label>
                <Input
                  value={form.subjectId || ""}
                  onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                  placeholder="e.g. subject-uuid"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">Session</label>
                <Input
                  value={form.session}
                  onChange={(e) => setForm((p) => ({ ...p, session: e.target.value }))}
                  placeholder="e.g. 2024/2025"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Term</label>
                <Input
                  value={form.term}
                  onChange={(e) => setForm((p) => ({ ...p, term: e.target.value }))}
                  placeholder="e.g. First Term"
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <div className="mt-2">
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v as CommentType }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="subject_teacher">Subject Teacher</SelectItem>
                    <SelectItem value="class_teacher">Class Teacher</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Comment</label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                placeholder="Write a clear, helpful remark..."
                className="mt-2 min-h-[120px] rounded-xl"
              />
            </div>

            <Button
              onClick={submit}
              disabled={loading}
              className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
            >
              {loading ? "Saving..." : "Add Comment"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-900">My Comments</p>
          <p className="text-sm text-slate-500 mt-1">
            Loaded from `GET /comments/my-comments`.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                  <TableHead className="text-white font-bold h-14">Student</TableHead>
                  <TableHead className="text-white font-bold h-14 text-center">Type</TableHead>
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
                    <TableCell className="font-semibold text-slate-900">
                      {c?.studentId || "—"}
                    </TableCell>
                    <TableCell className="text-center text-slate-600">{c?.type || "—"}</TableCell>
                    <TableCell className="text-slate-700">{c?.comment || "—"}</TableCell>
                  </TableRow>
                ))}
                {!loading && comments.length === 0 && (
                  <TableRow className="border-none bg-white">
                    <TableCell colSpan={3} className="py-10 text-center text-slate-500 font-medium">
                      No comments yet for this session/term.
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

