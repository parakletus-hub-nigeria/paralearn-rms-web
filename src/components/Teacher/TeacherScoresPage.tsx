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
import { useSessionsAndTerms } from "@/hooks/useSessionsAndTerms";
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
import { toast } from "sonner";
import { generateTemplate } from "@/lib/templates";
import apiClient from "@/lib/api";


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
  const [selectedTerm, setSelectedTerm] = useState("");
  const [search, setSearch] = useState("");

  // Get dynamic session/term options
  const {
    allTermOptions,
    currentTerm: apiCurrentTerm,
  } = useSessionsAndTerms();

  // Set default term from API
  useEffect(() => {
    if (apiCurrentTerm && !selectedTerm) {
      setSelectedTerm(apiCurrentTerm);
    }
  }, [apiCurrentTerm, selectedTerm]);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [existingScores, setExistingScores] = useState<any[]>([]);
  const [editedScores, setEditedScores] = useState<Map<string, Map<string, string>>>(new Map()); // studentId -> assessmentId -> score

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
    
    // First fetch basic student list from class
    dispatch(fetchClassStudents(selectedClassId))
      .unwrap()
      .then(async (data) => {
        console.log("[TeacherScores] Fetched students from enrollments:", data);
        
        if (data && data.length > 0) {
          // The enrollment data doesn't include studentId codes
          // Fetch full user data to get studentId (like "DSA-S-26-0001")
          try {
            const userIds = data.map((s: any) => s.id).filter(Boolean);
            const usersResp = await apiClient.get("/api/proxy/users");
            
            const usersData = usersResp.data;
            const allUsers = usersData?.data || usersData || [];
            
            // Merge enrollment data with full user data
            const enrichedStudents = data.map((student: any) => {
              const matchingUser = allUsers.find((u: any) => u.id === student.id);
              return {
                ...student,
                ...matchingUser, // This will include studentId field
              };
            });
            
            console.log("[TeacherScores] Enriched students with user data:", enrichedStudents);
            if (enrichedStudents.length > 0) {
              console.log("[TeacherScores] Sample enriched student:", enrichedStudents[0]);
            }
            setStudents(enrichedStudents);
          } catch (error) {
            console.error("[TeacherScores] Failed to fetch user data:", error);
            setStudents(data);
          }
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [dispatch, selectedClassId]);

  // Filter assessments by class and subject
  const relevantAssessments = useMemo(() => {
    if (!selectedSubjectId) return [];
    
    const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
    
    // Normalization helper for names
    const normalize = (str: string) => str ? str.toLowerCase().replace(/\s+/g, '').trim() : '';
    
    return assessments.filter((a: any) => {
      // Class Match (Robust)
      const matchesClass = !selectedClassId || String(a.classId) === String(selectedClassId) || String(a.class?.id) === String(selectedClassId);
      if (!matchesClass) return false;

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

  // Load existing scores for ALL relevant assessments in parallel
  useEffect(() => {
    if (relevantAssessments.length === 0) {
      setExistingScores([]);
      setEditedScores(new Map());
      return;
    }

    setLoadingScores(true);

    // For each assessment, determine strategy:
    //   - Online (CBT) → read submission scores already embedded in the assessment object
    //   - Offline      → hit /scores/assessment/:id as usual
    Promise.all(
      relevantAssessments.map(async (assessment: any) => {
        const isOnline = assessment.assessmentType === "online" || assessment.isOnline === true;

        if (isOnline) {
          // CBT scores come from submissions — pick the latest GRADED one per student
          const submissions: any[] = assessment.submissions || [];
          const gradedByStudent = new Map<string, any>();

          submissions.forEach((sub: any) => {
            if (sub.status === "graded" && sub.studentId) {
              // Keep the most-recently-created graded submission per student
              const existing = gradedByStudent.get(sub.studentId);
              if (!existing || new Date(sub.createdAt) > new Date(existing.createdAt)) {
                gradedByStudent.set(sub.studentId, sub);
              }
            }
          });

          // Convert to a shape compatible with the offline score format
          const scores = Array.from(gradedByStudent.values()).map((sub: any) => ({
            studentId: sub.studentId,
            marksAwarded: sub.score ?? 0,
            score: sub.score ?? 0,
            assessmentId: assessment.id
          }));

          console.log(`[TeacherScores] Online assessment "${assessment.title}" CBT scores:`, scores);
          return { assessmentId: assessment.id, scores };
        }

        // Offline — fetch from dedicated scores endpoint
        try {
          const result = await dispatch(fetchScoresByAssessmentTeacher(assessment.id)).unwrap();
          return { assessmentId: assessment.id, scores: result || [] };
        } catch (e) {
          console.error(`Failed to fetch scores for assessment ${assessment.id}`, e);
          return { assessmentId: assessment.id, scores: [] };
        }
      })
    ).then((results) => {
      const allScores = results.flatMap(r => r.scores);
      setExistingScores(allScores);
      
      // Populate editedScores map: StudentId → AssessmentId → Score
      const scoreMap = new Map<string, Map<string, string>>();
      
      results.forEach(({ assessmentId, scores }) => {
        scores.forEach((s: any) => {
          const studentId = s.studentId || s.student?.id;
          if (studentId) {
            if (!scoreMap.has(studentId)) {
              scoreMap.set(studentId, new Map());
            }
            // Prefer marksAwarded, fall back to score
            const val = s.marksAwarded?.toString() ?? s.score?.toString() ?? "";
            scoreMap.get(studentId)!.set(assessmentId, val);
          }
        });
      });

      console.log("[TeacherScores] Final scoreMap:", Object.fromEntries(
        Array.from(scoreMap.entries()).map(([k, v]) => [k, Object.fromEntries(v)])
      ));
      setEditedScores(scoreMap);
    }).finally(() => setLoadingScores(false));
  }, [dispatch, relevantAssessments]);

  // Calculate composite Total per student (sum of all assessment scores)
  const getStudentTotal = (studentId: string) => {
    const studentScores = editedScores.get(studentId);
    if (!studentScores) return 0;
    
    let total = 0;
    studentScores.forEach((val) => {
      total += parseFloat(val) || 0;
    });
    return total;
  };

  // Calculate class average based on Totals
  const classAverage = useMemo(() => {
    if (editedScores.size === 0) return 0;
    let totalSum = 0;
    let count = 0;
    
    editedScores.forEach((_, studentId) => {
      const studentTotal = getStudentTotal(studentId);
      if (studentTotal > 0) {
        totalSum += studentTotal;
        count++;
      }
    });
    
    return count > 0 ? Math.round(totalSum / count) : 0;
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

  const handleScoreChange = (studentId: string, assessmentId: string, value: string) => {
    setEditedScores((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(studentId)) {
        newMap.set(studentId, new Map());
      }
      // Clone inner map to ensure reactivity
      const studentScores = new Map(newMap.get(studentId)!);
      studentScores.set(assessmentId, value);
      newMap.set(studentId, studentScores);
      return newMap;
    });
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
    if (relevantAssessments.length === 0) return toast.error("No assessments available");

    // Flatten scores to group by Assessment ID
    // Map<AssessmentId, Array<{studentId, marksAwarded, maxMarks}>>
    const scoresByAssessment = new Map<string, Array<{ studentId: string; marksAwarded: number; maxMarks: number }>>();

    // Iterate all students and their scores
    editedScores.forEach((studentScores, studentId) => {
      studentScores.forEach((val, assessmentId) => {
        // Find assessment info for maxMarks
        const assessment = relevantAssessments.find((a: any) => a.id === assessmentId);
        const maxMarks = assessment?.totalMarks || 100;
        const marksAwarded = parseFloat(val);

        if (!isNaN(marksAwarded)) {
           if (!scoresByAssessment.has(assessmentId)) {
             scoresByAssessment.set(assessmentId, []);
           }
           scoresByAssessment.get(assessmentId)!.push({
             studentId,
             marksAwarded,
             maxMarks
           });
        }
      });
    });

    if (scoresByAssessment.size === 0) return toast.error("No scores to save");

    setSaving(true);
    try {
      // Execute uploads in parallel
      const uploadPromises = Array.from(scoresByAssessment.entries()).map(([assessmentId, scores]) => {
         return dispatch(uploadOfflineScores({ assessmentId, scores })).unwrap();
      });

      await Promise.all(uploadPromises);
      toast.success(`Detailed scores saved successfully for ${uploadPromises.length} assessments`);
    } catch (e: any) {
      toast.error(e || "Failed to save some scores");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Current backend bulk upload is per-assessment based on file.
    // Matrix import is complex without a robust parser that matches columns to assessment IDs.
    // For now, we will disable this or restrict it to single assessment selection, but UI has changed.
    // Alternative: We can ask user which assessment this file is for?
    // Implementing simple single-file import is tricky in matrix view without more UI.
    toast.info("Bulk import is currently supported per-assessment in detailed view.");
  };

  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);

  const totalEntries = Array.from(editedScores.values()).reduce((acc, map) => acc + map.size, 0);

  return (
    <div className="w-full">
      <TeacherHeader />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-coolvetica">Score Sheet</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-coolvetica">
                {selectedSubject?.name || "Select a subject"} • {selectedTerm} • {new Date().getFullYear()}/{new Date().getFullYear() + 1}
              </p>
            </div>

            {/* Search - Full width on mobile */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 sm:h-11 w-full sm:w-[220px] rounded-xl border-emerald-400/50 bg-white/20 text-white placeholder:text-emerald-200 focus:bg-white focus:text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Class */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Class
              </span>
              <Select value={selectedClassId} onValueChange={(v) => {
                setSelectedClassId(v);
                setSelectedSubjectId("");
              }}>
                <SelectTrigger className="h-10 sm:h-11 w-full rounded-xl border-slate-200 bg-white">
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
                onValueChange={setSelectedSubjectId} 
                disabled={!selectedClassId || loadingSubjects}
              >
                <SelectTrigger className="h-10 sm:h-11 w-full rounded-xl border-slate-200 bg-white">
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

            {/* Term */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Term</span>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-10 sm:h-11 w-full rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {allTermOptions.map((opt) => (
                    <SelectItem key={opt.id || opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Average */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Average</span>
              <div className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <span className="text-xl sm:text-2xl font-bold text-emerald-600">{classAverage}%</span>
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500" />
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
          ) : !selectedSubjectId ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Select a subject to view assessments</p>
            </div>
          ) : relevantAssessments.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No assessments found for this subject</p>
              <p className="text-sm text-slate-400 mt-1">Create an assessment to start grading</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 font-medium">No students found in this class</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden px-4 pb-4">
                {filteredStudents.map((student: any, idx: number) => {
                  const studentId = student.id;
                  const displayId = student.studentId || student.code || student.admissionNo || "—";
                  const studentTotal = getStudentTotal(studentId);
                  const { grade, color, textColor } = getGrade(studentTotal);

                  return (
                    <div
                      key={studentId || idx}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-3"
                    >
                      {/* Student Header */}
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100">
                        <div className="flex-1">
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            Student ID
                          </div>
                          <div className="font-mono font-semibold text-slate-700">
                            {displayId}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Student Name */}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900">
                          {student.firstName} {student.lastName}
                        </h3>
                      </div>

                      {/* Assessment Scores */}
                      <div className="space-y-3 mb-4">
                        {relevantAssessments.map((assessment: any) => {
                          const score = editedScores.get(studentId)?.get(assessment.id) || "";
                          const max = assessment.totalMarks || 100;

                          return (
                            <div key={assessment.id} className="space-y-1">
                              <label className="text-xs text-slate-500">
                                {assessment.title} ({max})
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max={max}
                                value={score}
                                onChange={(e) => handleScoreChange(studentId, assessment.id, e.target.value)}
                                placeholder="Enter score"
                                className="h-11 rounded-lg text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Total and Grade */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                            Total Score
                          </div>
                          <span className={`font-bold text-2xl ${studentTotal > 0 ? textColor : "text-slate-400"}`}>
                            {studentTotal > 0 ? studentTotal : "—"}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1 text-right">
                            Grade
                          </div>
                          {studentTotal > 0 ? (
                            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg ${color}`}>
                              {grade}
                            </span>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                              <span className="text-slate-400 text-lg">—</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block relative">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="sticky left-0 z-10 bg-slate-800 text-left font-semibold py-3 sm:py-4 px-3 sm:px-5 text-xs sm:text-sm w-[50px] sm:w-[60px]">S/N</th>
                        <th className="sticky left-[50px] sm:left-[60px] z-10 bg-slate-800 text-left font-semibold py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm min-w-[100px] sm:min-w-[120px]">ID</th>
                        <th className="sticky left-[150px] sm:left-[180px] z-10 bg-slate-800 text-left font-semibold py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm min-w-[150px] sm:min-w-[200px]">NAME</th>
                        {/* Dynamic Assessment Columns */}
                        {relevantAssessments.map((assessment: any) => (
                          <th key={assessment.id} className="text-center font-semibold py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm min-w-[90px] sm:min-w-[100px]">
                            <div className="flex flex-col items-center">
                              <span className="truncate max-w-[80px] sm:max-w-none">{assessment.title}</span>
                              <span className="text-[10px] opacity-70">({assessment.totalMarks || 100})</span>
                            </div>
                          </th>
                        ))}
                        <th className="text-center font-semibold py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm w-[80px] sm:w-[100px] border-l border-slate-700">TOTAL</th>
                        <th className="text-center font-semibold py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm w-[70px] sm:w-[80px]">GRADE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student: any, idx: number) => {
                        const studentId = student.id;
                        const displayId = student.studentId || student.code || student.admissionNo || "—";
                        const studentTotal = getStudentTotal(studentId);
                        const { grade, color, textColor } = getGrade(studentTotal);

                        return (
                          <tr
                            key={studentId || idx}
                            className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-100/50 transition-colors`}
                          >
                            <td className="sticky left-0 z-10 bg-inherit py-3 sm:py-4 px-3 sm:px-5 text-xs sm:text-sm text-slate-500 font-medium">{idx + 1}</td>
                            <td className="sticky left-[50px] sm:left-[60px] z-10 bg-inherit py-3 sm:py-4 px-2 sm:px-3 text-xs sm:text-sm text-slate-700 font-mono font-semibold">{displayId}</td>
                            <td className="sticky left-[150px] sm:left-[180px] z-10 bg-inherit py-3 sm:py-4 px-2 sm:px-3">
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                {student.firstName} {student.lastName}
                              </span>
                            </td>
                            
                            {/* Dynamic Assessment Inputs */}
                            {relevantAssessments.map((assessment: any) => {
                              const score = editedScores.get(studentId)?.get(assessment.id) || "";
                              const max = assessment.totalMarks || 100;
                              
                              return (
                                <td key={assessment.id} className="py-3 sm:py-4 px-2 sm:px-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={max}
                                    value={score}
                                    onChange={(e) => handleScoreChange(studentId, assessment.id, e.target.value)}
                                    placeholder="—"
                                    className="h-8 sm:h-10 w-[60px] sm:w-[70px] rounded-lg text-xs sm:text-sm text-center mx-auto border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                  />
                                </td>
                              );
                            })}

                            <td className="py-3 sm:py-4 px-2 sm:px-3 text-center border-l border-slate-100 bg-slate-50/50">
                              <span className={`font-bold text-base sm:text-lg ${studentTotal > 0 ? textColor : "text-slate-400"}`}>
                                {studentTotal > 0 ? studentTotal : "—"}
                              </span>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-3 text-center bg-slate-50/50">
                              {studentTotal > 0 ? (
                                <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-white font-bold text-xs sm:text-sm ${color}`}>
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
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {selectedClassId && selectedSubjectId && filteredStudents.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                {totalEntries > 0 ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs sm:text-sm text-slate-600">
                      Ready to save scores
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-xs sm:text-sm text-slate-500">No scores entered yet</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl text-sm flex-1 sm:flex-none"
                  disabled={totalEntries === 0}
                  onClick={() => setEditedScores(new Map())}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleSaveScores}
                  disabled={saving || totalEntries === 0}
                  className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl text-white font-semibold gap-2 text-sm flex-1 sm:flex-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Scores"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
