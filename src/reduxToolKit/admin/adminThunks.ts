import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";

// ---------- Types ----------
export type ClassItem = {
  id: string;
  name: string;
  level?: string;
  stream?: string;
  capacity?: number;
  academicYear?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type SubjectItem = {
  id: string;
  name: string;
  code?: string;
  classId?: string;
  description?: string;
  teacherId?: string;
  createdAt?: string;
};

export type AssessmentItem = {
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
};

export type SchoolStatistics = {
  overview?: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    averageScore: number;
    passRate: number;
  };
  gradeDistribution?: Record<string, number>;
};

export type ApprovalQueueItem = any;

export interface BookletPreviewStudent {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  totalScore: number;
  possibleScore: number;
  average: number;
  overallGrade: string;
  subjectCount: number;
  subjectsSubmitted: number;
  reportStatus?: string | null;
}

export interface BookletPreviewResponse {
  className: string;
  session: string;
  term: string;
  totalStudents: number;
  studentsWithScores: number;
  students: BookletPreviewStudent[];
  reportProgress: {
    totalSubjects: number;
    subjectsSubmitted: number;
    percentage: number;
  };
}

// ---------- Helpers ----------
const unwrap = (res: any) => res?.data?.data ?? res?.data ?? null;

// ---------- Admin: Classes ----------
export const fetchClasses = createAsyncThunk(
  "admin/fetchClasses",
  async (params: { level?: string; isActive?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const q = new URLSearchParams();
      if (params?.level) q.set("level", params.level);
      if (typeof params?.isActive === "boolean") q.set("isActive", String(params.isActive));
      const res = await apiClient.get(`/api/proxy/classes${q.toString() ? `?${q}` : ""}`);
      const data = unwrap(res) || [];
      return Array.isArray(data) ? (data as ClassItem[]) : [];
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch classes");
    }
  }
);

export const createClass = createAsyncThunk(
  "admin/createClass",
  async (
    payload: { name: string; level?: number; stream?: string; capacity?: number; academicYear?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/proxy/classes", payload);
      return unwrap(res) as ClassItem;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to create class");
    }
  }
);

export const assignTeacherToClass = createAsyncThunk(
  "admin/assignTeacherToClass",
  async (payload: { classId: string; teacherId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/api/proxy/classes/${payload.classId}/teachers`, {
        teacherId: payload.teacherId,
      });
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to assign teacher");
    }
  }
);

export const enrollStudentToClass = createAsyncThunk(
  "admin/enrollStudentToClass",
  async (payload: { classId: string; studentId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/api/proxy/classes/${payload.classId}/enroll`, {
        studentId: payload.studentId,
      });
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to enroll student");
    }
  }
);

// Fetch class details with enrolled students and teacher assignments
export const fetchClassDetails = createAsyncThunk(
  "admin/fetchClassDetails",
  async (classId: string, { rejectWithValue }) => {
    try {
      // Fetch class details
      const classRes = await apiClient.get(`/api/proxy/classes/${classId}`);
      const classData = unwrap(classRes) || classRes.data || {};
      console.log("[fetchClassDetails] Class data:", classData);

      // Also fetch subjects for this class to get subject teachers
      let subjectTeachers: any[] = [];
      try {
        const subjectsRes = await apiClient.get(`/api/proxy/subjects?classId=${classId}`);
        const subjects = unwrap(subjectsRes) || subjectsRes.data || [];
        console.log("[fetchClassDetails] Subjects for class:", subjects);
        
        // Extract teachers from subjects
        if (Array.isArray(subjects)) {
          for (const subject of subjects) {
            const teachers = subject.teacherAssignments || subject.teachers || [];
            if (Array.isArray(teachers)) {
              for (const ta of teachers) {
                const teacher = ta.teacher || ta;
                if (teacher && teacher.id) {
                  // Add subject info to teacher
                  subjectTeachers.push({
                    ...ta,
                    teacher: { ...teacher, subjectName: subject.name },
                    subjectId: subject.id,
                    subjectName: subject.name,
                    type: "subject_teacher"
                  });
                }
              }
            }
          }
        }
      } catch (subjectErr) {
        console.log("[fetchClassDetails] Could not fetch subjects:", subjectErr);
      }

      // Merge class teachers with subject teachers
      const classTeachers = classData.teacherAssignments || classData.teachers || [];
      const allTeachers = [
        ...classTeachers.map((t: any) => ({ ...t, type: "class_teacher" })),
        ...subjectTeachers
      ];

      // Deduplicate teachers by ID
      const teacherMap = new Map();
      for (const t of allTeachers) {
        const teacherId = t.teacher?.id || t.id;
        if (teacherId && !teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, t);
        }
      }

      const result = {
        ...classData,
        teacherAssignments: Array.from(teacherMap.values()),
        subjectTeachers: subjectTeachers,
      };
      
      console.log("[fetchClassDetails] Final result with teachers:", result);
      return result;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch class details");
    }
  }
);

