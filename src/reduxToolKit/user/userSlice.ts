"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tokenManager } from "@/lib/tokenManager";
import {
  loginUser,
  logoutUser,
  fetchUserData,
  refreshAuthToken,
  signupUser,
  requestPasswordReset,
  confirmPasswordReset,
} from "./userThunks";

interface UserState {
  accessToken: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    schoolId: string;
    roles: string[];
  };
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

const initialState: UserState = {
  accessToken: getInitialToken() || null,
  user: {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    schoolId: "",
    roles: [],
  },
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
  },
});
// Export thunks for use in components
export { loginUser, logoutUser, fetchUserData, refreshAuthToken, signupUser };
export const {updateAccessToken} = userSlice.actions
const userReducer = userSlice.reducer;
export default userReducer;
