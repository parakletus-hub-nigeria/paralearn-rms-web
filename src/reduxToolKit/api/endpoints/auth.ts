import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Auth endpoints (Forgot Password, Reset Password)
// ---------------------------------------------------------------------------
const authApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/proxy/auth/forgot-password
    // subdomain is optional: passed manually when on bare localhost (no natural subdomain in URL)
    forgotPassword: builder.mutation<any, { email: string; subdomain?: string }>({
      query: ({ subdomain, ...body }) => ({
        url: "/api/proxy/auth/forgot-password",
        method: "POST",
        data: body,
        // Only set header here if a manual subdomain was explicitly passed.
        // For normal tenant URLs (e.g. dsa.localhost, dsa.pln.ng) the global
        // interceptor in api.ts picks it up from the URL / localStorage / Redux.
        ...(subdomain ? { headers: { "X-Tenant-Subdomain": subdomain } } : {}),
      }),
    }),

    // POST /api/proxy/auth/reset-password
    // subdomain is optional: passed manually when on bare localhost
    resetPassword: builder.mutation<any, { token: string; newPassword: string; subdomain?: string }>({
      query: ({ subdomain, ...body }) => ({
        url: "/api/proxy/auth/reset-password",
        method: "POST",
        data: body,
        ...(subdomain ? { headers: { "X-Tenant-Subdomain": subdomain } } : {}),
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useForgotPasswordMutation, useResetPasswordMutation } = authApi;
