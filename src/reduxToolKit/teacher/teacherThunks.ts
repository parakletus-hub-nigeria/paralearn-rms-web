import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";

export type AcademicCurrent = {
  session: string;
  term: string;
  sessionId?: string;
  termId?: string;
  startDate?: string;
  endDate?: string;
};

export type Assessment = {
  id: string;
  title: string;
  subjectId?: string;
  classId?: string;
  categoryId?: string;
  totalMarks?: number;
  passingMarks?: number;
  duration?: number;
  instructions?: string;
  startsAt?: string;
  endsAt?: string;
  session?: string;
  term?: string;
  isOnline?: boolean;
  status?: string;
  subject?: { id: string; name: string };
  class?: { id: string; name: string };
};

export type CommentType = "subject_teacher" | "class_teacher" | "principal";

export type TeacherComment = {
  id?: string;
  studentId: string;
  subjectId?: string;
  term: string;
  session: string;
  comment: string;
  type: CommentType;
  createdAt?: string;
};

export const fetchAcademicCurrent = createAsyncThunk(
  "teacher/fetchAcademicCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/academic/current");
      const data = res.data?.data || res.data;
      if (!data) return rejectWithValue("No academic session returned");
      return data as AcademicCurrent;
    } catch (e: any) {
      console.log("[fetchAcademicCurrent] API failed, using fallback mock data:", e?.message);
      // Return a safe default to prevent dashboard crash
      return {
        session: "2024/2025",
        term: "First Term",
        isActive: true
      } as AcademicCurrent;
    }
  }
);

export const fetchMyAssessments = createAsyncThunk(
  "teacher/fetchMyAssessments",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Access teacher state to filter assessments if needed
      const state: any = getState();
      const teacherClasses = state.teacher?.classes || [];
      const assignedSubjectIds = new Set<string>();
      const assignedClassIds = new Set<string>();
      
      teacherClasses.forEach((c: any) => {
        if (c.classId || c.id) assignedClassIds.add(c.classId || c.id);
        if (c.subjectId) assignedSubjectIds.add(c.subjectId);
        // If subjects array exists
        if (Array.isArray(c.subjects)) {
          c.subjects.forEach((s: any) => assignedSubjectIds.add(s.id || s));
        }
      });

      console.log("[fetchMyAssessments] Filtering based on:", { 
        subjects: assignedSubjectIds.size, 
        classes: assignedClassIds.size 
      });

      let items: Assessment[] = [];

      // Primary: Try GET /assessments/me (Documented for teachers)
      try {
        const res = await apiClient.get("/api/proxy/assessments/me");
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          items = data as Assessment[];
        }
      } catch (meError: any) {
        console.log("[fetchMyAssessments] /assessments/me endpoint failed:", meError?.message);
        
        // Fallback: Fetch all assessments and CLIENT-SIDE FILTER
        // This is robust against backend leaks or missing endpoints
        try {
          console.log("[fetchMyAssessments] Entering fallback fetch...");
          // Try fetching by status first (if backend supports it)
          const statuses: Array<"started" | "ended" | "not_started"> = ["started", "ended", "not_started"];
          const results = await Promise.all(
            statuses.map(async (status) => {
              try {
                // Try query param style first as it is more standard: /assessments?status=started
                const res = await apiClient.get(`/api/proxy/assessments?status=${status}`);
                const list = res.data?.data || res.data || [];
                return Array.isArray(list) ? (list as Assessment[]) : [];
              } catch (e: any) {
                 // Try path param style: /assessments/started
                 try {
                   const res = await apiClient.get(`/api/proxy/assessments/${status}`);
                   const list = res.data?.data || res.data || [];
                   return Array.isArray(list) ? (list as Assessment[]) : [];
                 } catch (pathErr) {
                   return [];
                 }
              }
            })
          );
          
          let fetched = results.flat();
          
          // If status fetch yielded nothing, try fetching ALL assessments
          if (fetched.length === 0) {
             try {
               const res = await apiClient.get(`/api/proxy/assessments`);
               const list = res.data?.data || res.data || [];
               if (Array.isArray(list)) {
                 fetched = list as Assessment[];
               }
             } catch (allErr) {
               console.log("[fetchMyAssessments] Final fallback /assessments failed");
             }
          }
          
          items = fetched;
        } catch (fallbackErr) {
          console.log("Fallback fetch failed", fallbackErr);
        }
      }

      // FINAL FILTER: Only return assessments for assigned classes/subjects
      // Use logic: (matches subject AND matches class) OR (matches subject if no class specific?)
      // Usually assessment is linked to both.
      
      const filtered = items.filter(a => {
        const subjectMatch = a.subject?.id ? assignedSubjectIds.has(a.subject.id) : (a.subjectId ? assignedSubjectIds.has(a.subjectId) : false);
        // Some assessments might not have classId if they are general? Likely strict.
        const classMatch = a.class?.id ? assignedClassIds.has(a.class.id) : (a.classId ? assignedClassIds.has(a.classId) : false);
        
        // If we have no assigned classes loaded yet, we can't filter safely. 
        // But if we returned items from /assessments/me, we trust them.
        // If we came from fallback, we MUST filter.
        
        // For now, let's filter if we have assignedIds. If assignedIds is empty, maybe teacher has nothing?
        if (assignedSubjectIds.size > 0) {
            return subjectMatch; 
        }
        return true; 
      });

      console.log(`[fetchMyAssessments] Loaded ${items.length}, Filtered to ${filtered.length}`);
      
      const byId = new Map<string, Assessment>();
      for (const a of filtered) {
        if (a?.id) byId.set(a.id, a);
      }
      return Array.from(byId.values());

    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load assessments"
      );
    }
  }
);

