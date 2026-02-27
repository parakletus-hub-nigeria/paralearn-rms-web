import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// Auth endpoints (Forgot Password, Reset Password)
// ---------------------------------------------------------------------------
const authApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/proxy/auth/forgot-password
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: "/api/proxy/auth/forgot-password",
        method: "POST",
        data: body,
      }),
    }),

    // POST /api/proxy/auth/reset-password
    resetPassword: builder.mutation<any, { token: string; newPassword: string }>({
      query: (body) => ({
        url: "/api/proxy/auth/reset-password",
        method: "POST",
        data: body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useForgotPasswordMutation, useResetPasswordMutation } = authApi;
