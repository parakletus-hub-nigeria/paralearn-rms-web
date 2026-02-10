import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import apiClient from "@/lib/api";
import type { AxiosRequestConfig, AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Axios-based baseQuery — reuses the app's apiClient (auth, refresh, subdomain)
// ---------------------------------------------------------------------------
export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
}

export const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  { status?: number; data?: unknown; message?: string }
> = async ({ url, method = "GET", data, params, headers }) => {
  try {
    const result = await apiClient({
      url,
      method,
      data,
      params,
      headers,
    });
    // Unwrap common response envelope: { success, data, message }
    return { data: result.data?.data ?? result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError<{ message?: string; error?: string }>;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data,
        message:
          err.response?.data?.message ??
          err.response?.data?.error ??
          err.message ??
          "An unknown error occurred",
      },
    };
  }
};

// ---------------------------------------------------------------------------
// Central API slice — all domain endpoint files inject into this
// ---------------------------------------------------------------------------
export const paraApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 30,
  tagTypes: [
    "User",
    "UserList",
    "Session",
    "SessionList",
    "CurrentSession",
    "Class",
    "ClassList",
    "Subject",
    "SubjectList",
    "Assessment",
    "AssessmentList",
    "AssessmentCategory",
    "Score",
    "ScoreList",
    "Comment",
    "CommentList",
    "Report",
    "ReportCard",
    "ApprovalQueue",
    "Attendance",
    "SchoolSettings",
    "GradingSystem",
    "GradingTemplate",
    "Tenant",
    "BookletPreview",
    "Statistics",
  ] as const,
  endpoints: () => ({}), // injected by domain files
});