export const fetchTeacherClasses = createAsyncThunk(
  "teacher/fetchTeacherClasses",
  async (params: { teacherId: string }, { rejectWithValue }) => {
      // DUAL FETCH STRATEGY:
      // 1. Fetch classes explicitly assigned to teacher (e.g. Class Teacher role)
      // 2. Fetch subjects explicitly assigned to teacher (Subject Teacher role)
      // Merge results to provide full access list.
      
      try {
        console.log("[fetchTeacherClasses] Starting dual fetch...");
        
        const [classesRes, subjectsRes] = await Promise.allSettled([
          apiClient.get(`/api/proxy/classes/teacher/${params.teacherId}`),
          apiClient.get(`/api/proxy/subjects`)
        ]);

        const mergedItems: any[] = [];
        const seenIds = new Set<string>(); // avoid duplicates if any

        // Process 1: Explicit Class Assignments
        if (classesRes.status === "fulfilled") {
          const rawClasses = classesRes.value.data?.data || classesRes.value.data || [];
          if (Array.isArray(rawClasses)) {
            console.log(`[fetchTeacherClasses] Found ${rawClasses.length} explicit class assignments`);
            rawClasses.forEach((c: any) => {
              // For class assignments, we might not have a specific subject.
              // We treat this as "Class Access".
              // Map to the shape UI expects: { class: {...}, subject: null/undefined }
              console.log(`[fetchTeacherClasses] Class ${c.name} has ${c.subjects?.length || 0} subjects`, c.subjects);
              const item = {
                id: `class-${c.id}`, // specific ID for this permission
                classId: c.id,
                className: c.name,
                class: { ...c, id: c.id, name: c.name }, // Pass full class object for stats (studentCount etc) - includes subjects array
                subject: null, // No specific subject restricted
                teacherId: params.teacherId,
                type: "class_assignment"
              };
              mergedItems.push(item);
            });
          }
        } else {
          console.log("[fetchTeacherClasses] Classes endpoint failed:", classesRes.reason?.message);
        }

        // Process 2: Explicit Subject Assignments (Strict Filter)
        if (subjectsRes.status === "fulfilled") {
          const allSubjects = subjectsRes.value.data?.data || subjectsRes.value.data || [];
          if (Array.isArray(allSubjects)) {
             const assignedSubjects = allSubjects.filter((s: any) => {
               // Check teacherAssignments array
               if (s.teacherAssignments && Array.isArray(s.teacherAssignments)) {
                  return s.teacherAssignments.some((assignment: any) => 
                    assignment.teacherId === params.teacherId || 
                    (assignment.teacher && assignment.teacher.id === params.teacherId)
                  );
               }
               // Fallback
               return s.teacherId === params.teacherId;
            });
            
            console.log(`[fetchTeacherClasses] Found ${assignedSubjects.length} subject assignments`);
            
            assignedSubjects.forEach((s: any) => {
              // Create an entry for this Subject Assignment
              const classId = s.class?.id || s.classId || s.id; // Careful with fallback
              // If class params missing, we might have issues, but let's map what we have.
              
              const item = {
                id: s.id,
                subjectId: s.id,
                subjectName: s.name,
                classId: classId,
                className: s.class?.name || s.className || `Class ${classId?.substring(0,6) || "Unknown"}`,
                class: s.class || { id: classId, name: s.className || `Class ${classId?.substring(0,6) || "Unknown"}` }, 
                subject: { id: s.id, name: s.name },
                teacherId: params.teacherId,
                type: "subject_assignment"
              };
              mergedItems.push(item);
            });
          }
        } else {
           console.log("[fetchTeacherClasses] Subjects endpoint failed:", subjectsRes.reason?.message);
        }

        console.log(`[fetchTeacherClasses] Total merged items: ${mergedItems.length}`);
        
        // ENHANCEMENT: If any class assignments are missing subjects, fetch them
        const classesNeedingSubjects = mergedItems.filter(
          item => item.type === "class_assignment" && (!item.class?.subjects || item.class.subjects.length === 0)
        );
        
        if (classesNeedingSubjects.length > 0) {
          console.log(`[fetchTeacherClasses] Fetching subjects for ${classesNeedingSubjects.length} classes...`);
          
          await Promise.all(
            classesNeedingSubjects.map(async (item: any) => {
              try {
                const subjectsRes = await apiClient.get(`/api/proxy/subjects?classId=${item.classId}`);
                const subjects = subjectsRes.data?.data || subjectsRes.data || [];
                // Update the class object with subjects
                if (item.class) {
                  item.class.subjects = Array.isArray(subjects) ? subjects : [];
                }
              } catch (err) {
                console.error(`[fetchTeacherClasses] Failed to fetch subjects for class ${item.classId}:`, err);
                if (item.class) {
                  item.class.subjects = [];
                }
              }
            })
          );
        }
        
        return mergedItems;

      } catch (err: any) {
        console.error("fetchTeacherClasses critical failure", err);
        return rejectWithValue(err?.message || "Failed to load teacher classes");
      }

  }
);

