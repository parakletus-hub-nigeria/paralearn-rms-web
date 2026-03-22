import { uniApi } from "../api/uniBaseApi";

export const uniAuthApi = uniApi.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useChangePasswordMutation } = uniAuthApi;
