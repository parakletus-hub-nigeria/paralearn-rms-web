"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tokenManager } from "@/lib/tokenManager";
import { getSubdomainFromStorage, extractSubdomainFromURL, saveSubdomainToStorage, removeSubdomainFromStorage } from "@/lib/subdomainManager";
import {
  loginUser,
  logoutUser,
  fetchUserData,
  refreshAuthToken,
  signupUser,
  requestPasswordReset,
  confirmPasswordReset,
  fetchAllUsers,
  fetchUserById,
  deleteUser,
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  getTenantInfo,
  updateSchoolBranding,
} from "./userThunks";

interface UserState {
  accessToken: string | null;
  subdomain: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    schoolId: string;
    roles: string[];
  };
  // Users list state
  users: any[];
  students: any[];
  teachers: any[];
  studentCount: number;
  teacherCount: number;
  // Selected user detail
  selectedUser: any | null;
  // Current user profile
  currentUserProfile: any | null;
  // Tenant/School settings
  tenantInfo: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return tokenManager.getToken() || null;
  }
  return null;
};

const getInitialSubdomain = () => {
  // Don't automatically fetch subdomain on initialization
  // It will be extracted from login response
  if (typeof window !== "undefined") {
    // Only check localStorage if it exists from previous session
    const stored = getSubdomainFromStorage();
    return stored || null;
  }
  return null;
};

const initialState: UserState = {
  accessToken: getInitialToken() || null,
  subdomain: getInitialSubdomain(),
  user: {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    schoolId: "",
    roles: [],
  },
  users: [],
  students: [],
  teachers: [],
  studentCount: 0,
  teacherCount: 0,
  selectedUser: null,
  currentUserProfile: null,
  tenantInfo: null,
  loading: false,
  error: null,
  success: false,
};

type User = {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    schoolId: string,
    roles: string[],
  }

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
     updateAccessToken: (state, action: PayloadAction<{  accessToken: any }>) => {
      state.accessToken = action.payload.accessToken;
    },
    updateSubdomain: (state, action: PayloadAction<{ subdomain: string | null }>) => {
      state.subdomain = action.payload.subdomain;
      // Sync to localStorage
      if (action.payload.subdomain) {
        saveSubdomainToStorage(action.payload.subdomain);
      } else {
        removeSubdomainFromStorage();
      }
    }
  },

  extraReducers: (builder) => {
    // Handling login states
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.subdomain = action.payload.subdomain || state.subdomain;
        state.success = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
        state.success = false;
        state.accessToken = null;
      });

    // Loading user profile
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch user data";
      });

    // Logging out
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.subdomain = null;
        state.user = {
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          schoolId: "",
          roles: [],
        };
        state.error = null;
        state.success = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Clear state even on error
        state.accessToken = null;
        state.subdomain = null;
        state.user = {
          id: "",
          email: "",
          firstName: "",
          lastName: "",
          schoolId: "",
          roles: [],
        };
        state.error = (action.payload as string) || "Logout failed";
      });

    // Refreshing the token
    builder
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Token refresh failed";
        // Clear auth on token refresh failure
        state.accessToken = null;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.success = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Signup failed";
        state.success = false;
      });

    // Forgot password flow
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Password reset request failed";
      });

    // New password confirmation
    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Password reset confirmation failed";
      });

    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.students = action.payload.students;
        state.teachers = action.payload.teachers;
        state.studentCount = action.payload.studentCount;
        state.teacherCount = action.payload.teacherCount;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch users";
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.selectedUser = null;
        state.error = (action.payload as string) || "Failed to fetch user details";
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove user from lists
        state.users = state.users.filter((user) => user.id !== action.payload.userId);
        state.students = state.students.filter((user) => user.id !== action.payload.userId);
        state.teachers = state.teachers.filter((user) => user.id !== action.payload.userId);
        state.studentCount = state.students.length;
        state.teacherCount = state.teachers.length;
        state.success = true;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete user";
      });

    // Get current user profile
    builder
      .addCase(getCurrentUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUserProfile = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch user profile";
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUserProfile = action.payload;
        state.user = {
          ...state.user,
          ...action.payload,
        };
        state.success = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to update user profile";
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to change password";
      });

    // Get tenant info
    builder
      .addCase(getTenantInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTenantInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.tenantInfo = action.payload;
        state.error = null;
      })
      .addCase(getTenantInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch tenant information";
      });

    // Update school branding
    builder
      .addCase(updateSchoolBranding.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSchoolBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.tenantInfo = {
          ...state.tenantInfo,
          ...action.payload,
        };
        state.success = true;
        state.error = null;
      })
      .addCase(updateSchoolBranding.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to update school branding";
      });
  },
});
// Export thunks for use in components
export { 
  loginUser, 
  logoutUser, 
  fetchUserData, 
  refreshAuthToken, 
  signupUser,
  fetchAllUsers,
  fetchUserById,
  deleteUser,
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  getTenantInfo,
  updateSchoolBranding,
};
export const {updateAccessToken, updateSubdomain} = userSlice.actions
const userReducer = userSlice.reducer;
export default userReducer;