export const createTeacherAssessment = createAsyncThunk(
  "teacher/createTeacherAssessment",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/assessments", payload);
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to create assessment"
      );
    }
  }
);

export const fetchScoresByAssessmentTeacher = createAsyncThunk(
  "teacher/fetchScoresByAssessmentTeacher",
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/scores/assessment/${assessmentId}`);
      const items = res.data?.data || res.data || [];
      return Array.isArray(items) ? items : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load scores"
      );
    }
  }
);

export const fetchAssessmentsByStatus = createAsyncThunk(
  "teacher/fetchAssessmentsByStatus",
  async (status: "started" | "ended" | "not_started", { rejectWithValue }) => {
    try {
      let res: any;
      try {
        res = await apiClient.get(`/api/proxy/assessments/${status}`);
      } catch (e: any) {
        // Fallback for controller mismatch (if status is read from query instead of path)
        if (e?.response?.status === 404) {
          res = await apiClient.get(`/api/proxy/assessments?status=${status}`);
        } else {
          throw e;
        }
      }

      const items = res.data?.data || res.data || [];
      return { status, items: Array.isArray(items) ? (items as Assessment[]) : [] };
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load assessments"
      );
    }
  }
);

export const fetchAssessmentDetail = createAsyncThunk(
  "teacher/fetchAssessmentDetail",
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/assessments/${assessmentId}`);
      const data = res.data?.data || res.data;
      if (!data) return rejectWithValue("Assessment not found");
      return data as Assessment;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load assessment"
      );
    }
  }
);

