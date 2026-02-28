import { paraApi } from "../baseApi";

// ---------------------------------------------------------------------------
// School Settings, Grading & Tenant endpoints
// ---------------------------------------------------------------------------
const settingsApi = paraApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/proxy/school-settings
    getSchoolSettings: builder.query<any, void>({
      query: () => ({ url: "/api/proxy/school-settings" }),
      providesTags: [{ type: "SchoolSettings" }],
    }),

    // PUT /api/proxy/school-settings
    updateSchoolSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/school-settings",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [{ type: "SchoolSettings" }],
    }),

    // GET /api/proxy/school-settings/grading
    getGradingSystem: builder.query<any, void>({
      query: () => ({ url: "/api/proxy/school-settings/grading" }),
      providesTags: [{ type: "GradingSystem" }],
    }),

    // PUT /api/proxy/school-settings/grading
    updateGradingSystem: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/proxy/school-settings/grading",
        method: "PUT",
        data: body,
      }),
      invalidatesTags: [{ type: "GradingSystem" }],
    }),

    // GET /api/proxy/school-settings/grading/templates
    getGradingTemplates: builder.query<any[], void>({
      query: () => ({ url: "/api/proxy/school-settings/grading/templates" }),
      transformResponse: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        return data;
      },
      providesTags: [{ type: "GradingTemplate" }],
    }),

    // GET /api/proxy/tenant/info
    getTenantInfo: builder.query<any, void>({
      query: () => ({ url: "/api/proxy/tenant/info" }),
      providesTags: [{ type: "Tenant" }],
    }),

    // PATCH /api/proxy/tenant/branding
    updateBranding: builder.mutation<
      any,
      {
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        motto?: string;
      }
    >({
      query: (body) => ({
        url: "/api/proxy/tenant/branding",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: [{ type: "Tenant" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
  useGetGradingSystemQuery,
  useUpdateGradingSystemMutation,
  useGetGradingTemplatesQuery,
  useGetTenantInfoQuery,
  useUpdateBrandingMutation,
} = settingsApi;
