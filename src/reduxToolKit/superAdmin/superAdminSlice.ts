import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const K12_SESSION_KEY = "k12_unlocked";
export const K12_SUBDOMAIN_KEY = "k12_admin_subdomain";

interface SuperAdminState {
  /** The X-Super-Admin-Key for the university super admin. */
  apiKey: string | null;
  /** Whether the K-12 super admin panel is unlocked for this session. */
  k12Unlocked: boolean;
  /**
   * Subdomain of the super admin's school (e.g. "dsa").
   * Sent as X-Tenant-Subdomain header so the backend JWT strategy can validate it.
   * Auth itself is handled via the accessToken cookie (withCredentials: true).
   */
  k12Subdomain: string | null;
  /** Email of the logged-in K-12 super admin. */
  k12AdminEmail: string | null;
}

const initialState: SuperAdminState = {
  apiKey: null,
  k12Unlocked: false,
  k12Subdomain: null,
  k12AdminEmail: null,
};

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    setSuperAdminKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    clearSuperAdminKey: (state) => {
      state.apiKey = null;
    },
    // Legacy — kept for backward compat; prefer setK12AdminSession
    setK12Unlocked: (state) => {
      state.k12Unlocked = true;
      if (typeof window !== "undefined") sessionStorage.setItem(K12_SESSION_KEY, "true");
    },
    clearK12Unlocked: (state) => {
      state.k12Unlocked = false;
      if (typeof window !== "undefined") sessionStorage.removeItem(K12_SESSION_KEY);
    },
    /** Set after a successful POST /auth/login with an isSuperAdmin user. */
    setK12AdminSession: (
      state,
      action: PayloadAction<{ subdomain: string; email: string }>
    ) => {
      state.k12Subdomain = action.payload.subdomain;
      state.k12AdminEmail = action.payload.email;
      state.k12Unlocked = true;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(K12_SESSION_KEY, "true");
        sessionStorage.setItem(K12_SUBDOMAIN_KEY, action.payload.subdomain);
        sessionStorage.setItem("k12_admin_email", action.payload.email);
      }
    },
    clearK12AdminSession: (state) => {
      state.k12Unlocked = false;
      state.k12Subdomain = null;
      state.k12AdminEmail = null;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(K12_SESSION_KEY);
        sessionStorage.removeItem(K12_SUBDOMAIN_KEY);
        sessionStorage.removeItem("k12_admin_email");
      }
    },
  },
});

export const {
  setSuperAdminKey,
  clearSuperAdminKey,
  setK12Unlocked,
  clearK12Unlocked,
  setK12AdminSession,
  clearK12AdminSession,
} = superAdminSlice.actions;
const superAdminReducer = superAdminSlice.reducer;
export default superAdminReducer;
