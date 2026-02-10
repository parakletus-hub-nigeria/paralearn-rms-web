import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Subjects endpoints
// ---------------------------------------------------------------------------
const subjectsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/subjects (with optional include)
    getSubjects: builder.query<any[], void>({
      query: () => ({
        url: "/api/proxy/subjects?include=teachers,teacherAssignments",
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((s: any) => ({
                type: "Subject" as const,
                id: s.id,
              })),
              { type: "SubjectList" as const },
            ]
          : [{ type: "SubjectList" as const }],
    }),

    // GET /api/proxy/subjects?classId=...
    getSubjectsByClass: builder.query<any[], string>({
      query: (classId) => ({
        url: `/api/proxy/subjects?classId=${classId}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: (_r, _e, classId) => [
        { type: "SubjectList", id: `class-${classId}` },
      ],
    }),

    // GET /api/proxy/subjects?teacherId=...
    getSubjectsByTeacher: builder.query<any[], string>({
      query: (teacherId) => ({
        url: `/api/proxy/subjects?teacherId=${teacherId}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: (_r, _e, teacherId) => [
        { type: "SubjectList", id: `teacher-${teacherId}` },
      ],
    }),

    // POST /api/proxy/subjects
    createSubject: builder.mutation<
      any,
      { name: string; code?: string; classId: string; description?: string }
    >({
      query: (body) => ({
        url: "/api/proxy/subjects",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "SubjectList" }],
    }),

    // POST /api/proxy/subjects/:id/assign-teacher
    assignTeacherToSubject: builder.mutation<
      any,
      { subjectId: string; teacherId: string }
    >({
      query: ({ subjectId, teacherId }) => ({
        url: `/api/proxy/subjects/${subjectId}/assign-teacher`,
        method: "POST",
        data: { teacherId },
      }),
      invalidatesTags: (_r, _e, { subjectId }) => [
        { type: "Subject", id: subjectId },
        { type: "SubjectList" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubjectsQuery,
  useGetSubjectsByClassQuery,
  useGetSubjectsByTeacherQuery,
  useCreateSubjectMutation,
  useAssignTeacherToSubjectMutation,
} = subjectsApi;
