"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchClassStudents,
  uploadOfflineScores,
  updateTeacherAssessment,
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
import { ArrowLeft, Upload, Edit, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TeacherAssessmentDetailPage() {
  const params = useParams<{ assessmentId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAssessment, submissions, scores, classStudents, loading, error, success } = useSelector(
    (s: RootState) => s.teacher
  );
  const [file, setFile] = useState<File | null>(null);
  const [manualScores, setManualScores] = useState<Record<string, { marks: string; comment: string }>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    startsAt: "",
    endsAt: "",
    instructions: "",
  });

  const assessmentId = params?.assessmentId as string;

  useEffect(() => {
    if (!assessmentId) return;
    dispatch(fetchAssessmentDetail(assessmentId));
    dispatch(fetchAssessmentSubmissions(assessmentId));
    dispatch(fetchScoresByAssessmentTeacher(assessmentId));
  }, [dispatch, assessmentId]);

  useEffect(() => {
    if (selectedAssessment?.classId) {
      dispatch(fetchClassStudents(selectedAssessment.classId));
    }
    if (selectedAssessment) {
      setEditForm({
        startsAt: selectedAssessment.startsAt ? new Date(selectedAssessment.startsAt).toISOString().slice(0, 16) : "",
        endsAt: selectedAssessment.endsAt ? new Date(selectedAssessment.endsAt).toISOString().slice(0, 16) : "",
        instructions: selectedAssessment.instructions || "",
      });
    }
  }, [dispatch, selectedAssessment]);

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

  const handleManualSave = async () => {
    if (!assessmentId) return;
    const scoresToUpload = Object.entries(manualScores).map(([studentId, data]) => ({
      studentId,
      marksAwarded: Number(data.marks),
      maxMarks: selectedAssessment?.totalMarks || 100,
      comment: data.comment,
    }));
    
    if (scoresToUpload.length === 0) return toast.error("No scores entered");
    
    await dispatch(uploadOfflineScores({ assessmentId, scores: scoresToUpload })).unwrap();
    dispatch(fetchScoresByAssessmentTeacher(assessmentId));
    setManualScores({});
  };

  const handleUpdateAssessment = async () => {
    if (!assessmentId) return;
    await dispatch(updateTeacherAssessment({
      id: assessmentId,
      data: {
        startsAt: editForm.startsAt ? new Date(editForm.startsAt).toISOString() : undefined,
        endsAt: editForm.endsAt ? new Date(editForm.endsAt).toISOString() : undefined,
        instructions: editForm.instructions
      }
    })).unwrap();
    setShowEditModal(false);
    dispatch(fetchAssessmentDetail(assessmentId));
  };

  // Merge students with existing scores for the manual entry table
  const manualEntryData = useMemo(() => {
    return classStudents.map((student: any) => {
      const existingScore = scores.find((s: any) => s.studentId === student.id || s.student?.id === student.id);
      return {
        student,
        currentScore: existingScore?.marksAwarded ?? existingScore?.score,
        currentComment: existingScore?.comment
      };
    });
  }, [classStudents, scores]);

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
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="h-11 rounded-xl border-slate-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
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
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-auto inline-flex mb-4">
                  <TabsTrigger value="excel" className="rounded-lg px-4">Excel Upload</TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-lg px-4">Manual Entry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="excel">
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
                      <p className="text-lg font-bold text-slate-900">Information</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Use the "Manual Entry" tab to grade students directly in the browser. This is ideal for offline assessments or quick adjustments.
                      </p>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                   <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                     <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <p className="text-sm font-semibold text-slate-600">
                          Class Students: {classStudents.length}
                        </p>
                        <Button 
                          onClick={handleManualSave}
                          disabled={Object.keys(manualScores).length === 0 || loading}
                          className="bg-[#641BC4] text-white hover:bg-[#641BC4]/90 h-9 rounded-lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                     </div>
                     <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-[30%]">Student Name</TableHead>
                          <TableHead className="w-[15%] text-center">Max Marks</TableHead>
                          <TableHead className="w-[20%] text-center">Marks Awarded</TableHead>
                          <TableHead className="w-[35%]">Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manualEntryData.map(({ student, currentScore, currentComment }) => {
                          const studentId = student.id;
                          const edited = manualScores[studentId];
                          const scoreValue = edited?.marks !== undefined ? edited.marks : (currentScore ?? "");
                          const commentValue = edited?.comment !== undefined ? edited.comment : (currentComment ?? "");
                          
                          return (
                            <TableRow key={studentId}>
                              <TableCell className="font-medium">
                                {student.firstName} {student.lastName}
                                <span className="block text-xs text-slate-400">{student.matricNumber}</span>
                              </TableCell>
                              <TableCell className="text-center text-slate-500">
                                {selectedAssessment?.totalMarks || 100}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={scoreValue}
                                  onChange={(e) => setManualScores(prev => ({
                                    ...prev,
                                    [studentId]: { marks: e.target.value, comment: commentValue }
                                  }))}
                                  className="mx-auto w-24 h-9 text-center"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={commentValue}
                                  onChange={(e) => setManualScores(prev => ({
                                    ...prev,
                                    [studentId]: { marks: scoreValue, comment: e.target.value }
                                  }))}
                                  placeholder="Optional remark..."
                                  className="h-9"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {manualEntryData.length === 0 && (
                          <TableRow>
                             <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                               No students found in this class.
                             </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                     </Table>
                   </div>
                </TabsContent>
              </Tabs>
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
                          {s?.studentId || s?.student?.firstName || s?.student?.id || "—"}
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

      {/* Edit Assessment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
             onClick={() => setShowEditModal(false)}
           />
           <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-900">Edit Assessment</h3>
                 <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-semibold text-slate-700">Start Date</label>
                     <Input
                       type="datetime-local"
                       value={editForm.startsAt}
                       onChange={(e) => setEditForm(p => ({ ...p, startsAt: e.target.value }))}
                       className="mt-1 h-10"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-semibold text-slate-700">End Date</label>
                     <Input
                       type="datetime-local"
                       value={editForm.endsAt}
                       onChange={(e) => setEditForm(p => ({ ...p, endsAt: e.target.value }))}
                       className="mt-1 h-10"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-slate-700">Instructions</label>
                   <textarea
                      value={editForm.instructions}
                      onChange={(e) => setEditForm(p => ({ ...p, instructions: e.target.value }))}
                      className="mt-1 w-full p-2 border border-slate-200 rounded-lg text-sm"
                      rows={3}
                   />
                 </div>
                 <Button onClick={handleUpdateAssessment} disabled={loading} className="w-full bg-[#641BC4] text-white h-11 rounded-xl">
                   {loading ? "Saving..." : "Save Changes"}
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

