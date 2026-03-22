import { uniApi } from '../api/uniBaseApi';

export interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  lectureHallId?: string;
}

export const attendanceApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /attendance/mark — body: { studentId, lectureId, coords: { lat, lng, accuracy? }, deviceId? }
    markAttendance: builder.mutation<
      any,
      {
        studentId: string;
        lectureId: string;
        coords: { lat: number; lng: number; accuracy?: number };
        deviceId?: string;
      }
    >({
      query: (body) => ({ url: '/attendance/mark', method: 'POST', body }),
      invalidatesTags: ['Attendance'],
    }),
    // POST /attendance/heartbeat — body: { attendanceLogId, lat, lng, deviceId }
    sendAttendanceHeartbeat: builder.mutation<
      any,
      { attendanceLogId: string; lat: number; lng: number; deviceId: string }
    >({
      query: (body) => ({ url: '/attendance/heartbeat', method: 'POST', body }),
    }),
    getLectureAttendance: builder.query({
      query: (lectureId) => ({ url: '/attendance/lecture/' + lectureId, method: 'GET' }),
      providesTags: ['Attendance'],
    }),
    // GET /student/attendance/history — personal attendance history across all lectures
    getStudentAttendance: builder.query<any, void>({
      query: () => ({ url: '/student/attendance/history', method: 'GET' }),
      providesTags: ['Attendance'],
    }),
    // GET /student/active-sessions — open attendance windows for enrolled courses
    getStudentActiveSessions: builder.query<any, void>({
      query: () => ({ url: '/student/active-sessions', method: 'GET' }),
      providesTags: ['Attendance'],
    }),
    toggleAttendanceWindow: builder.mutation({
      query: (body) => ({ url: '/lecturer/sessions/activate', method: 'POST', body }),
      invalidatesTags: ['Lecture', 'Attendance'],
    }),
    getLecturerGeofences: builder.query<any, void>({
      query: () => ({ url: '/lecturer/geofences', method: 'GET' }),
      providesTags: ['Attendance'],
    }),
    createGeofence: builder.mutation({
      query: (body) => ({ url: '/lecturer/geofences', method: 'POST', body }),
      invalidatesTags: ['Attendance'],
    }),
    updateGeofence: builder.mutation({
      query: ({ id, ...body }) => ({ url: '/lecturer/geofences/' + id, method: 'PATCH', body }),
      invalidatesTags: ['Attendance'],
    }),
    deleteGeofence: builder.mutation({
      query: (id) => ({ url: '/lecturer/geofences/' + id, method: 'DELETE' }),
      invalidatesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useMarkAttendanceMutation,
  useSendAttendanceHeartbeatMutation,
  useGetLectureAttendanceQuery,
  useGetStudentAttendanceQuery,
  useGetStudentActiveSessionsQuery,
  useToggleAttendanceWindowMutation,
  useGetLecturerGeofencesQuery,
  useCreateGeofenceMutation,
  useUpdateGeofenceMutation,
  useDeleteGeofenceMutation,
} = attendanceApi;
