import { createAsyncThunk } from "@reduxjs/toolkit";
import sabinoteApi from "@/lib/sabinoteApi";

const STANDALONE_TOKEN_KEY = "sabiStandaloneToken";

const serializeError = (error: any, fallback = "An unexpected error occurred"): string => {
  if (typeof error === "string") return error;
  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.message && typeof data.message === "string") return data.message;
    if (data.error && typeof data.error === "string") return data.error;
  }
  return error?.message || fallback;
};

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  schoolName?: string;
  role?: "teacher" | "admin" | "headteacher" | "other";
  subjects?: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  schoolName?: string;
  role?: string;
  subjects?: string[];
}

/** Injects the standalone token into sabinoteApi before a standalone request */
const injectStandaloneToken = (token: string) => {
  if (sabinoteApi.defaults.headers) {
    sabinoteApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const standaloneRegister = createAsyncThunk(
  "sabiStandaloneAuth/register",
  async (dto: RegisterDto, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.post("/auth/register", dto);
      const data = response.data?.data ?? response.data;
      // Store token if provided on registration
      if (data?.token) {
        localStorage.setItem(STANDALONE_TOKEN_KEY, data.token);
        injectStandaloneToken(data.token);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Registration failed"));
    }
  }
);

export const standaloneLogin = createAsyncThunk(
  "sabiStandaloneAuth/login",
  async (dto: LoginDto, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.post("/auth/login", dto);
      const data = response.data?.data ?? response.data;
      if (data?.token) {
        localStorage.setItem(STANDALONE_TOKEN_KEY, data.token);
        injectStandaloneToken(data.token);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Login failed"));
    }
  }
);

export const standaloneLogout = createAsyncThunk(
  "sabiStandaloneAuth/logout",
  async () => {
    localStorage.removeItem(STANDALONE_TOKEN_KEY);
    delete sabinoteApi.defaults.headers.common["Authorization"];
  }
);

export const fetchStandaloneProfile = createAsyncThunk(
  "sabiStandaloneAuth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get("/auth/profile");
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch profile"));
    }
  }
);

export const updateStandaloneProfile = createAsyncThunk(
  "sabiStandaloneAuth/updateProfile",
  async (dto: UpdateProfileDto, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.put("/auth/profile", dto);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to update profile"));
    }
  }
);
