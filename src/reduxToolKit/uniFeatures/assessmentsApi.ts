import { uniApi } from "../api/uniBaseApi";

export const assessmentsApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /lecturer/assessments — list all assessments for the lecturer
    getUniAssessments: builder.query<any, void>({
      query: () => ({
        url: "/lecturer/assessments",
        method: "GET",
      }),
      providesTags: ["Assessment"],
    }),

    // GET /admin/assessments — list all assessments for the admin (university-wide)
    getAdminAssessments: builder.query<any, void>({
      query: () => ({
        url: "/admin/assessments",
        method: "GET",
      }),
      providesTags: ["Assessment"],
    }),

    // GET /lecturer/assessments/:id — single assessment details
    getUniAssessmentById: builder.query<any, string>({
      query: (id) => ({
        url: `/lecturer/assessments/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Assessment", id }],
    }),

    // POST /lecturer/assessments — create a new assessment
    createUniAssessment: builder.mutation<any, any>({
      query: (body) => ({
        url: "/lecturer/assessments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assessment"],
    }),

    // PATCH /lecturer/assessments/:id — update an assessment
    updateUniAssessment: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/lecturer/assessments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Assessment",
        { type: "Assessment", id },
      ],
    }),

    // DELETE /lecturer/assessments/:id — delete an assessment
    deleteUniAssessment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/lecturer/assessments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assessment"],
    }),

    // --- Student Endpoints ---
    getUpcomingAssessments: builder.query<any[], void>({
      query: () => "/student/assessments/upcoming",
      providesTags: ["Assessment"],
    }),

    // --- Lecturer Results & Grading ---
    getAssessmentResults: builder.query<any, string>({
      query: (id) => `/lecturer/assessments/${id}/results`,
      providesTags: ["Assessment"],
    }),

    getSubmission: builder.query<any, string>({
      query: (id) => `/lecturer/submissions/${id}`,
      providesTags: ["Assessment"],
    }),

    gradeSubmission: builder.mutation<any, { id: string; score: number }>({
      query: ({ id, score }) => ({
        url: `/lecturer/submissions/${id}/grade`,
        method: "PATCH",
        body: { score },
      }),
      invalidatesTags: ["Assessment"],
    }),

    publishResults: builder.mutation<any, { assessmentId: string }>({
      query: ({ assessmentId }) => ({
        url: "/lecturer/results/publish",
        method: "PATCH",
        body: { assessmentId },
      }),
      invalidatesTags: ["Assessment"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUniAssessmentsQuery,
  useGetAdminAssessmentsQuery,
  useGetUniAssessmentByIdQuery,
  useGetUpcomingAssessmentsQuery,
  useGetAssessmentResultsQuery,
  useGetSubmissionQuery,

  useCreateUniAssessmentMutation,
  useUpdateUniAssessmentMutation,
  useDeleteUniAssessmentMutation,
  useGradeSubmissionMutation,
  usePublishResultsMutation,
} = assessmentsApi;
