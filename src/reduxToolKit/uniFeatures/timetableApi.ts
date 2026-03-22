import { uniApi } from "../api/uniBaseApi";

export const timetableApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    createTimetableEntry: builder.mutation<
      any,
      {
        courseId: string;
        lecturerId: string;
        hallId: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
      }
    >({
      query: (body) => ({
        url: "/admin/timetable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Timetable"],
    }),
    getStudentTimetable: builder.query<any, void>({
      query: () => ({
        url: "/student/timetable",
        method: "GET",
      }),
      providesTags: ["Timetable"],
    }),
    getAdminTimetable: builder.query<
      any,
      { facultyId?: string; departmentId?: string } | void
    >({
      query: (params) => ({
        url: "/admin/timetable",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Timetable"],
    }),
    getLecturerTimetable: builder.query<any, { lecturerId?: string } | void>({
      query: (params) => {
        // GET requests cannot carry a body reliably; use query string instead
        const lecturerId = (params as any)?.lecturerId;
        return {
          url: lecturerId
            ? `/lecturer/timetable?lecturerId=${encodeURIComponent(lecturerId)}`
            : "/lecturer/timetable",
          method: "GET",
        };
      },
      providesTags: ["Timetable"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateTimetableEntryMutation,
  useGetAdminTimetableQuery,
  useGetStudentTimetableQuery,
  useGetLecturerTimetableQuery,
  useLazyGetLecturerTimetableQuery,
} = timetableApi;
