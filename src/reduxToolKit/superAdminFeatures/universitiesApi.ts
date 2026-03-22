import { superAdminApi } from "../api/superAdminBaseApi";

export interface BootstrapUniversityPayload {
  name: string;
  subdomain: string;
  schoolAdminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  logoUrl?: string;
  address?: string;
  contactEmail?: string;
}

export interface UniversityListItem {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  contactEmail: string;
  createdAt: string;
  _count: { users: number };
}

export const universitiesApi = superAdminApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /super-admin/universities — list all universities (platform view)
    listUniversities: builder.query<UniversityListItem[], void>({
      query: () => ({
        url: "/super-admin/universities",
        method: "GET",
      }),
      providesTags: ["University"],
    }),

    // POST /super-admin/universities — bootstrap a new university + school admin
    bootstrapUniversity: builder.mutation<
      {
        university: { id: string; name: string; subdomain: string };
        admin: { id: string; email: string; temporaryPassword: string; mustChangePassword: boolean };
        message: string;
      },
      BootstrapUniversityPayload
    >({
      query: (body) => ({
        url: "/super-admin/universities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["University"],
    }),
  }),
  overrideExisting: false,
});

export const { useListUniversitiesQuery, useBootstrapUniversityMutation } =
  universitiesApi;
