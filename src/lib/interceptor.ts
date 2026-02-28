import { store } from "@/reduxToolKit/store";
import { logoutUser } from "@/reduxToolKit/user/userThunks";
import { updateAccessToken } from "@/reduxToolKit/user/userSlice";
import tokenManager from "./tokenManager";
import { routespath } from "./routepath";
import { getSubdomain } from "./subdomainManager";

export const apiFetch = async (
  urlPath: string,
  options?: RequestInit
): Promise<Response> => {
  const state = store.getState();
  let accessToken = tokenManager.getToken() || state.user.accessToken;
  const isRefreshRequest =
    urlPath.includes(routespath.API_REFRESH) ||
    urlPath.includes(`/api/proxy${routespath.API_REFRESH}`);

  // Helper function to retry request with token refresh
  const makeRequest = async (token: string, retry = false): Promise<Response> => {
    const headers: any = {
      ...options?.headers,
      "Content-Type": "application/json",
    };

    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }

    // Get subdomain with fallback priority: Redux -> localStorage -> URL
    const subdomain = getSubdomain(state.user.subdomain);
    if (subdomain) {
      headers["X-Tenant-Subdomain"] = subdomain;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Important for cookies
    };

    const response = await fetch(urlPath, config);

    // Handle 401 Unauthorized - try token refresh once
    // Important: never try to refresh while calling refresh endpoint itself.
    if (response.status === 401 && !retry && !isRefreshRequest) {
      console.warn("[API Fetch] Token expired, attempting refresh...");

      try {
        const { performTokenRefresh } = await import("./authRefresh");
        const newToken = await performTokenRefresh();

        if (newToken) {
          console.log("[API Fetch] Token refreshed, retrying request");
          // Fetch the fresh token from tokenManager (it was updated by performTokenRefresh)
          const freshToken = tokenManager.getToken();
          // Retry original request with the fresh token
          return makeRequest(freshToken || "", true);
        }

        // Refresh failed, clear auth and dispatch logout
        console.error("[API Fetch] Token refresh failed, logging out");
        tokenManager.removeToken();
        store.dispatch(logoutUser());

        // Redirect to login if not already there
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/auth/")) {
            window.location.href = "/auth/signin";
          }
        }

        throw new Error("Session expired. Please log in again.");
      } catch (refreshError: any) {
        // Clear auth on refresh failure
        tokenManager.removeToken();
        store.dispatch(logoutUser());

        // Redirect to login
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/auth/")) {
            window.location.href = "/auth/signin";
          }
        }

        throw new Error(refreshError.message || "Session expired. Please log in again.");
      }
    }

    if (!response.ok && response.status !== 401) {
      // For refresh requests, let the caller handle non-OK (including 500) gracefully.
      if (isRefreshRequest) {
        return response;
      }

      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }

    return response;
  };

  try {
    return await makeRequest(accessToken || "");
  } catch (error: any) {
    // Only log non-404 and non-401 (if caught here) errors to reduce console noise
    if (!error.message?.includes("Cannot GET") && !error.message?.includes("404") && !error.message?.includes("401")) {
      console.error("[API Fetch Error]", error);
    }
    throw error;
  }
};
