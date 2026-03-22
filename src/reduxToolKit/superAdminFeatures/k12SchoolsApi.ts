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

export const k12SchoolsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    registerK12School: builder.mutation<RegisterSchoolResult, RegisterSchoolPayload>({
      query: (body) => ({
        url: "/api/proxy/auth/register-school",
        method: "POST",
        data: body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterK12SchoolMutation } = k12SchoolsApi;
