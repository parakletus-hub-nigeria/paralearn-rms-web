import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tokenManager } from "@/lib/tokenManager";
import { RootState } from "../store";
import { getSubdomain } from "@/lib/subdomainManager";

// Shared logic for injecting tokens and headers
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/uni-proxy",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = tokenManager.getToken() || state.user?.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    if (
      state.user?.institutionType === "university" &&
      state.user?.user?.universityId
    ) {
      headers.set("X-University-Id", state.user.user.universityId);
    } else {
      // Fallback to subdomain if needed, though K12 routing handles it differently
      const reduxSubdomain = state.user?.subdomain;
      const subdomain = getSubdomain(reduxSubdomain);
      if (subdomain) {
        headers.set("X-Tenant-Subdomain", subdomain);
      }
    }

    return headers;
  },
});

/**
 * Base RTK Query API for University specific routes.
 * All University features should inject their endpoints into this instance.
 */
export const uniApi = createApi({
  reducerPath: "uniApi",
  baseQuery,
  tagTypes: [
    "Faculty",
    "Department",
    "Course",
    "Timetable",
    "Attendance",
    "Lecture",
    "User",
    "Assessment",
    "Hall",
    "Session",
  ],
  endpoints: () => ({}),
});
