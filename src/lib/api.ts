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

// Import refresh logic
const getRefreshHelper = () => {
  return require("./authRefresh").performTokenRefresh;
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
      const reduxSubdomain = state?.user?.subdomain;
      const subdomain = getSubdomain(reduxSubdomain);

      // Attach tenant header for all non-login requests (including refresh/logout)
      // Special case: Forgot password and Signup ALSO need tenant context to know where to send mail/create user
      if (subdomain) {
        config.headers["X-Tenant-Subdomain"] = subdomain;
      }

      // Log warnings in development
      if (process.env.NODE_ENV === "development") {
        if (!subdomain && !isAuthLogin) {
          console.warn("[API Request] Missing subdomain for:", config.url);
        }
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
    // Dev log removed

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

      try {
        const newToken = await getRefreshHelper()();

        if (newToken) {
          // Fetch the fresh token from tokenManager (it was updated by performTokenRefresh)
          const freshToken = tokenManager.getToken();
          
          // Update the original request with the fresh token
          if (config.headers) {
            config.headers.Authorization = `Bearer ${freshToken}`;
          }

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
      console.error("[API] Access Forbidden for URL:", config.url);
      
      // Allow specific requests to bypass global redirect
      if ((config as any).skipGlobalRedirect) {
        return Promise.reject(error);
      }

      // TEMPORARILY DISABLED REDIRECT TO SEE LOGS
      /*
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
      */
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
        console.warn("[API Error]", errorInfo); // Changed to warn to prevent Next.js overlay intercept
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
