import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Attendance endpoints
// ---------------------------------------------------------------------------
const attendanceApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/attendance?studentId=...&classId=...&session=...&term=...
    getAttendance: builder.query<
      any[],
      {
        studentId?: string;
        classId?: string;
        session: string;
        term: string;
      }
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params.studentId) q.set("studentId", params.studentId);
        if (params.classId) q.set("classId", params.classId);
        q.set("session", params.session);
        q.set("term", params.term);
        return { url: `/api/proxy/attendance?${q.toString()}` };
      },
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: [{ type: "Attendance" }],
    }),

    // POST /api/proxy/attendance
    recordAttendance: builder.mutation<
      any,
      {
        studentId: string;
        session: string;
        term: string;
        daysPresent: number;
        totalDays: number;
      }
    >({
      query: (body) => ({
        url: "/api/proxy/attendance",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Attendance" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttendanceQuery,
  useRecordAttendanceMutation,
} = attendanceApi;