// Bulk enroll multiple students to a class
// Note: TEACHER_ADMIN_GUIDE uses /enroll with single studentId, Vaniah docs uses /students with array
export const bulkEnrollStudents = createAsyncThunk(
  "admin/bulkEnrollStudents",
  async (payload: { classId: string; studentIds: string[] }, { rejectWithValue }) => {
    try {
      // Try bulk endpoint first (Vaniah docs: POST /classes/:classId/students)
      try {
        const res = await apiClient.post(`/api/proxy/classes/${payload.classId}/students`, {
          studentIds: payload.studentIds,
        });
        return unwrap(res);
      } catch (bulkError: any) {
        // If bulk endpoint fails (404), try single enrollment endpoint (TEACHER_ADMIN_GUIDE: POST /classes/:classId/enroll)
        if (bulkError?.response?.status === 404) {
          console.log("[bulkEnrollStudents] Bulk endpoint not found, trying individual enrollments");
          const results = [];
          for (const studentId of payload.studentIds) {
            try {
              const res = await apiClient.post(`/api/proxy/classes/${payload.classId}/enroll`, {
                studentId,
              });
              results.push(unwrap(res));
            } catch (singleError: any) {
              console.log(`[bulkEnrollStudents] Failed to enroll student ${studentId}:`, singleError?.message);
            }
          }
          return { 
            success: true, 
            message: `${results.length} students enrolled`, 
            enrolledCount: results.length 
          };
        }
        throw bulkError;
      }
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to enroll students");
    }
  }
);

// Remove student from class
export const removeStudentFromClass = createAsyncThunk(
  "admin/removeStudentFromClass",
  async (payload: { classId: string; studentId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/api/proxy/classes/${payload.classId}/enroll/${payload.studentId}`);
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to remove student");
    }
  }
);

// Fetch teacher's assigned classes (for admin to view)
export const fetchTeacherAssignedClasses = createAsyncThunk(
  "admin/fetchTeacherAssignedClasses",
  async (teacherId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/reports/teacher/${teacherId}/classes`);
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch teacher classes");
    }
  }
);

