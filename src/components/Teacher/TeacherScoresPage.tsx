"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchTeacherClasses,
  fetchMyAssessments,
  fetchScoresByAssessmentTeacher,
  uploadOfflineScores,
  bulkUploadScoresExcel,
  fetchClassStudents,
  fetchClassSubjects,
} from "@/reduxToolKit/teacher/teacherThunks";
import { TeacherHeader } from "./TeacherHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Upload,
  Save,
  FileSpreadsheet,
  MoreVertical,
  TrendingUp,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import { generateTemplate } from "@/lib/templates";


const DEFAULT_PRIMARY = "#641BC4";

export function TeacherScoresPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses, assessments, loading } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [search, setSearch] = useState("");

  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [existingScores, setExistingScores] = useState<any[]>([]);
  const [editedScores, setEditedScores] = useState<Map<string, { ca1: string; ca2: string; exam: string }>>(new Map());

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [saving, setSaving] = useState(false);

  // Extract unique classes
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, any>();
    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId || item.id;
      const className = item.class?.name || item.className || item.name;
      const studentCount = item.class?.studentCount || item.class?.enrollmentCount || 
                          item.studentCount || item.enrollmentCount || 0;
      if (classId && className && !classMap.has(classId)) {
        classMap.set(classId, { id: classId, name: className, studentCount });
      }
    });
    return Array.from(classMap.values());
  }, [teacherClasses]);

  // Fetch teacher's classes on mount
  useEffect(() => {
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
    dispatch(fetchMyAssessments());
  }, [dispatch, user]);

  // Load subjects when class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    setLoadingSubjects(true);
    dispatch(fetchClassSubjects(selectedClassId))
      .unwrap()
      .then((data) => setSubjects(data || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [dispatch, selectedClassId]);

  // Load students when class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    dispatch(fetchClassStudents(selectedClassId))
      .unwrap()
      .then((data) => setStudents(data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [dispatch, selectedClassId]);

  // Filter assessments by class and subject
  const relevantAssessments = useMemo(() => {
    const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
    
    // Normalization helper for names
    const normalize = (str: string) => str ? str.toLowerCase().replace(/\s+/g, '').trim() : '';
    
    return assessments.filter((a: any) => {
      // Class Match (Robust)
      const matchesClass = !selectedClassId || String(a.classId) === String(selectedClassId) || String(a.class?.id) === String(selectedClassId);
      
      if (!matchesClass) return false;
      if (!selectedSubjectId) return true;

      // Subject Match Strategy (Cascade)
      // 1. ID Match (Loose)
      if (String(a.subjectId) === String(selectedSubjectId) || String(a.subject?.id) === String(selectedSubjectId)) return true;
      
      // 2. Code Match (if available)
      if (selectedSubject?.code && (a.subject?.code === selectedSubject.code || a.subjectCode === selectedSubject.code)) return true;
      
      // 3. Name Match (Normalized for case/spaces)
      if (selectedSubject?.name) {
        const selectedName = normalize(selectedSubject.name);
        if (a.subject?.name && normalize(a.subject.name) === selectedName) return true;
        if (a.subjectName && normalize(a.subjectName) === selectedName) return true;
      }
      
      return false;
    });
  }, [assessments, selectedClassId, selectedSubjectId, subjects]);

  // Load existing scores when assessment is selected
  useEffect(() => {
    if (!selectedAssessmentId) {
      setExistingScores([]);
      return;
    }
    setLoadingScores(true);
    dispatch(fetchScoresByAssessmentTeacher(selectedAssessmentId))
      .unwrap()
      .then((data) => {
        setExistingScores(data || []);
        // Pre-populate editedScores with existing data
        const scoreMap = new Map<string, { ca1: string; ca2: string; exam: string }>();
        (data || []).forEach((score: any) => {
          const studentId = score.studentId || score.student?.id;
          if (studentId) {
            scoreMap.set(studentId, {
              ca1: score.ca1?.toString() || score.marksAwarded?.toString() || "",
              ca2: score.ca2?.toString() || "",
              exam: score.exam?.toString() || "",
            });
          }
        });
        setEditedScores(scoreMap);
      })
      .catch(() => setExistingScores([]))
      .finally(() => setLoadingScores(false));
  }, [dispatch, selectedAssessmentId]);

  // Calculate class average
  const classAverage = useMemo(() => {
    const scores = Array.from(editedScores.values());
    if (scores.length === 0) return 0;
    let total = 0;
    let count = 0;
    scores.forEach((s) => {
      const ca1 = parseFloat(s.ca1) || 0;
      const ca2 = parseFloat(s.ca2) || 0;
      const exam = parseFloat(s.exam) || 0;
      const sum = ca1 + ca2 + exam;
      if (sum > 0) {
        total += sum;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  }, [editedScores]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const term = search.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
        (s.studentId || "").toLowerCase().includes(term)
    );
  }, [students, search]);

  const handleScoreChange = (studentId: string, field: "ca1" | "ca2" | "exam", value: string) => {
    setEditedScores((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId) || { ca1: "", ca2: "", exam: "" };
      newMap.set(studentId, { ...current, [field]: value });
      return newMap;
    });
  };

  const getTotal = (studentId: string) => {
    const scores = editedScores.get(studentId);
    if (!scores) return 0;
    return (parseFloat(scores.ca1) || 0) + (parseFloat(scores.ca2) || 0) + (parseFloat(scores.exam) || 0);
  };

  const getGrade = (total: number) => {
    if (total >= 70) return { grade: "A", color: "bg-emerald-500", textColor: "text-emerald-600" };
    if (total >= 60) return { grade: "B", color: "bg-blue-500", textColor: "text-blue-600" };
    if (total >= 50) return { grade: "C", color: "bg-amber-500", textColor: "text-amber-600" };
    if (total >= 40) return { grade: "D", color: "bg-orange-500", textColor: "text-orange-600" };
    return { grade: "F", color: "bg-red-500", textColor: "text-red-600" };
  };

  const handleSaveScores = async () => {
    if (!selectedClassId) return toast.error("Please select a class");
    if (!selectedAssessmentId) return toast.error("Please select an assessment");

    const scores: Array<{ studentId: string; marksAwarded: number; maxMarks: number }> = [];

    for (const student of students) {
      const studentId = student.id || student.studentId;
      const entry = editedScores.get(studentId);
      if (entry) {
        const total = (parseFloat(entry.ca1) || 0) + (parseFloat(entry.ca2) || 0) + (parseFloat(entry.exam) || 0);
        if (total > 0) {
          scores.push({
            studentId,
            marksAwarded: total,
            maxMarks: 100,
          });
        }
      }
    }

    if (scores.length === 0) return toast.error("No scores to save");

    setSaving(true);
    try {
      await dispatch(uploadOfflineScores({ assessmentId: selectedAssessmentId, scores })).unwrap();
      toast.success(`Saved ${scores.length} score(s) successfully`);
    } catch (e: any) {
      toast.error(e || "Failed to save scores");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedAssessmentId) {
      toast.error("Please select an assessment first");
      e.target.value = "";
      return;
    }

    setSaving(true);
    try {
      await dispatch(bulkUploadScoresExcel({ assessmentId: selectedAssessmentId, file })).unwrap();
      toast.success("Scores imported successfully");
    } catch (e: any) {
      toast.error(e || "Failed to import scores");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const selectedClass = uniqueClasses.find((c: any) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
  const selectedAssessment = relevantAssessments.find((a: any) => a.id === selectedAssessmentId);

  const unsavedCount = editedScores.size;

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Score Entry</h1>
              <p className="text-emerald-100 text-sm mt-1">
                {selectedSubject?.name || "Select a subject"} • {selectedTerm} • {new Date().getFullYear()}/{new Date().getFullYear() + 1}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 w-[220px] rounded-xl border-emerald-400/50 bg-white/20 text-white placeholder:text-emerald-200 focus:bg-white focus:text-slate-900"
                />
              </div>

              {/* Download Template */}
              <button
                onClick={() => generateTemplate("scores")}
                className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors"
                title="Download Excel Template"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Template</span>
              </button>

              {/* Import Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  className="hidden"
                  disabled={saving}
                />
                <div className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors">
                  <Upload className="w-4 h-4" />
                  Import Excel
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-wrap items-end gap-4">
            {/* Class */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Class
              </span>
              <Select value={selectedClassId} onValueChange={(v) => {
                setSelectedClassId(v);
                setSelectedSubjectId("");
                setSelectedAssessmentId("");
              }}>
                <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {uniqueClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Subject
              </span>
              <Select 
                value={selectedSubjectId} 
                onValueChange={(v) => {
                  setSelectedSubjectId(v);
                  setSelectedAssessmentId("");
                }} 
                disabled={!selectedClassId || loadingSubjects}
              >
                <SelectTrigger className="h-11 w-[180px] rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={loadingSubjects ? "Loading..." : "Select Subject"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subjects.map((subj: any) => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assessment */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" /> Assessment
              </span>
              <Select 
                value={selectedAssessmentId} 
                onValueChange={setSelectedAssessmentId} 
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="h-11 w-[200px] rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={loading ? "Loading..." : "Select Assessment"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {relevantAssessments.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-500">No assessments found</div>
                  ) : (
                    relevantAssessments.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Term */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Term</span>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="First Term">1st Term</SelectItem>
                  <SelectItem value="Second Term">2nd Term</SelectItem>
                  <SelectItem value="Third Term">3rd Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Class Average */}
            <div className="flex flex-col gap-1.5 ml-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Average</span>
              <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <span className="text-2xl font-bold text-emerald-600">{classAverage}%</span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Score Table */}
        <div className="overflow-x-auto">
          {loadingStudents || loadingScores ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200"
                style={{ borderTopColor: primaryColor }}
              />
            </div>
          ) : !selectedClassId ? (
            <div className="text-center py-20">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Select a class to view students</p>
            </div>
          ) : !selectedAssessmentId ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Select an assessment to enter scores</p>
              <p className="text-sm text-slate-400 mt-1">
                Choose a class, subject, and assessment from the filters above
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 font-medium">No students found in this class</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left font-semibold py-4 px-5 text-sm">S/N</th>
                  <th className="text-left font-semibold py-4 px-3 text-sm">STUDENT ID</th>
                  <th className="text-left font-semibold py-4 px-3 text-sm">STUDENT NAME</th>
                  <th className="text-center font-semibold py-4 px-3 text-sm">CA 1 (20)</th>
                  <th className="text-center font-semibold py-4 px-3 text-sm">CA 2 (20)</th>
                  <th className="text-center font-semibold py-4 px-3 text-sm">EXAM (60)</th>
                  <th className="text-center font-semibold py-4 px-3 text-sm">TOTAL</th>
                  <th className="text-center font-semibold py-4 px-3 text-sm">GRADE</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student: any, idx: number) => {
                  const studentId = student.id || student.studentId;
                  const displayId = student.studentId || student.admissionNo || `—`;
                  const scores = editedScores.get(studentId) || { ca1: "", ca2: "", exam: "" };
                  const total = getTotal(studentId);
                  const { grade, color, textColor } = getGrade(total);

                  return (
                    <tr
                      key={studentId || idx}
                      className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-100/50 transition-colors`}
                    >
                      <td className="py-4 px-5 text-sm text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-4 px-3 text-sm text-slate-500 font-mono">{displayId}</td>
                      <td className="py-4 px-3">
                        <span className="font-semibold text-slate-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={scores.ca1}
                          onChange={(e) => handleScoreChange(studentId, "ca1", e.target.value)}
                          placeholder="—"
                          className="h-10 w-[70px] rounded-lg text-center mx-auto border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={scores.ca2}
                          onChange={(e) => handleScoreChange(studentId, "ca2", e.target.value)}
                          placeholder="—"
                          className="h-10 w-[70px] rounded-lg text-center mx-auto border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={scores.exam}
                          onChange={(e) => handleScoreChange(studentId, "exam", e.target.value)}
                          placeholder="—"
                          className="h-10 w-[70px] rounded-lg text-center mx-auto border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`font-bold text-lg ${total > 0 ? textColor : "text-slate-400"}`}>
                          {total > 0 ? total : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        {total > 0 ? (
                          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm ${color}`}>
                            {grade}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {selectedClassId && selectedAssessmentId && filteredStudents.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {unsavedCount > 0 ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm text-slate-600">
                    {unsavedCount} student(s) with scores entered
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">No scores entered yet</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 px-5 rounded-xl"
                disabled={unsavedCount === 0}
                onClick={() => setEditedScores(new Map())}
              >
                Clear All
              </Button>
              <Button
                onClick={handleSaveScores}
                disabled={saving || unsavedCount === 0}
                className="h-11 px-6 rounded-xl text-white font-semibold gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Scores"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
