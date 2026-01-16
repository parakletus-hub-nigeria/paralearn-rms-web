import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { setAuthToken, removeAuthToken } from "@/lib/api";
import { tokenManager } from "@/lib/tokenManager";
import { routespath } from "@/lib/routepath";
// Log in the user and save the token
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        `/api/proxy${routespath.API_LOGIN}`,
        credentials
      );
      const { user, accessToken: responseToken } = response.data;

      // Try to get token from response first, then from cookies (set by backend)
      let accessToken = responseToken || tokenManager.getToken();

      // If still no token, wait a bit for cookie to be set (backend might set it as httpOnly cookie)
      if (!accessToken) {
        // Small delay to allow backend to set cookie
        await new Promise((resolve) => setTimeout(resolve, 100));
        accessToken = tokenManager.getToken();
      }

      if (!accessToken) {
        return rejectWithValue("No token received from server");
      }

      // Store token in cookies and sync with Redux
      if (!tokenManager.getToken()) {
        setAuthToken(accessToken);
      } else {
        // Still sync with Redux even if token exists in cookies
        setAuthToken(accessToken);
      }

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

// Pull the current user's profile data
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

// Log out the user and clean up everything
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

// Refresh the access token when it expires
export const refreshAuthToken = createAsyncThunk(
  "user/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      // Use GET method for refresh token (as used in protectedRoute)
      const response = await apiClient.get(
        `/api/proxy${routespath.API_REFRESH}`
      );
      const { accessToken: responseToken } = response.data;

      // Try to get token from response first, then from cookies
      let accessToken = responseToken || tokenManager.getToken();

      // If still no token, wait a bit for cookie to be set
      if (!accessToken) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        accessToken = tokenManager.getToken();
      }

      if (!accessToken) {
        return rejectWithValue("No token received from refresh endpoint");
      }

      // Update token in cookies and Redux
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
      tokenManager.removeToken();

      return rejectWithValue(errorMessage);
    }
  }
);

// Register a new user account
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

// Start the password reset process
export const requestPasswordReset = createAsyncThunk(
  "user/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(routespath.API_FORGOT_PASSWORD, {
        email,
      });
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

// Finalize the password reset with the new password
export const confirmPasswordReset = createAsyncThunk(
  "user/confirmPasswordReset",
  async (data: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        routespath.API_RESET_PASSWORD,
        data
      );
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

// Fetch all users (students and teachers)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/proxy/users");
      
      if (!response.data) {
        return rejectWithValue("No users data received");
      }

      const users = response.data.data || response.data;
      
      // Separate students and teachers
      const students = users.filter(
        (item: any) => item.roles?.[0]?.role?.name === "student"
      );
      const teachers = users.filter(
        (item: any) => item.roles?.[0]?.role?.name === "teacher"
      );

      return {
        users,
        students,
        teachers,
        studentCount: students.length,
        teacherCount: teachers.length,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch users";

      console.error("[Fetch All Users Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch a single user by ID
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue("User ID is required");
      }

      const response = await apiClient.get(`/api/proxy/users/${userId}`);

      if (!response.data) {
        return rejectWithValue("No user data received");
      }

      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user details";

      console.error("[Fetch User By ID Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue("User ID is required");
      }

      const response = await apiClient.delete(`/api/proxy/users/${userId}/hard`);

      return {
        userId,
        message: response.data?.message || "User deleted successfully",
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete user";

      console.error("[Delete User Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