// Remove teacher from class
export const removeTeacherFromClass = createAsyncThunk(
  "admin/removeTeacherFromClass",
  async (payload: { classId: string; teacherId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/api/proxy/classes/${payload.classId}/teachers/${payload.teacherId}`);
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to remove teacher");
    }
  }
);

// ---------- Admin: Subjects ----------
export const fetchSubjects = createAsyncThunk(
  "admin/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      // Try fetching with include parameters to get teacher assignments
      let res;
      try {
        res = await apiClient.get("/api/proxy/subjects?include=teachers,teacherAssignments");
      } catch (e) {
        // Fallback to basic endpoint
        res = await apiClient.get("/api/proxy/subjects");
      }
      const data = unwrap(res) || [];
      console.log("[fetchSubjects] Raw response:", res.data);
      console.log("[fetchSubjects] Unwrapped data:", data);
      // Log first subject to see structure
      if (Array.isArray(data) && data.length > 0) {
        console.log("[fetchSubjects] First subject structure:", JSON.stringify(data[0], null, 2));
      }
      return Array.isArray(data) ? (data as SubjectItem[]) : [];
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch subjects");
    }
  }
);

export const createSubject = createAsyncThunk(
  "admin/createSubject",
  async (
    payload: { name: string; code?: string; classId: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/proxy/subjects", payload);
      return unwrap(res) as SubjectItem;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to create subject");
    }
  }
);

export const assignTeacherToSubject = createAsyncThunk(
  "admin/assignTeacherToSubject",
  async (payload: { subjectId: string; teacherId: string }, { rejectWithValue }) => {
    try {
      // Try the documented endpoint (TEACHER_ADMIN_GUIDE: /assign-teacher, Vaniah: /teachers)
      // First try /assign-teacher, fallback to /teachers if needed
      let res;
      try {
        res = await apiClient.post(`/api/proxy/subjects/${payload.subjectId}/assign-teacher`, {
          teacherId: payload.teacherId,
        });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          // Fallback to /teachers endpoint
          res = await apiClient.post(`/api/proxy/subjects/${payload.subjectId}/teachers`, {
            teacherId: payload.teacherId,
          });
        } else {
          throw e;
        }
      }
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to assign teacher");
    }
  }
);

// ---------- Admin: Assessments ----------
export const fetchAssessments = createAsyncThunk(
  "admin/fetchAssessments",
  async (_, { rejectWithValue }) => {
    try {
      // Backend supports GET /assessments/:status.
      // For "All", fetch all statuses and merge.
      const statuses: Array<"started" | "ended" | "not_started"> = [
        "started",
        "ended",
        "not_started",
      ];

      const results = await Promise.all(
        statuses.map(async (status) => {
          try {
            const res = await apiClient.get(`/api/proxy/assessments/${status}`);
            const data = unwrap(res) || [];
            return Array.isArray(data) ? (data as AssessmentItem[]) : [];
          } catch (e: any) {
            // Fallback if backend expects query param instead of path
            if (e?.response?.status === 404) {
              const res = await apiClient.get(`/api/proxy/assessments?status=${status}`);
              const data = unwrap(res) || [];
              return Array.isArray(data) ? (data as AssessmentItem[]) : [];
            }
            throw e;
          }
        })
      );

      const merged = results.flat();
      const byId = new Map<string, AssessmentItem>();
      for (const a of merged) {
        if (a?.id) byId.set(a.id, a);
      }
      return Array.from(byId.values());
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch assessments");
    }
  }
);

export const createAssessment = createAsyncThunk(
  "admin/createAssessment",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/assessments", payload);
      return unwrap(res) as AssessmentItem;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to create assessment");
    }
  }
);

export const updateAssessment = createAsyncThunk(
  "admin/updateAssessment",
  async (payload: { assessmentId: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/api/proxy/assessments/${payload.assessmentId}`, payload.data);
      return unwrap(res) as AssessmentItem;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to update assessment");
    }
  }
);

export const publishAssessmentAdmin = createAsyncThunk(
  "admin/publishAssessment",
  async (payload: { assessmentId: string; publish: boolean }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/api/proxy/assessments/${payload.assessmentId}/publish`, {
        publish: payload.publish,
      });
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to publish assessment");
    }
  }
);

export const bulkUploadQuestions = createAsyncThunk(
  "admin/bulkUploadQuestions",
  async (payload: { assessmentId: string; file: File }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", payload.file);
      const res = await apiClient.post(
        `/api/proxy/assessments/${payload.assessmentId}/questions/bulk`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to upload questions");
    }
  }
);

// ---------- Admin: Scores ----------
export const fetchScoresByAssessment = createAsyncThunk(
  "admin/fetchScoresByAssessment",
  async (assessmentId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/scores/assessment/${assessmentId}`);
      const data = unwrap(res) || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch scores");
    }
  }
);

export const bulkUploadScores = createAsyncThunk(
  "admin/bulkUploadScores",
  async (payload: { assessmentId: string; file: File }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("file", payload.file);
      const res = await apiClient.post(
        `/api/proxy/scores/bulk?assessmentId=${encodeURIComponent(payload.assessmentId)}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to upload scores");
    }
  }
);

// ---------- Admin: Reports ----------
export const fetchSchoolStatistics = createAsyncThunk(
  "admin/fetchSchoolStatistics",
  async (params: { session: string; term: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/school/statistics?session=${encodeURIComponent(params.session)}&term=${encodeURIComponent(
          params.term
        )}`
      );
      return (unwrap(res) || res.data) as SchoolStatistics;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch statistics");
    }
  }
);

