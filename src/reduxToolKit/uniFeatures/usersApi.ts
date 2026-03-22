import { uniApi } from "../api/uniBaseApi";

export const usersApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /admin/users — create a single user (student or lecturer)
    createUniUser: builder.mutation<
      any,
      {
        firstName: string;
        lastName: string;
        email: string;
        role: "STUDENT" | "LECTURER" | string;
        matricNumber?: string;   // students
        staffId?: string;        // lecturers
        temporaryPassword?: string;
      }
    >({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // POST /admin/users/import/csv/students — bulk import students via CSV text
    importStudentsCSV: builder.mutation<any, { csvText: string }>({
      query: (body) => ({
        url: "/admin/users/import/csv/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // POST /admin/users/import/csv/lecturers — bulk import lecturers via CSV text
    importLecturersCSV: builder.mutation<any, { csvText: string }>({
      query: (body) => ({
        url: "/admin/users/import/csv/lecturers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // GET /admin/users — list all users in the university tenant
    getUniUsers: builder.query<any, void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateUniUserMutation,
  useImportStudentsCSVMutation,
  useImportLecturersCSVMutation,
  useGetUniUsersQuery,
} = usersApi;
