import { uniApi } from "../api/uniBaseApi";

export const departmentApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    createDepartment: builder.mutation<
      any,
      { name: string; facultyId: string }
    >({
      query: (body) => ({
        url: "/admin/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),
    getDepartments: builder.query<any, void>({
      query: () => ({
        url: "/admin/departments",
        method: "GET",
      }),
      providesTags: ["Department"],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateDepartmentMutation, useGetDepartmentsQuery } =
  departmentApi;
