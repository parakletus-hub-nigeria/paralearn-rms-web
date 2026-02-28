import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Reports endpoints
// ---------------------------------------------------------------------------
const reportsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/reports/school/statistics?session=...&term=...
    getSchoolStatistics: builder.query<
      any,
      { session: string; term: string }
    >({
      query: ({ session, term }) => ({
        url: `/api/proxy/reports/school/statistics?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
      }),
      providesTags: [{ type: "Statistics" }],
    }),

    // GET /api/proxy/reports/approval-queue?status=...
    getApprovalQueue: builder.query<any[], string | void>({
      query: (status = "pending") => ({
        url: `/api/proxy/reports/approval-queue?status=${encodeURIComponent(status as string)}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: [{ type: "ApprovalQueue" }],
    }),

    // GET /api/proxy/reports/class/:id/booklet-preview?session=...&term=...
    getBookletPreview: builder.query<
      any,
      { classId: string; session: string; term: string }
    >({
      query: ({ classId, session, term }) => ({
        url: `/api/proxy/reports/class/${classId}/booklet-preview?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
      }),
      providesTags: (_r, _e, { classId }) => [
        { type: "BookletPreview", id: classId },
      ],
    }),

    // GET /api/proxy/reports/student/:id/report-card?session=...&term=...
    getStudentReportCard: builder.query<
      any,
      { studentId: string; session: string; term: string }
    >({
      query: ({ studentId, session, term }) => ({
        url: `/api/proxy/reports/student/${studentId}/report-card?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
      }),
      providesTags: (_r, _e, { studentId }) => [
        { type: "ReportCard", id: studentId },
      ],
    }),

    // GET /api/proxy/reports/report-cards?classId=...&session=...&term=...
    getReportCards: builder.query<
      any[],
      { classId?: string; session?: string; term?: string }
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.classId) q.set("classId", params.classId);
        if (params.session) q.set("session", params.session);
        if (params.term) q.set("term", params.term);
        return { url: `/api/proxy/reports/report-cards?${q.toString()}` };
      },
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: [{ type: "ReportCard", id: "LIST" }],
    }),

    // POST /api/proxy/reports/approve
    approveReports: builder.mutation<
      any,
      {
        action: "approve" | "reject" | "publish";
        reportCardIds: string[];
        rejectionReason?: string;
      }
    >({
      query: (body) => ({
        url: "/api/proxy/reports/approve",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: "ApprovalQueue" },
        { type: "ReportCard", id: "LIST" },
      ],
    }),

    // POST /api/proxy/reports/submit-for-approval
    submitForApproval: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/reports/submit-for-approval",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "ApprovalQueue" }],
    }),

    // POST /api/proxy/reports/generate-and-notify
    generateAndNotify: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/reports/generate-and-notify",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: "ReportCard", id: "LIST" },
        { type: "Report" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSchoolStatisticsQuery,
  useGetApprovalQueueQuery,
  useGetBookletPreviewQuery,
  useGetStudentReportCardQuery,
  useGetReportCardsQuery,
  useApproveReportsMutation,
  useSubmitForApprovalMutation,
  useGenerateAndNotifyMutation,
} = reportsApi;
