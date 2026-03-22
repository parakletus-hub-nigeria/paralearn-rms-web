import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

/**
 * RTK Query base API for Super Admin routes.
 * Auth: X-Super-Admin-Key header (no JWT, no X-University-Id).
 * The key is read from Redux state (superAdmin.apiKey).
 */
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/uni-proxy",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const key = state.superAdmin?.apiKey;

    if (key) {
      headers.set("X-Super-Admin-Key", key);
    }

    return headers;
  },
});

export const superAdminApi = createApi({
  reducerPath: "superAdminApi",
  baseQuery,
  tagTypes: ["University"],
  endpoints: () => ({}),
});
