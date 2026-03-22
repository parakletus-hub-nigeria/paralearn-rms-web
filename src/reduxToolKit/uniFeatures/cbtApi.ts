import { uniApi } from "../api/uniBaseApi";

export const cbtApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /lecturer/assessments/:assessmentId/results (with essay answers)
    getExamResults: builder.query<any, string>({
      query: (assessmentId) => ({
        url: `/lecturer/assessments/${assessmentId}/results`,
        method: "GET",
      }),
      providesTags: ["Assessment"],
    }),

    // POST /student/assessments/:assessmentId/start
    // Body: { deviceId } only — studentId is derived from JWT, do NOT include it
    startExam: builder.mutation<
      any,
      { assessmentId: string; deviceId: string }
    >({
      query: ({ assessmentId, deviceId }) => ({
        url: `/student/assessments/${assessmentId}/start`,
        method: "POST",
        body: { deviceId },
      }),
    }),

    // POST /student/assessments/:assessmentId/heartbeat — ping every 20s to keep exam token alive
    // Body: { deviceId } — studentId derived from JWT
    sendCbtHeartbeat: builder.mutation<
      any,
      { assessmentId: string; deviceId: string }
    >({
      query: ({ assessmentId, deviceId }) => ({
        url: `/student/assessments/${assessmentId}/heartbeat`,
        method: "POST",
        body: { deviceId },
      }),
    }),

    // POST /student/assessments/:assessmentId/submit
    // studentId is derived from JWT — do NOT include it in the body
    submitExam: builder.mutation<
      any,
      {
        assessmentId: string;
        answers: Array<
          | { questionId: string; selectedOptionId: string }
          | { questionId: string; textAnswer: string }
        >;
        proctoringFlags?: Array<{
          type: string;
          occurredAt: string;
          meta?: any;
        }>;
      }
    >({
      query: ({ assessmentId, answers, proctoringFlags }) => ({
        url: `/student/assessments/${assessmentId}/submit`,
        method: "POST",
        body: { answers, proctoringFlags },
      }),
      invalidatesTags: ["Assessment"],
    }),

    // GET /cbt/attempt/:attemptId — poll grading result when gradingStatus is PENDING
    getAttemptResult: builder.query<any, string>({
      query: (attemptId) => ({
        url: `/cbt/attempt/${attemptId}`,
        method: "GET",
      }),
      providesTags: ["Assessment"],
    }),

    // GET /cbt/student/:studentId/attempts — student's full exam history
    getStudentExamHistory: builder.query<any, string>({
      query: (studentId) => ({
        url: `/cbt/student/${studentId}/attempts`,
        method: "GET",
      }),
      providesTags: ["Assessment"],
    }),

    // GET /student/results — student's graded results
    getStudentResults: builder.query<any, void>({
      query: () => ({ url: "/student/results", method: "GET" }),
      providesTags: ["Assessment"],
    }),

    // POST /lecturer/assessments/:assessmentId/grade/:attemptId
    gradeAttempt: builder.mutation<
      any,
      {
        assessmentId: string;
        attemptId: string;
        scores: Array<{ questionId: string; score: number }>;
        feedback?: string;
      }
    >({
      query: ({ assessmentId, attemptId, scores, feedback }) => ({
        url: `/lecturer/assessments/${assessmentId}/grade/${attemptId}`,
        method: "POST",
        body: { scores, feedback },
      }),
      invalidatesTags: ["Assessment"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamResultsQuery,
  useStartExamMutation,
  useSendCbtHeartbeatMutation,
  useSubmitExamMutation,
  useGetAttemptResultQuery,
  useLazyGetAttemptResultQuery,
  useGetStudentExamHistoryQuery,
  useGetStudentResultsQuery,
  useGradeAttemptMutation,
} = cbtApi;
