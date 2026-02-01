import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { tokenManager } from "./tokenManager";
import { routespath } from "./routepath";
import { getSubdomain } from "./subdomainManager";

// Lazy import store to avoid circular dependency
let storeInstance: any = null;

const getStore = () => {
  if (!storeInstance) {
    // Use require to break circular dependency at module evaluation time
    storeInstance = require("@/reduxToolKit/store").store;
  }
  return storeInstance;
};

// Our global axios instance for all API calls

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 300000,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Inject auth token before every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from Redux state or cookie manager
      const state = getStore().getState();
      const token = tokenManager.getToken() || state.user.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Don't attach tenant header to auth login.
      // (Login must work even before we know tenant/subdomain.)
      const isAuthLogin = (config.url || "").includes(routespath.API_LOGIN);

      // Get subdomain with fallback priority: Redux -> localStorage -> URL
      const reduxSubdomain = state.user?.subdomain;
      const subdomain = isAuthLogin ? null : getSubdomain(reduxSubdomain);

      // Attach tenant header for all non-login requests (including refresh/logout)
      if (subdomain && !isAuthLogin) {
        config.headers["X-Tenant-Subdomain"] = subdomain;
      }

      // Log request in development
      if (process.env.NODE_ENV === "development") {
        if (!token) {
          console.warn("[API Request] WARNING: No auth token found for request", config.url);
        }
        console.log("[API Request]", {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasAuth: !!token,
          subdomain: subdomain || "none",
          reduxSubdomain: reduxSubdomain || "none",
          localStorage: typeof window !== "undefined" ? localStorage.getItem("adminSubdomain") : "N/A",
        });
      }

      return config;
    } catch (error) {
      console.error("[Request Interceptor Error]", error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error("[Request Interceptor Error]", error.message);
    return Promise.reject(error);
  }
);

// Handle responses and global errors (like 401s)
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("[API Response]", {
        status: response.status,
        url: response.config.url,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401) {
      const url = config?.url || "";
      const isLoginRequest = url.includes(routespath.API_LOGIN);
      const isRefreshRequest = url.includes(routespath.API_REFRESH);

      // If login fails (401), do NOT attempt refresh. Just return the login error.
      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // If refresh itself fails, don't try to refresh again.
      if (isRefreshRequest) {
        tokenManager.removeToken();
        import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
          getStore()?.dispatch(logoutUser());
        });
        return Promise.reject(error);
      }

      // Prevent infinite retry loops
      if (config._retry) {
        console.warn("[API] Refresh token failed, redirecting to login");
        tokenManager.removeToken();
        // Use dynamic import to avoid circular dependency
        import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
          getStore()?.dispatch(logoutUser());
        });
        
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/auth/")) {
            window.location.href = "/auth/signin";
          }
        }
        return Promise.reject(error);
      }

      // Mark request as retried
      config._retry = true;

      try {
        console.log("[API] Attempting to refresh token...");

        // Try to refresh the token
        const refreshResponse = await axios.get(
          `/api/proxy${routespath.API_REFRESH}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const refreshData = refreshResponse.data;
        const newToken =
          refreshData.accessToken ||
          refreshData.data?.accessToken ||
          tokenManager.getToken();

        if (newToken && refreshResponse.status === 200) {
          // Update token in cookies
          tokenManager.setToken(newToken);

          // Update Redux state - use dynamic import to avoid circular dependency
          const { updateAccessToken } = await import("@/reduxToolKit/user/userSlice");
          getStore()?.dispatch(updateAccessToken({ accessToken: newToken }));

          // Update the original request with new token
          if (config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }

          console.log(
            "[API] Token refreshed successfully, retrying original request"
          );

          // Retry the original request with new token
          return apiClient(config);
        } else {
          throw new Error("No token received from refresh");
        }
      } catch (refreshError) {
        console.error("[API] Token refresh failed:", refreshError);

        // Clear auth on refresh failure
        tokenManager.removeToken();
        // Use dynamic import to avoid circular dependency
        import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
          getStore()?.dispatch(logoutUser());
        });

        // Redirect to login page
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/auth/")) {
            window.location.href = "/auth/signin";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("[API] Access Forbidden");
      
      // Allow specific requests to bypass global redirect
      if ((config as any).skipGlobalRedirect) {
        return Promise.reject(error);
      }

      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
      return Promise.reject(error);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("[API] Server Error:", error.response.data);
    }

    // Handle Network Error
    if (!error.response) {
      console.error("[API] Network Error:", error.message);
    }

    // Check if this is a subdomain-related error (expected in some scenarios)
    const errorMessage = 
      "";
    const isSubdomainError = errorMessage.toLowerCase().includes("subdomain") || 
                            errorMessage.toLowerCase().includes("invalid subdomain");

    // Log all errors in development (only if there's meaningful data and not expected subdomain errors)
    if (process.env.NODE_ENV === "development" && !isSubdomainError) {
      const errorInfo: any = {
        message: error.message || "Unknown error",
      };
      
      if (error.response) {
        errorInfo.status = error.response.status;
        errorInfo.statusText = error.response.statusText;
        errorInfo.url = config?.url;
        if (error.response.data) {
          errorInfo.data = error.response.data;
        }
      } else if (error.request) {
        errorInfo.type = "Network Error";
        errorInfo.url = config?.url;
      }
      
      // Only log if we have meaningful information
      if (errorInfo.status || errorInfo.data || errorInfo.message !== "Unknown error") {
        console.error("[API Error]", errorInfo);
      }
    }

    return Promise.reject(error);
  }
);

// Quick helpers for auth state
export const setAuthToken = async (token: string): Promise<void> => {
  tokenManager.setToken(token);
  // Sync with Redux state - use dynamic import to avoid circular dependency
  const { updateAccessToken } = await import("@/reduxToolKit/user/userSlice");
  getStore()?.dispatch(updateAccessToken({ accessToken: token }));
};

export const removeAuthToken = async (): Promise<void> => {
  tokenManager.removeToken();
  // Sync with Redux state - clear token - use dynamic import to avoid circular dependency
  const { updateAccessToken } = await import("@/reduxToolKit/user/userSlice");
  getStore()?.dispatch(updateAccessToken({ accessToken: null }));
};

export const isAuthenticated = (): boolean => {
  return tokenManager.hasToken() || !!getStore()?.getState()?.user?.accessToken;
};

export default apiClient;