export const fetchAssessmentSubmissions = createAsyncThunk(
  "teacher/fetchAssessmentSubmissions",
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/assessments/${assessmentId}/submissions`);
      const items = res.data?.data || res.data || [];
      return Array.isArray(items) ? items : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load submissions"
      );
    }
  }
);

export const publishAssessment = createAsyncThunk(
  "teacher/publishAssessment",
  async (
    params: { assessmentId: string; publish: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(
        `/api/proxy/assessments/${params.assessmentId}/publish`,
        { publish: params.publish }
      );
      return res.data?.data || res.data || { publish: params.publish };
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to update publish state"
      );
    }
  }
);

export const gradeAnswer = createAsyncThunk(
  "teacher/gradeAnswer",
  async (
    params: {
      submissionId: string;
      answerId: string;
      marksAwarded: number;
      comment?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(
        `/api/proxy/assessments/submissions/${params.submissionId}/answers/${params.answerId}/grade`,
        { marksAwarded: params.marksAwarded, comment: params.comment }
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to grade answer"
      );
    }
  }
);

export const uploadOfflineScores = createAsyncThunk(
  "teacher/uploadOfflineScores",
  async (
    params: {
      assessmentId: string;
      scores: Array<{ studentId: string; marksAwarded: number; maxMarks: number; comment?: string }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(
        `/api/proxy/assessments/${params.assessmentId}/scores`,
        { scores: params.scores }
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to upload scores"
      );
    }
  }
);

export const bulkUploadScoresExcel = createAsyncThunk(
  "teacher/bulkUploadScoresExcel",
  async (params: { assessmentId: string; file: File }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", params.file);
      const res = await apiClient.post(
        `/api/proxy/scores/bulk?assessmentId=${encodeURIComponent(params.assessmentId)}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to bulk upload scores"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "teacher/addComment",
  async (payload: TeacherComment, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/comments", payload);
      return res.data?.data || res.data || payload;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to add comment"
      );
    }
  }
);

export const fetchMyComments = createAsyncThunk(
  "teacher/fetchMyComments",
  async (params: { session: string; term: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/comments/my-comments?session=${encodeURIComponent(params.session)}&term=${encodeURIComponent(
          params.term
        )}`
      );
      const items = res.data?.data || res.data || [];
      return Array.isArray(items) ? (items as TeacherComment[]) : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load comments"
      );
    }
  }
);

export const fetchBookletPreview = createAsyncThunk(
  "teacher/fetchBookletPreview",
  async (
    params: { classId: string; session: string; term: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/class/${params.classId}/booklet-preview?session=${encodeURIComponent(
          params.session
        )}&term=${encodeURIComponent(params.term)}`
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load booklet preview"
      );
    }
  }
);

export const submitReportsForApproval = createAsyncThunk(
  "teacher/submitReportsForApproval",
  async (params: { classId: string; session: string; term: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/reports/submit-for-approval", params);
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to submit for approval"
      );
    }
  }
);

// Fetch students in a class (for score entry)
// Based on API docs: GET /classes/:classId returns { students: [...] }
// Fetch students in a class (for score entry)
// Based on API docs: GET /classes/:classId returns { students: [...] }
export const fetchClassStudents = createAsyncThunk(
  "teacher/fetchClassStudents",
  async (classId: string, { rejectWithValue }) => {
    try {
      console.log("[fetchClassStudents] Fetching students for class:", classId);
      
      let students: any[] = [];

      // Attempt 1: GET /users (Primary for Teachers)
      // This is safer as Teachers might not have permission to view full Class details
      try {
        console.log("[fetchClassStudents] calling /users endpoint...");
        // Ensure we filter by classId AND role=student to be precise
        const usersRes = await apiClient.get(`/api/proxy/users?classId=${classId}&role=student`);
        const usersData = usersRes.data?.data || usersRes.data || [];
        
        if (Array.isArray(usersData) && usersData.length > 0) {
           students = usersData;
           console.log(`[fetchClassStudents] Successfully fetched ${students.length} students from /users`);
           return students;
        } else {
           console.log("[fetchClassStudents] /users returned empty list, trying fallbacks...");
        }
      } catch (userErr: any) {
        console.warn("[fetchClassStudents] /users endpoint failed:", userErr?.message);
        // Continue to fallback
      }

      // Attempt 2: GET /classes/:id (Fallback)
      // Only try this if users endpoint failed or returned nothing
      try {
        console.log("[fetchClassStudents] Fallback: calling /classes/:id endpoint...");
        const classRes = await apiClient.get(`/api/proxy/classes/${classId}`);
        const classData = classRes.data?.data || classRes.data || {};
        
        // Extract from classData
        if (classData.students && Array.isArray(classData.students)) {
           students = classData.students;
           console.log("[fetchClassStudents] Found students in class.students:", students.length);
        } else if (classData.enrollments && Array.isArray(classData.enrollments)) {
           students = classData.enrollments.map((e: any) => e.student || e).filter((s:any) => s && (s.id || s.firstName));
           console.log("[fetchClassStudents] Found students in enrollments:", students.length);
        }
      } catch (classErr: any) {
        console.warn("[fetchClassStudents] Primary class endpoint failed (likely permission):", classErr?.message);
      }
      
      console.log("[fetchClassStudents] Final students count:", students.length);
      return students; // Return empty array if all failed, don't throw
    } catch (e: any) {
      console.error("[fetchClassStudents] Critical Error:", e);
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load class students"
      );
    }
  }
);

