import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Comments endpoints
// ---------------------------------------------------------------------------
const commentsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/comments/my-comments?session=...&term=...
    getMyComments: builder.query<
      any[],
      { session: string; term: string }
    >({
      query: ({ session, term }) => ({
        url: `/api/proxy/comments/my-comments?session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: [{ type: "CommentList" }],
    }),

    // GET /api/proxy/comments/student/:id?session=...&term=...
    getStudentComments: builder.query<
      any[],
      { studentId: string; session: string; term: string }
    >({
      query: ({ studentId, session, term }) => ({
        url: `/api/proxy/comments/student/${studentId}?term=${encodeURIComponent(term)}&session=${encodeURIComponent(session)}`,
      }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: (_r, _e, { studentId }) => [
        { type: "CommentList", id: studentId },
      ],
    }),

    // POST /api/proxy/comments
    addComment: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/comments",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "CommentList" }],
    }),

    // POST /api/proxy/comments/bulk
    bulkAddComments: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/comments/bulk",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "CommentList" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyCommentsQuery,
  useGetStudentCommentsQuery,
  useAddCommentMutation,
  useBulkAddCommentsMutation,
} = commentsApi;
