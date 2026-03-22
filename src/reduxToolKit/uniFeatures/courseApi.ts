import { uniApi } from "../api/uniBaseApi";

export const courseApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation<
      any,
      { code: string; title: string; creditUnits: number; departmentId: string }
    >({
      query: (body) => ({
        url: "/admin/courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
    getCourses: builder.query<any, void>({
      query: () => ({
        url: "/admin/courses",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    getEnrolledCourses: builder.query<any, void>({
      query: () => ({
        url: "/student/courses/enrolled",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    // GET /student/courses — all courses with isEnrolled flag for the student
    getAllCoursesWithStatus: builder.query<any, void>({
      query: () => ({
        url: "/student/courses",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    // POST /student/courses/:courseId/enroll — single course enroll
    enrollSingleCourse: builder.mutation<any, string>({
      query: (courseId) => ({
        url: `/student/courses/${courseId}/enroll`,
        method: "POST",
      }),
      invalidatesTags: ["Course", "Timetable"],
    }),
    // DELETE /student/courses/:courseId/enroll — single course drop
    dropSingleCourse: builder.mutation<any, string>({
      query: (courseId) => ({
        url: `/student/courses/${courseId}/enroll`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course", "Timetable"],
    }),
    // POST /student/courses/enroll — bulk enroll
    enrollCourses: builder.mutation<any, { courseIds: string[] }>({
      query: (body) => ({
        url: "/student/courses/enroll",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course", "Timetable"],
    }),
    // POST /student/courses/drop — bulk drop
    dropCourses: builder.mutation<any, { courseIds: string[] }>({
      query: (body) => ({
        url: "/student/courses/drop",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course", "Timetable"],
    }),
    // GET /student/courses/:courseId/enrollment-status
    getEnrollmentStatus: builder.query<any, string>({
      query: (courseId) => ({
        url: `/student/courses/${courseId}/enrollment-status`,
        method: "GET",
      }),
      providesTags: (_r, _e, courseId) => [{ type: "Course", id: courseId }],
    }),
    assignLecturer: builder.mutation<
      any,
      { courseId: string; lecturerId: string }
    >({
      query: ({ courseId, lecturerId }) => ({
        url: `/admin/courses/${courseId}/assign-lecturer`,
        method: "POST",
        body: { lecturerId },
      }),
      invalidatesTags: ["Course"],
    }),
    removeLecturer: builder.mutation<
      any,
      { courseId: string; lecturerId: string }
    >({
      query: ({ courseId, lecturerId }) => ({
        url: `/admin/courses/${courseId}/remove-lecturer/${lecturerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    // GET /lecturer/courses — courses assigned to this lecturer with enrollment counts
    getLecturerCourses: builder.query<any, void>({
      query: () => ({ url: "/lecturer/courses", method: "GET" }),
      providesTags: ["Course"],
    }),
    // GET /lecturer/courses/:courseId/roster
    // Returns: { course, summary, enrolled[], attendees[], alerts }
    // enrolled  = formally registered (can sit CBT exams)
    // attendees = attended ≥1 lecture (open to all — no enrollment required)
    getLecturerCourseRoster: builder.query<any, string>({
      query: (courseId) => ({
        url: `/lecturer/courses/${courseId}/roster`,
        method: "GET",
      }),
      providesTags: (_r, _e, courseId) => [{ type: "Course", id: courseId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery,
  useGetEnrolledCoursesQuery,
  useGetAllCoursesWithStatusQuery,
  useEnrollSingleCourseMutation,
  useDropSingleCourseMutation,
  useEnrollCoursesMutation,
  useDropCoursesMutation,
  useGetEnrollmentStatusQuery,
  useAssignLecturerMutation,
  useRemoveLecturerMutation,
  useGetLecturerCoursesQuery,
  useGetLecturerCourseRosterQuery,
} = courseApi;
