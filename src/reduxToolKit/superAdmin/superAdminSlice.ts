"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SuperAdminState {
  /** The X-Super-Admin-Key entered by the user. Stored in memory only (not localStorage). */
  apiKey: string | null;
  /** Whether the K-12 super admin panel is unlocked for this session. */
  k12Unlocked: boolean;
}

const initialState: SuperAdminState = {
  apiKey: null,
  k12Unlocked: false,
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
    setK12Unlocked: (state) => {
      state.k12Unlocked = true;
    },
    clearK12Unlocked: (state) => {
      state.k12Unlocked = false;
    },
  },
});

export const { setSuperAdminKey, clearSuperAdminKey, setK12Unlocked, clearK12Unlocked } = superAdminSlice.actions;
const superAdminReducer = superAdminSlice.reducer;
export default superAdminReducer;
