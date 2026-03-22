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

    // ---------------------------------------------------------------------------
    // Report Card Template Manager (school-facing)
    // ---------------------------------------------------------------------------

    // GET /api/proxy/report-card-template-manager/available
    getAvailableReportCardTemplates: builder.query<
      { id: string; name: string; thumbnailUrl: string; description?: string }[],
      void
    >({
      query: () => ({ url: "/api/proxy/report-card-template-manager/available" }),
      transformResponse: (res: any) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "ReportCardTemplate", id: "AVAILABLE" }],
    }),

    // GET /api/proxy/report-card-template-manager  (school's selected templates)
    getSchoolReportCardTemplates: builder.query<any[], void>({
      query: () => ({ url: "/api/proxy/report-card-template-manager" }),
      transformResponse: (res: any) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "SchoolReportCardTemplate", id: "LIST" }],
    }),

    // POST /api/proxy/report-card-template-manager/:templateId/select
    selectReportCardTemplate: builder.mutation<any, string>({
      query: (templateId) => ({
        url: `/api/proxy/report-card-template-manager/${templateId}/select`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "SchoolReportCardTemplate", id: "LIST" }],
    }),

    // PATCH /api/proxy/report-card-template-manager/:id/deactivate
    deactivateSchoolTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/proxy/report-card-template-manager/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "SchoolReportCardTemplate", id: "LIST" }],
    }),

    // PATCH /api/proxy/report-card-template-manager/:id/activate
    activateSchoolTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/proxy/report-card-template-manager/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "SchoolReportCardTemplate", id: "LIST" }],
    }),

    // DELETE /api/proxy/report-card-template-manager/:id
    removeSchoolTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/proxy/report-card-template-manager/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SchoolReportCardTemplate", id: "LIST" }],
    }),

    // ---------------------------------------------------------------------------
    // Super Admin — Global Template Library (K-12)
    // ---------------------------------------------------------------------------

    // GET /api/proxy/super-admin/report-card-templates
    getSuperAdminTemplates: builder.query<any[], void>({
      query: () => ({ url: "/api/proxy/super-admin/report-card-templates" }),
      transformResponse: (res: any) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "ReportCardTemplate", id: "ADMIN_LIST" }],
    }),

    // GET /api/proxy/super-admin/report-card-templates/:id
    getSuperAdminTemplate: builder.query<any, string>({
      query: (id) => ({ url: `/api/proxy/super-admin/report-card-templates/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "ReportCardTemplate", id }],
    }),

    // POST /api/proxy/super-admin/report-card-templates
    createSuperAdminTemplate: builder.mutation<
      any,
      { name: string; ejsCode: string; thumbnailUrl: string; description?: string; version?: number }
    >({
      query: (body) => ({
        url: "/api/proxy/super-admin/report-card-templates",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "ReportCardTemplate", id: "ADMIN_LIST" }],
    }),

    // PATCH /api/proxy/super-admin/report-card-templates/:id
    updateSuperAdminTemplate: builder.mutation<
      any,
      { id: string; name?: string; ejsCode?: string; thumbnailUrl?: string; description?: string; version?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/proxy/super-admin/report-card-templates/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ReportCardTemplate", id: "ADMIN_LIST" },
        { type: "ReportCardTemplate", id },
      ],
    }),

    // DELETE /api/proxy/super-admin/report-card-templates/:id
    deleteSuperAdminTemplate: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/proxy/super-admin/report-card-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ReportCardTemplate", id: "ADMIN_LIST" }],
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
  // Report card template manager (school)
  useGetAvailableReportCardTemplatesQuery,
  useGetSchoolReportCardTemplatesQuery,
  useSelectReportCardTemplateMutation,
  useDeactivateSchoolTemplateMutation,
  useActivateSchoolTemplateMutation,
  useRemoveSchoolTemplateMutation,
  // Super admin template library
  useGetSuperAdminTemplatesQuery,
  useGetSuperAdminTemplateQuery,
  useCreateSuperAdminTemplateMutation,
  useUpdateSuperAdminTemplateMutation,
  useDeleteSuperAdminTemplateMutation,
} = settingsApi;
