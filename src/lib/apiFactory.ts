import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { tokenManager } from "./tokenManager";
import { routespath } from "./routepath";
import { toast } from "sonner";
import { getSubdomain } from "./subdomainManager";

// Lazy import store to avoid circular dependency
let storeInstance: any = null;

const getStore = () => {
  if (!storeInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    // @ts-ignore - Dynamic require to avoid circular dependency
    storeInstance = require("@/reduxToolKit/store").store;
  }
  return storeInstance;
};

// Import refresh logic
const getRefreshHelper = () => {
  return require("./authRefresh").performTokenRefresh;
};

/**
 * Factory function to create configured Axios clients for different backends.
 */
export const createApiClient = (baseURL: string): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
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
        const state = getStore().getState();
        const token = tokenManager.getToken() || state.user?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Get subdomain with fallback priority: Redux -> localStorage -> URL
        const reduxSubdomain = state?.user?.subdomain;
        const subdomain = getSubdomain(reduxSubdomain);

        // For super-admin routes, prefer the k12 admin subdomain so it is not
        // overwritten by the regular school user's subdomain.
        const k12Subdomain = state?.superAdmin?.k12Subdomain;
        const isSuperAdminRoute = (config.url || "").includes("/super-admin/");
        const effectiveSubdomain = isSuperAdminRoute && k12Subdomain ? k12Subdomain : subdomain;

        // Attach tenant header for all requests where subdomain is found.
        // Do not overwrite if the caller already set it explicitly.
        const alreadySet = config.headers["X-Tenant-Subdomain"];
        if (!alreadySet && effectiveSubdomain) {
          if (typeof config.headers.set === "function") {
            config.headers.set("X-Tenant-Subdomain", effectiveSubdomain);
          } else {
            config.headers["X-Tenant-Subdomain"] = effectiveSubdomain;
          }
        }

        // Identify if this is a login or password reset request for logging/warning purposes
        const isAuthAction =
          (config.url || "").includes(routespath.API_LOGIN) ||
          (config.url || "").includes("/auth/forgot-password") ||
          (config.url || "").includes("/auth/reset-password");

        // Log warnings in development
        if (process.env.NODE_ENV === "development") {
          if (!subdomain && !isAuthAction) {
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
    },
  );

  // Handle responses and global errors (like 401s)
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized with token refresh
      if (error.response?.status === 401) {
        const url = config?.url || "";
        const isLoginRequest = url.includes(routespath.API_LOGIN);
        const isRefreshRequest = url.includes(routespath.API_REFRESH);
        const isChangePasswordRequest = url.includes(
          routespath.API_CHANGE_PASSWORD,
        );

        // Super admin routes use their own auth — never redirect on 401
        const isSuperAdminRequest = url.includes("/super-admin/");

        if (isLoginRequest || isChangePasswordRequest || isSuperAdminRequest) {
          return Promise.reject(error);
        }

        if (isRefreshRequest) {
          tokenManager.removeToken();
          import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
            getStore()?.dispatch(logoutUser());
          });
          return Promise.reject(error);
        }

        if (config._retry) {
          console.warn("[API] Refresh token failed, redirecting to login");
          tokenManager.removeToken();
          import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
            getStore()?.dispatch(logoutUser());
          });

          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/auth/")) {
              toast.error("Session expired, please log in again");
              window.location.href = "/auth/signin";
            }
          }
          return Promise.reject(error);
        }

        try {
          const newToken = await getRefreshHelper()();

          if (newToken) {
            const freshToken = tokenManager.getToken();
            if (config.headers) {
              config.headers.Authorization = `Bearer ${freshToken}`;
            }
            return apiClient(config);
          } else {
            throw new Error("No token received from refresh");
          }
        } catch (refreshError) {
          console.error("[API] Token refresh failed:", refreshError);
          tokenManager.removeToken();
          import("@/reduxToolKit/user/userThunks").then(({ logoutUser }) => {
            getStore()?.dispatch(logoutUser());
          });

          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/auth/")) {
              toast.error("Session expired, please log in again");
              window.location.href = "/auth/signin";
            }
          }
          return Promise.reject(refreshError);
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        console.error("[API] Access Forbidden for URL:", config.url);
        if ((config as any).skipGlobalRedirect) {
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }

      // Handle 500 Server Error
      if (error.response?.status === 500) {
        console.error("[API] Server Error:", error.response.data);
      }

      // Check for subdomain error to filter development logs
      const errorMessage = "";
      const isSubdomainError =
        errorMessage.toLowerCase().includes("subdomain") ||
        errorMessage.toLowerCase().includes("invalid subdomain");

      if (process.env.NODE_ENV === "development" && !isSubdomainError) {
        const errorInfo: any = { message: error.message || "Unknown error" };
        if (error.response) {
          errorInfo.status = error.response.status;
          errorInfo.statusText = error.response.statusText;
          errorInfo.url = config?.url;
          if (error.response.data) errorInfo.data = error.response.data;
        } else if (error.request) {
          errorInfo.type = "Network Error";
          errorInfo.url = config?.url;
        }
        if (
          errorInfo.status ||
          errorInfo.data ||
          errorInfo.message !== "Unknown error"
        ) {
          console.warn("[API Error]", errorInfo);
        }
      }

      return Promise.reject(error);
    },
  );

  return apiClient;
};