// Fetch subjects for a class
// Fetch subjects for a class - Enforcing Isolation
export const fetchClassSubjects = createAsyncThunk(
  "teacher/fetchClassSubjects",
  async (classId: string, { rejectWithValue, getState }) => {
    try {
      const res = await apiClient.get(`/api/proxy/subjects?classId=${classId}`);
      const data = res.data?.data || res.data || [];
      const allSubjects = Array.isArray(data) ? data : [];

      // CLIENT-SIDE FILTERING FOR ISOLATION
      // Only show subjects the teacher is actually assigned to in this class.
      const state: any = getState();
      const teacherClasses = state.teacher?.classes || [];
      
      // If no assignments loaded yet, we can't safely filter. 
      // But usually they are loaded. If explicit isolation is required, we should perhaps return empty or wait?
      // For robustness, if teacherClasses is empty, we might return all (assuming loading issue) OR empty (assuming no access).
      // Given "Isolation" priority: Return empty is safer, but "All" prevents UI breakage if state is missing.
      // Let's implement strict filtering if assignments exist.
      
      if (teacherClasses.length > 0) {
        // Collect authorized Subject IDs for this class
        const authorizedSubjectIds = new Set<string>();
        let hasClassLevelAccess = false;

        teacherClasses.forEach((tc: any) => {
          // If strictly Class Assignment (Class Teacher), maybe allow all?
          // For now, let's assume Class Teachers might see all.
          if (tc.type === "class_assignment" && (tc.classId === classId || tc.class?.id === classId)) {
             hasClassLevelAccess = true;
          }
          
          // Subject assignments
          if (tc.subjectId && (tc.classId === classId || tc.class?.id === classId)) {
            authorizedSubjectIds.add(tc.subjectId);
          }
        });
        
        if (hasClassLevelAccess) {
             console.log(`[fetchClassSubjects] Teacher has Class Assignment for ${classId}, showing all ${allSubjects.length} subjects.`);
             return allSubjects;
        }
        
        const filtered = allSubjects.filter((s: any) => authorizedSubjectIds.has(s.id));
        console.log(`[fetchClassSubjects] Filtered subjects for class ${classId}: ${filtered.length} / ${allSubjects.length}`);
        return filtered;
      }
      
      return allSubjects;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load subjects"
      );
    }
  }
);

// Fetch teacher's assigned subjects with class info (for authorization)
export const fetchTeacherSubjectsWithClasses = createAsyncThunk(
  "teacher/fetchTeacherSubjectsWithClasses",
  async (teacherId: string, { rejectWithValue }) => {
    try {
      // Per API docs: GET /subjects?teacherId=:id returns subjects with class info
      const res = await apiClient.get(`/api/proxy/subjects?teacherId=${teacherId}`);
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load teacher subjects"
      );
    }
  }
);

// Fetch individual student report card
export const fetchStudentReportCard = createAsyncThunk(
  "teacher/fetchStudentReportCard",
  async (
    params: { studentId: string; session: string; term: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/student/${params.studentId}/report-card?session=${encodeURIComponent(
          params.session
        )}&term=${encodeURIComponent(params.term)}`
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load report card"
      );
    }
  }
);

// Fetch class report summary (all students with averages, ranks)
export const fetchClassReportSummary = createAsyncThunk(
  "teacher/fetchClassReportSummary",
  async (
    params: { classId: string; session: string; term: string },
    { rejectWithValue }
  ) => {
    try {
      // Try booklet preview first as it has summary data
      const res = await apiClient.get(
        `/api/proxy/reports/class/${params.classId}/booklet-preview?session=${encodeURIComponent(
          params.session
        )}&term=${encodeURIComponent(params.term)}`
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load class report summary"
      );
    }
  }
);

// Generate and notify (email) report cards
export const generateAndNotifyReports = createAsyncThunk(
  "teacher/generateAndNotifyReports",
  async (
    params: { studentIds: string[]; session: string; term: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/proxy/reports/generate-and-notify", params);
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to generate and send reports"
      );
    }
  }
);

