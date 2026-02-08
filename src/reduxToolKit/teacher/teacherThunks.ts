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
        if (Array.isArray(c.subjects)) {
          c.subjects.forEach((s: any) => assignedSubjectIds.add(s.id || s));
        }
      });

      console.log("[fetchMyAssessments] fetching via status endpoints (started, ended, not_started)...");

      // Strategy: Fetch all 3 statuses in parallel as requested by user
      // Endpoint: /api/proxy/assessments/:status
      const statuses: Array<"started" | "ended" | "not_started"> = ["started", "ended", "not_started"];
      
      const results = await Promise.all(
        statuses.map(async (status) => {
          try {
             console.log(`[fetchMyAssessments] Fetching /assessments/${status}...`);
             const res = await apiClient.get(`/api/proxy/assessments/${status}`);
             const data = res.data?.data || res.data || [];
             console.log(`[fetchMyAssessments] /assessments/${status} returned ${Array.isArray(data) ? data.length : 0} items`);
             if (Array.isArray(data)) return data;
             return [];
          } catch (e: any) {
             console.error(`[fetchMyAssessments] Failed to fetch /assessments/${status}:`, e?.message);
             return [];
          }
        })
      );

      // Combine all raw results. Note: These might be Grouped objects or Assessment objects.
      const rawCombined = results.flat();
      
      if (rawCombined.length === 0) {
         console.warn("[fetchMyAssessments] No assessments found across all statuses.");
         return [];
      }

      // Check for Grouped Structure (Subject -> Assessments)
      // Structure: [ { name: "Subject", class: {...}, assessments: [...] }, ... ]
      const isGrouped = rawCombined.some((item: any) => item.assessments && Array.isArray(item.assessments));
      
      let items: Assessment[] = [];

      if (isGrouped) {
         console.log("[fetchMyAssessments] Detected grouped response structure in status fetch");
         const flattened: Assessment[] = [];
         
         rawCombined.forEach((group: any) => {
           if (group.assessments && Array.isArray(group.assessments)) {
             group.assessments.forEach((assess: any) => {
               flattened.push({
                 ...assess,
                 // Prioritize group info but fallback to assessment info
                 classId: group.class?.id || assess.classId,
                 subjectId: group.id || group.subjectId || assess.subjectId, // Use group.id as subjectId if available
                 subject: { 
                    id: group.id || group.subjectId || group.code || "unknown", 
                    name: group.name || "Unknown Subject",
                    code: group.code || group.subjectCode
                 },
                 class: group.class || { id: group.class?.id, name: "Unknown Class" },
                 // Ensure critical UI fields
                 title: assess.title || "Untitled Assessment",
                 totalMarks: assess.totalMarks,
                 duration: assess.duration,
                 status: assess.status || "active",
                 isOnline: assess.assessmentType === "online" || assess.isOnline,
               });
             });
           }
         });
         items = flattened;
         console.log(`[fetchMyAssessments] Flattened ${rawCombined.length} groups into ${items.length} assessments`);
      } else {
         items = rawCombined as Assessment[];
      }

      // FINAL NORMALIZATION: Ensure every item has classId/subjectId matching UI expectations
      items = items.map((a: any) => ({
         ...a,
         classId: a.classId || a.class?.id || a.class?._id,
         subjectId: a.subjectId || a.subject?.id || a.subject?._id,
         // Ensure objects exist too for display
         class: a.class || (a.className ? { name: a.className } : undefined),
         subject: a.subject || (a.subjectName ? { name: a.subjectName } : undefined),
      }));


      // Deduplicate by ID (in case same assessment appears in multiple statuses? Unlikely but safe)
      const byId = new Map<string, Assessment>();
      for (const a of items) {
        if (a?.id) byId.set(a.id, a);
      }
      return Array.from(byId.values());

    } catch (e: any) {
      // Global error handler
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

      // Attempt 1: GET /classes/:id (Primary for Teachers now, acts as Class View)
      try {
        console.log("[fetchClassStudents] calling /classes/:id endpoint...");
        const classRes = await apiClient.get(`/api/proxy/classes/${classId}`);
        const classData = classRes.data?.data || classRes.data || {};
        
        // Extract from classData based on user provided structure
        if (classData.students && Array.isArray(classData.students)) {
           students = classData.students;
           console.log("[fetchClassStudents] Found students in class.students:", students.length);
           return students; // Return immediately if successful
        } else if (classData.enrollments && Array.isArray(classData.enrollments)) {
           students = classData.enrollments.map((e: any) => e.student || e).filter((s:any) => s && (s.id || s.firstName));
           console.log("[fetchClassStudents] Found students in enrollments:", students.length);
           return students;
        }
      } catch (classErr: any) {
        console.warn("[fetchClassStudents] /classes endpoint failed:", classErr?.message);
        // Continue to fallback
      }

      // Attempt 2: GET /users (Fallback)
      try {
        console.log("[fetchClassStudents] Fallback: calling /users endpoint...");
        const usersRes = await apiClient.get(`/api/proxy/users?classId=${classId}&role=student`);
        const usersData = usersRes.data?.data || usersRes.data || [];
        
        if (Array.isArray(usersData) && usersData.length > 0) {
           students = usersData;
           console.log(`[fetchClassStudents] Successfully fetched ${students.length} students from /users`);
        }
      } catch (userErr: any) {
         console.warn("[fetchClassStudents] /users endpoint failed:", userErr?.message);
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

      // Filter by Class ID to ensure we only show subjects for the selected class
      // regardless of what the API returns.
      const filteredByClass = allSubjects.filter((s: any) => 
        s.classId === classId || s.class?.id === classId
      );
      
      console.log(`[fetchClassSubjects] Filtered ${allSubjects.length} subjects to ${filteredByClass.length} for class ${classId}`);
      return filteredByClass;
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
        )}&term=${encodeURIComponent(params.term)}`,
        { skipGlobalRedirect: true } as any
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

export const fetchAssessmentCategories = createAsyncThunk(
  "teacher/fetchAssessmentCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/assessment-categories");
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load assessment categories"
      );
    }
  }
);

export const updateTeacherAssessment = createAsyncThunk(
  "teacher/updateTeacherAssessment",
  async (
    params: { id: string; data: Partial<Assessment> },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(
        `/api/proxy/assessments/${params.id}`,
        params.data
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to update assessment"
      );
    }
  }
);

export const bulkUploadQuestions = createAsyncThunk(
  "teacher/bulkUploadQuestions",
  async (payload: { assessmentId: string; file: File }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", payload.file);
      const res = await apiClient.post(
        `/api/proxy/assessments/${payload.assessmentId}/questions/bulk`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data?.data || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to upload questions"
      );
    }
  }
);

// Fetch generated report cards for a class (for Download tab)
export const fetchClassReportCards = createAsyncThunk(
  "teacher/fetchClassReportCards",
  async (params: { classId?: string; session?: string; term?: string }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.classId) query.set("classId", params.classId);
      if (params.session) query.set("session", params.session);
      if (params.term) query.set("term", params.term);
      
      const res = await apiClient.get(`/api/proxy/reports/report-cards?${query}`);
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to load report cards"
      );
    }
  }
);

