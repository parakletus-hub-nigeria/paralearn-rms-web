import { uniApi } from "../api/uniBaseApi";

export const facultyApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaculties: builder.query<any, void>({
      query: () => ({
        url: "/admin/faculties",
        method: "GET",
      }),
      providesTags: ["Faculty"],
    }),
    createFaculty: builder.mutation<any, { name: string; subtitle?: string }>({
      query: (body) => ({
        url: "/admin/faculties",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Faculty"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFacultiesQuery, useCreateFacultyMutation } = facultyApi;