export const fetchApprovalQueue = createAsyncThunk(
  "admin/fetchApprovalQueue",
  async (status: string = "pending", { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/reports/approval-queue?status=${encodeURIComponent(status)}`);
      const data = unwrap(res) || [];
      return Array.isArray(data) ? (data as ApprovalQueueItem[]) : [];
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch approval queue");
    }
  }
);

export const approveReports = createAsyncThunk(
  "admin/approveReports",
  async (
    payload: { action: "approve" | "reject" | "publish"; reportCardIds: string[]; rejectionReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/proxy/reports/approve", payload);
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to update reports");
    }
  }
);

export const fetchBookletPreviewAdmin = createAsyncThunk(
  "admin/fetchBookletPreviewAdmin",
  async (params: { classId: string; session: string; term: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/reports/class/${params.classId}/booklet-preview?session=${encodeURIComponent(
          params.session
        )}&term=${encodeURIComponent(params.term)}`
      );
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch booklet preview");
    }
  }
);

// ---------- Admin: School Settings (Guide section 11) ----------
export const fetchSchoolSettings = createAsyncThunk(
  "admin/fetchSchoolSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/school-settings");
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch school settings"
      );
    }
  }
);

export const updateSchoolSettings = createAsyncThunk(
  "admin/updateSchoolSettings",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.put("/api/proxy/school-settings", payload);
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to update school settings"
      );
    }
  }
);

export const fetchGradingTemplates = createAsyncThunk(
  "admin/fetchGradingTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/school-settings/grading/templates");
      const data = unwrap(res) || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch grading templates"
      );
    }
  }
);

export const fetchGradingSystem = createAsyncThunk(
  "admin/fetchGradingSystem",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/school-settings/grading");
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch grading system"
      );
    }
  }
);

export const updateGradingSystem = createAsyncThunk(
  "admin/updateGradingSystem",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.put("/api/proxy/school-settings/grading", payload);
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to update grading system"
      );
    }
  }
);

// ---------- Attendance (Guide section 13) ----------
export const recordAttendance = createAsyncThunk(
  "admin/recordAttendance",
  async (
    payload: { studentId: string; session: string; term: string; daysPresent: number; totalDays: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/api/proxy/attendance", payload);
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to record attendance"
      );
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  "admin/fetchAttendance",
  async (
    params: { studentId?: string; classId?: string; session: string; term: string },
    { rejectWithValue }
  ) => {
    try {
      const q = new URLSearchParams();
      if (params.studentId) q.set("studentId", params.studentId);
      if (params.classId) q.set("classId", params.classId);
      q.set("session", params.session);
      q.set("term", params.term);
      const res = await apiClient.get(`/api/proxy/attendance?${q.toString()}`);
      const data = unwrap(res) || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch attendance"
      );
    }
  }
);

// ---------- Comments (Guide section 12) ----------
export const addCommentAdmin = createAsyncThunk(
  "admin/addCommentAdmin",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/comments", payload);
      return unwrap(res) || res.data || payload;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to add comment");
    }
  }
);

export const bulkAddComments = createAsyncThunk(
  "admin/bulkAddComments",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/comments/bulk", payload);
      return unwrap(res) || res.data || null;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to bulk add comments");
    }
  }
);

export const fetchStudentComments = createAsyncThunk(
  "admin/fetchStudentComments",
  async (params: { studentId: string; session: string; term: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(
        `/api/proxy/comments/student/${params.studentId}?term=${encodeURIComponent(params.term)}&session=${encodeURIComponent(
          params.session
        )}`
      );
      const data = unwrap(res) || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch student comments"
      );
    }
  }
);

// ---------- Admin: Assessment Categories ----------
export const fetchAssessmentCategoriesMap = createAsyncThunk(
  "admin/fetchAssessmentCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/proxy/assessment-categories");
      const data = unwrap(res) || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to fetch assessment categories");
    }
  }
);

export const createAssessmentCategory = createAsyncThunk(
  "admin/createAssessmentCategory",
  async (payload: { name: string; code: string; weight: number; description?: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/proxy/assessment-categories", payload);
      return unwrap(res);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to create assessment category");
    }
  }
);

export const deleteAssessmentCategory = createAsyncThunk(
  "admin/deleteAssessmentCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/proxy/assessment-categories/${id}`);
      return id;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || e?.message || "Failed to delete assessment category");
    }
  }
);

// Fetch students by class using /users endpoint
export const fetchStudentsByClass = createAsyncThunk(
  "admin/fetchStudentsByClass",
  async (params: { classId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/proxy/users?classId=${params.classId}&role=student`);
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || e?.message || "Failed to fetch students"
      );
    }
  }
);

// Fetch generated report cards for a class
export const fetchClassReportCards = createAsyncThunk(
  "admin/fetchClassReportCards",
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
