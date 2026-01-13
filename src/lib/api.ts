import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { tokenManager } from "./tokenManager";
import { json } from "stream/consumers";

// Our global axios instance for all API calls

const apiClient: AxiosInstance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Tenant-Subdomain": "",
    
  },
});

// Inject auth token before every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = tokenManager.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (process.env.NODE_ENV === "development") {
        console.log("[API Request]", {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasAuth: !!token,
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
    const config = error.config as InternalAxiosRequestConfig;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn(
        "[API] Unauthorized - Clearing auth and redirecting to login"
      );

      // Clear auth cookies and tokens
      // tokenManager.removeToken();

      // call the refresh token endpoint
      // const refreshResponse = await fetch("/api/proxy/auth/refresh-token", {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //   }
      // })
      // const jsonResponse = await refreshResponse.json();
      // if(!jsonResponse.success || !refreshResponse.ok){

      // }


      // Redirect to login page
      if (typeof window !== "undefined") {
        // Prevent infinite redirect loops
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/auth/")) {
          window.location.href = "/auth/signin";
        }
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("[API] Access Forbidden");
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

    // Log all errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: config?.url,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

// Quick helpers for auth state
export const setAuthToken = (token: string): void => {
  tokenManager.setToken(token);
};

export const removeAuthToken = (): void => {
  tokenManager.removeToken();
};

export const isAuthenticated = (): boolean => {
  return tokenManager.hasToken();
};

export default apiClient;
