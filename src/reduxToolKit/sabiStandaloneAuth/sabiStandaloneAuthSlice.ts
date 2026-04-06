import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  standaloneRegister,
  standaloneLogin,
  standaloneLogout,
  fetchStandaloneProfile,
  updateStandaloneProfile,
} from "./sabiStandaloneAuthThunks";

interface StandaloneUser {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  role?: string;
  subjects?: string[];
  walletBalance?: number;
  freeCredits?: number;
}

interface SabiStandaloneAuthState {
  token: string | null;
  user: StandaloneUser | null;
  loading: boolean;
  error: string | null;
}

const STANDALONE_TOKEN_KEY = "sabiStandaloneToken";

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(STANDALONE_TOKEN_KEY); } catch { return null; }
};

const initialState: SabiStandaloneAuthState = {
  token: null, // hydrated client-side
  user: null,
  loading: false,
  error: null,
};

const sabiStandaloneAuthSlice = createSlice({
  name: "sabiStandaloneAuth",
  initialState,
  reducers: {
    hydrateToken: (state) => {
      state.token = getStoredToken();
    },
    clearStandaloneError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(standaloneRegister.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(standaloneRegister.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload?.token ?? null;
      state.user = action.payload?.user ?? action.payload ?? null;
    });
    builder.addCase(standaloneRegister.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false; state.error = action.payload;
    });

    // Login
    builder.addCase(standaloneLogin.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(standaloneLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload?.token ?? null;
      state.user = action.payload?.user ?? null;
    });
    builder.addCase(standaloneLogin.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false; state.error = action.payload;
    });

    // Logout
    builder.addCase(standaloneLogout.fulfilled, (state) => {
      state.token = null; state.user = null; state.error = null;
    });

    // Profile
    builder.addCase(fetchStandaloneProfile.pending, (state) => { state.loading = true; });
    builder.addCase(fetchStandaloneProfile.fulfilled, (state, action) => {
      state.loading = false; state.user = action.payload;
    });
    builder.addCase(fetchStandaloneProfile.rejected, (state) => { state.loading = false; });

    // Update profile
    builder.addCase(updateStandaloneProfile.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(updateStandaloneProfile.fulfilled, (state, action) => {
      state.loading = false; state.user = { ...state.user, ...action.payload } as StandaloneUser;
    });
    builder.addCase(updateStandaloneProfile.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false; state.error = action.payload;
    });
  },
});

export const { hydrateToken, clearStandaloneError } = sabiStandaloneAuthSlice.actions;
export default sabiStandaloneAuthSlice.reducer;
