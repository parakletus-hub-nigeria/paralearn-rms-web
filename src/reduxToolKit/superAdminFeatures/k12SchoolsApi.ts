import { paraApi } from "../api/baseApi";

export interface RegisterSchoolPayload {
  schoolName: string;
  domain: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  phoneNumber?: string;
  address?: string;
  motto?: string;
  website?: string;
}

export interface RegisterSchoolResult {
  schoolId: string;
  schoolName: string;
  subdomain: string;
  adminId: string;
  adminEmail: string;
  loginUrl: string;
  wasSubdomainModified: boolean;
  originalDomain: string;
}

export interface K12School {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  logoUrl?: string;
  isActive: boolean;
  schoolType?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  createdAt: string;
  _count?: { users?: number; students?: number };
}

export interface GetSchoolsResult {
  data: K12School[];
  total: number;
  page: number;
  limit: number;
}

export const k12SchoolsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    registerK12School: builder.mutation<RegisterSchoolResult, RegisterSchoolPayload>({
      query: (body) => ({
        url: "/api/proxy/auth/register-school",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["K12Schools"],
    }),

    getK12Schools: builder.query<GetSchoolsResult, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 50, search } = {}) => ({
        url: "/api/proxy/super-admin/schools",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["K12Schools"],
    }),

    suspendK12School: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/proxy/super-admin/schools/${id}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["K12Schools"],
    }),

    activateK12School: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/proxy/super-admin/schools/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["K12Schools"],
    }),

    // Permanent delete via dedicated cascade-safe endpoint
    deleteK12School: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/proxy/super-admin/schools/${id}`,
        method: "DELETE",
      }),
      // Endpoint returns HTTP 200 with { success: false, error } on failure
      transformResponse: (response: any) => {
        if (response?.success === false) {
          throw new Error(response.error ?? "Delete failed");
        }
        return response;
      },
      invalidatesTags: ["K12Schools"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterK12SchoolMutation,
  useGetK12SchoolsQuery,
  useSuspendK12SchoolMutation,
  useActivateK12SchoolMutation,
  useDeleteK12SchoolMutation,
} = k12SchoolsApi;
