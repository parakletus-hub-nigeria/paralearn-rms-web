import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { setAuthToken, removeAuthToken } from "@/lib/api";
import { tokenManager } from "@/lib/tokenManager";
import { routespath } from "@/lib/routepath";
import { getSubdomain, saveSubdomainToStorage, extractSubdomainFromURL, getSubdomainFromStorage } from "@/lib/subdomainManager";
import { store } from "@/reduxToolKit/store";
import { fetchCurrentSession } from "@/reduxToolKit/setUp/setUpThunk";
import { 
  normalizeRoles, 
  pickRedirectPath, 
  extractTokenAndUser, 
  extractSubdomainFromUser 
} from "./userUtils";
// Log in the user and save the token
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string; skipSessionCheck?: boolean; redirectTo?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        `/api/proxy${routespath.API_LOGIN}`,
        credentials
      );

      // Log the full response for debugging
      console.log("[Login Response]", response);
      console.log("[Login Response Data]", response.data);

      const { token: tokenFromResponse, user: userFromResponse } =
        extractTokenAndUser(response.data);

      // Try to get token from response first, then from cookies (set by backend)
      let accessToken = tokenFromResponse || tokenManager.getToken();

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
        await setAuthToken(accessToken);
      } else {
        // Still sync with Redux even if token exists in cookies
        await setAuthToken(accessToken);
      }

      const roles = normalizeRoles(userFromResponse?.roles);
      const redirectTo = pickRedirectPath(roles);
      const subdomain = extractSubdomainFromUser(userFromResponse, response.data);

      // If subdomain not found in user object, return error
      if (!subdomain) {
        return rejectWithValue("Subdomain not found in user response. Please contact support.");
      }

      // Store subdomain in localStorage and Redux
      saveSubdomainToStorage(subdomain);
      
      // Determine redirect path
      let redirectPath: string;
      
      // If explicit redirect path provided (e.g., from signup), use it
      if (credentials.redirectTo) {
        redirectPath = credentials.redirectTo;
      } 
      // If skipSessionCheck is true (e.g., for new signups), go to setup
      else if (credentials.skipSessionCheck) {
        redirectPath = "/setup";
      }
      // Otherwise, check if academic session is set up
      else {
        redirectPath = routespath.DASHBOARD; // Default to dashboard
        
        try {
          // Try to fetch current session to check if setup is complete
          // Use a timeout to prevent blocking login for too long
          const sessionResponse = await Promise.race([
            apiClient.get(`/api/proxy${routespath.API_GET_CURRENT_SESSION}`),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Session check timeout")), 3000)
            )
          ]) as any;
          
          // If session exists and is valid, go to dashboard
          if (sessionResponse?.data?.success && sessionResponse?.data?.data?.sessionDetails) {
            redirectPath = routespath.DASHBOARD;
          } else {
            // No session found, redirect to setup wizard
            redirectPath = "/setup";
          }
        } catch (sessionError: any) {
          // If fetching session fails (404, timeout, or no session), redirect to setup
          // This is safe - if session check fails, assume setup is needed
          console.log("No academic session found or check timed out, redirecting to setup:", sessionError);
          redirectPath = "/setup";
        }
      }
      
      // Redirect to subdomain URL with appropriate path
      if (typeof window !== "undefined") {
        const currentHost = window.location.host;
        const currentProtocol = window.location.protocol;
        
        // // Check if we're already on the subdomain URL
        // const hostParts = currentHost.split(".");
        // const isAlreadyOnSubdomain = hostParts[0] === subdomain && hostParts.length > 1;

        // if (!isAlreadyOnSubdomain) {
        if (true) {

          // Construct subdomain URL
          const subdomainStr = subdomain || "default"; // Ensure subdomain is string
          let newHost: string;

          if (currentHost.includes("localhost") || currentHost.includes("127.0.0.1")) {
            // Local development
            const port = currentHost.includes(":") ? currentHost.split(":")[1] : "";
            newHost = port ? `${subdomainStr}.localhost:${port}` : `${subdomainStr}.localhost`;
          } else {
            // Production - extract base domain
            const hostParts = currentHost.split(".");
            if (hostParts.length >= 2) {
              const baseDomain = hostParts.slice(-2).join(".");
              newHost = `${subdomainStr}.${baseDomain}`;
            } else {
              newHost = `${subdomainStr}.${currentHost}`;
            }
          }
          
          // Redirect to subdomain URL with appropriate path
          const newUrl = `${currentProtocol}//${newHost}${redirectPath}`;
          
          // Redirect to subdomain URL
          window.location.href = newUrl;

          // Return early since we're redirecting
          return {
            accessToken,
            user: {
              ...(userFromResponse || {}),
              roles,
            },
            subdomain: subdomain,
            redirecting: true,
          };
        }
      }

      return {
        accessToken,
        user: {
          ...(userFromResponse || {}),
          roles,
        },
        subdomain: subdomain,
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
        // Must go through proxy rewrite to backend
        await apiClient.get(`/api/proxy${routespath.API_LOGOUT}`);
      } catch (error) {
        // Even if logout endpoint fails, we still want to clear local state
        console.warn("[Logout] Backend logout failed, clearing local auth");
      }

      // Remove token from cookies
      await removeAuthToken();
      tokenManager.clearAllAuthCookies();

      // Clear subdomain from localStorage
      const { removeSubdomainFromStorage } = await import("@/lib/subdomainManager");
      removeSubdomainFromStorage();

      return null;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Logout failed";

      console.error("[Logout Error]", errorMessage);

      // Still clear cookies even if error occurs
      await removeAuthToken();
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
      await setAuthToken(accessToken);

      return { accessToken };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Token refresh failed";

      console.error("[Token Refresh Error]", errorMessage);

      // Clear auth if refresh fails
      await removeAuthToken();
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

      // Only log non-subdomain errors to reduce console noise
      // Subdomain errors are expected in some scenarios and will be handled by the UI
      if (!errorMessage.toLowerCase().includes("subdomain")) {
        console.error("[Fetch All Users Error]", errorMessage);
      }
      
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

// Get current user profile
export const getCurrentUserProfile = createAsyncThunk(
  "user/getCurrentUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/proxy/users/me");

      if (!response.data) {
        return rejectWithValue("No user data received");
      }

      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user profile";

      console.error("[Get Current User Profile Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (
    data: {
      userId: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      address?: string;
      dateOfBirth?: string;
      gender?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      if (!data.userId) {
        return rejectWithValue("User ID is required");
      }

      const response = await apiClient.patch(
        `/api/proxy/users/${data.userId}`,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        }
      );

      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update user profile";

      console.error("[Update User Profile Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (
    data: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/api/proxy/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to change password";

      console.error("[Change Password Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get tenant/school settings
export const getTenantInfo = createAsyncThunk(
  "user/getTenantInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/api/proxy/tenant/info");

      if (!response.data) {
        return rejectWithValue("No tenant data received");
      }

      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch tenant information";

      console.error("[Get Tenant Info Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update school branding
export const updateSchoolBranding = createAsyncThunk(
  "user/updateSchoolBranding",
  async (
    data: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      motto?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.patch("/api/proxy/tenant/branding", data);

      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update school branding";

      console.error("[Update School Branding Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
