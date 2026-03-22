import { uniApi } from "../api/uniBaseApi";

export const adminApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<any, void>({
      query: () => ({ url: "/admin/stats", method: "GET" }),
    }),
    getSessions: builder.query<any, void>({
      query: () => ({ url: "/admin/sessions", method: "GET" }),
      providesTags: ["Session"],
    }),
    createSession: builder.mutation<
      any,
      { name: string; semester: number; endDate?: string }
    >({
      query: (body) => ({ url: "/admin/sessions", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    activateSession: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/sessions/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Session"],
    }),

    getUniUsers: builder.query<
      any,
      { page?: number; limit?: number; search?: string; role?: string }
    >({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    getAuditLogs: builder.query<any, void>({
      query: () => ({ url: "/admin/audit-logs", method: "GET" }),
    }),
    getLecturerAssessments: builder.query<any, void>({
      query: () => ({ url: "/lecturer/assessments", method: "GET" }),
      providesTags: ["Assessment"],
    }),

    getEnrollments: builder.query<any, { courseId?: string }>({
      query: (params) => ({ url: "/admin/enrollments", method: "GET", params }),
      providesTags: ["Course"],
    }),
    bulkEnroll: builder.mutation<
      any,
      { studentIds: string[]; courseId: string }
    >({
      query: (body) => ({
        url: "/admin/enrollments/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),

    importFaculties: builder.mutation<any, { csvText: string }>({
      query: (body) => ({
        url: "/admin/curriculum/import/faculties",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Faculty"],
    }),
    importDepartments: builder.mutation<any, { csvText: string }>({
      query: (body) => ({
        url: "/admin/curriculum/import/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),
    importCourses: builder.mutation<any, { csvText: string }>({
      query: (body) => ({
        url: "/admin/curriculum/import/courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminStatsQuery,
  useGetSessionsQuery,
  useCreateSessionMutation,
  useActivateSessionMutation,
  useGetUniUsersQuery,
  useGetAuditLogsQuery,
  useGetLecturerAssessmentsQuery,
  useGetEnrollmentsQuery,
  useBulkEnrollMutation,
  useImportFacultiesMutation,
  useImportDepartmentsMutation,
  useImportCoursesMutation,
} = adminApi;
