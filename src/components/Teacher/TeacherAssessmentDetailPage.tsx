"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  bulkUploadScoresExcel,
  fetchAssessmentDetail,
  fetchAssessmentSubmissions,
  fetchScoresByAssessmentTeacher,
  publishAssessment,
} from "@/reduxToolKit/teacher/teacherThunks";
import { clearTeacherError, clearTeacherSuccess } from "@/reduxToolKit/teacher/teacherSlice";
import { TeacherHeader } from "./TeacherHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload } from "lucide-react";

export function TeacherAssessmentDetailPage() {
  const params = useParams<{ assessmentId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAssessment, submissions, scores, loading, error, success } = useSelector(
    (s: RootState) => s.teacher
  );
  const [file, setFile] = useState<File | null>(null);

  const assessmentId = params?.assessmentId as string;

  useEffect(() => {
    if (!assessmentId) return;
    dispatch(fetchAssessmentDetail(assessmentId));
    dispatch(fetchAssessmentSubmissions(assessmentId));
    dispatch(fetchScoresByAssessmentTeacher(assessmentId));
  }, [dispatch, assessmentId]);

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

  const statusLabel = useMemo(() => {
    const s = selectedAssessment?.status;
    if (!s) return "Unknown";
    if (s === "not_started") return "Not started";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [selectedAssessment?.status]);

  const handlePublish = async (publish: boolean) => {
    if (!assessmentId) return;
    await dispatch(publishAssessment({ assessmentId, publish })).unwrap();
  };

  const handleBulkUpload = async () => {
    if (!assessmentId) return toast.error("Missing assessment id");
    if (!file) return toast.error("Please select an Excel file first");
    await dispatch(bulkUploadScoresExcel({ assessmentId, file })).unwrap();
    setFile(null);
    dispatch(fetchAssessmentSubmissions(assessmentId));
    dispatch(fetchScoresByAssessmentTeacher(assessmentId));
  };

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-11 rounded-xl border-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedAssessment?.title || "Assessment"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-xl bg-purple-50 text-[#641BC4]">Session: {selectedAssessment?.session || "—"}</Badge>
              <Badge className="rounded-xl bg-slate-100 text-slate-700">Term: {selectedAssessment?.term || "—"}</Badge>
              <Badge
                className={`rounded-xl ${
                  selectedAssessment?.status === "started"
                    ? "bg-emerald-50 text-emerald-700"
                    : selectedAssessment?.status === "ended"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-purple-50 text-[#641BC4]"
                }`}
              >
                {statusLabel}
              </Badge>
              {typeof selectedAssessment?.isOnline === "boolean" && (
                <Badge className="rounded-xl bg-orange-50 text-orange-700">
                  {selectedAssessment.isOnline ? "Online" : "Offline"}
                </Badge>
              )}
            </div>
            {selectedAssessment?.instructions && (
              <p className="text-slate-500 text-sm max-w-2xl">{selectedAssessment.instructions}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handlePublish(true)}
              disabled={loading}
              className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl"
            >
              Publish
            </Button>
            <Button
              onClick={() => handlePublish(false)}
              disabled={loading}
              variant="outline"
              className="h-11 rounded-xl border-slate-200"
            >
              Unpublish
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="submissions">
            <TabsList className="grid grid-cols-3 md:w-[560px] rounded-xl">
              <TabsTrigger value="submissions" className="rounded-lg">
                Submissions
              </TabsTrigger>
              <TabsTrigger value="scores" className="rounded-lg">
                Upload Scores
              </TabsTrigger>
              <TabsTrigger value="score_list" className="rounded-lg">
                Scores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="mt-6">
              <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                      <TableHead className="text-white font-bold h-14">Submission</TableHead>
                      <TableHead className="text-white font-bold h-14 text-center">Student</TableHead>
                      <TableHead className="text-white font-bold h-14 text-center">Score</TableHead>
                      <TableHead className="text-white font-bold h-14 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s: any, idx: number) => (
                      <TableRow
                        key={s?.id || idx}
                        className={`border-none transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                        }`}
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {s?.id || "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {s?.studentId || s?.student?.id || s?.student?.studentId || "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {s?.score ?? s?.marksAwarded ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="rounded-xl bg-slate-100 text-slate-700">
                            {s?.status || (s?.graded ? "Graded" : "Pending")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loading && submissions.length === 0 && (
                      <TableRow className="border-none bg-white">
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-slate-500 font-medium"
                        >
                          No submissions yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
                  <p className="text-lg font-bold text-slate-900">Bulk Upload (Excel)</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload an Excel result sheet using the PRD format.
                  </p>
                  <div className="mt-6 space-y-3">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm"
                    />
                    <Button
                      onClick={handleBulkUpload}
                      disabled={loading || !file}
                      className="bg-[#641BC4] hover:bg-[#641BC4]/90 text-white font-semibold h-11 rounded-xl w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? "Uploading..." : "Upload Scores"}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
                  <p className="text-lg font-bold text-slate-900">Tip</p>
                  <p className="text-sm text-slate-500 mt-2">
                    For offline assessments, you can also upload scores via:
                    <span className="font-semibold text-slate-700"> POST /assessments/:assessmentId/scores</span>.
                  </p>
                  <div className="mt-4 text-sm text-slate-500">
                    If you want, I can also add a “manual score entry” table UI for quick edits.
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="score_list" className="mt-6">
              <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                      <TableHead className="text-white font-bold h-14">Student</TableHead>
                      <TableHead className="text-white font-bold h-14 text-center">Marks</TableHead>
                      <TableHead className="text-white font-bold h-14 text-center">Max</TableHead>
                      <TableHead className="text-white font-bold h-14">Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((s: any, idx: number) => (
                      <TableRow
                        key={s?.id || idx}
                        className={`border-none transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                        }`}
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {s?.studentId || s?.student?.id || "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {s?.marksAwarded ?? s?.score ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">{s?.maxMarks ?? "—"}</TableCell>
                        <TableCell className="text-slate-600">{s?.comment || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && scores.length === 0 && (
                      <TableRow className="border-none bg-white">
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-slate-500 font-medium"
                        >
                          No scores found for this assessment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

