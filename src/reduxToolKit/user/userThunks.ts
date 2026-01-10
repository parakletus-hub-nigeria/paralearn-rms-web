import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { setAuthToken, removeAuthToken } from "@/lib/api";
import { tokenManager } from "@/lib/tokenManager";
import { routespath } from "@/lib/routepath";

/**
 * AsyncThunk for user login
 * - Posts credentials to backend
 * - Stores token in cookies via tokenManager
 * - Returns user data and token
 */
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(routespath.API_LOGIN, credentials);
      const { accessToken, user } = response.data;

      if (!accessToken) {
        return rejectWithValue("No token received from server");
      }

      // Store token in cookies
      setAuthToken(accessToken);

      return {
        accessToken,
        user: user || {},
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";

      console.error("[Login Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for fetching user data
 * - Makes authenticated request to get user profile
 * - Token is automatically added by request interceptor
 */
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(routespath.API_USER_PROFILE);

      if (!response.data) {
        return rejectWithValue("No user data received");
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user data";

      console.error("[Fetch User Data Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for user logout
 * - Calls backend logout endpoint
 * - Removes token from cookies
 * - Clears user state
 */
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      try {
        // Attempt to notify backend of logout
        await apiClient.post(routespath.API_LOGOUT);
      } catch (error) {
        // Even if logout endpoint fails, we still want to clear local state
        console.warn("[Logout] Backend logout failed, clearing local auth");
      }

      // Remove token from cookies
      removeAuthToken();
      tokenManager.clearAllAuthCookies();

      return null;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Logout failed";

      console.error("[Logout Error]", errorMessage);

      // Still clear cookies even if error occurs
      removeAuthToken();
      tokenManager.clearAllAuthCookies();

      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for refreshing auth token
 * - Calls refresh token endpoint
 * - Updates token in cookies
 */
export const refreshAuthToken = createAsyncThunk(
  "user/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(routespath.API_REFRESH);
      const { accessToken } = response.data;

      if (!accessToken) {
        return rejectWithValue("No token received from refresh endpoint");
      }

      // Update token in cookies
      setAuthToken(accessToken);

      return { accessToken };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Token refresh failed";

      console.error("[Token Refresh Error]", errorMessage);

      // Clear auth if refresh fails
      removeAuthToken();

      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for signing up new user
 */
export const signupUser = createAsyncThunk(
  "user/signup",
  async (
    userData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(routespath.API_SIGNUP, userData);
      const { accessToken, user } = response.data;

      if (!accessToken) {
        return rejectWithValue("No token received from server");
      }

      // Store token in cookies
      setAuthToken(accessToken);

      return {
        accessToken,
        user: user || {},
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Signup failed";

      console.error("[Signup Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for password reset request
 */
export const requestPasswordReset = createAsyncThunk(
  "user/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(routespath.API_FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Password reset request failed";

      console.error("[Password Reset Request Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * AsyncThunk for confirming password reset
 */
export const confirmPasswordReset = createAsyncThunk(
  "user/confirmPasswordReset",
  async (data: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(routespath.API_RESET_PASSWORD, data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Password reset confirmation failed";

      console.error("[Password Reset Confirmation Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
