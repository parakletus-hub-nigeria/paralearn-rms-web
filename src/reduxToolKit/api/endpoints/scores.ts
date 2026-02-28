import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Scores endpoints
// ---------------------------------------------------------------------------
const scoresApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/scores/assessment/:assessmentId
    getScoresByAssessment: builder.query<any[], string>({
      query: (assessmentId) => ({
        url: `/api/proxy/scores/assessment/${assessmentId}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: (_r, _e, id) => [
        { type: "ScoreList", id },
      ],
    }),

    // POST /api/proxy/assessments/:id/scores
    submitScores: builder.mutation<
      any,
      { assessmentId: string; scores: any[] }
    >({
      query: ({ assessmentId, ...body }) => ({
        url: `/api/proxy/assessments/${assessmentId}/scores`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_r, _e, { assessmentId }) => [
        { type: "ScoreList", id: assessmentId },
      ],
    }),

    // POST /api/proxy/scores/bulk?assessmentId=...
    bulkUploadScores: builder.mutation<
      any,
      { assessmentId: string; file: File }
    >({
      query: ({ assessmentId, file }) => {
        const form = new FormData();
        form.append("file", file);
        return {
          url: `/api/proxy/scores/bulk?assessmentId=${encodeURIComponent(assessmentId)}`,
          method: "POST",
          data: form,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
      invalidatesTags: (_r, _e, { assessmentId }) => [
        { type: "ScoreList", id: assessmentId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetScoresByAssessmentQuery,
  useSubmitScoresMutation,
  useBulkUploadScoresMutation,
} = scoresApi;
