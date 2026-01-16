import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";
import { routespath } from "@/lib/routepath";

// Types for academic sessions
export interface TermInput {
  term: string;
  startsAt: string;
  endsAt: string;
}

export interface CreateSessionInput {
  session: string;
  startsAt: string;
  endsAt: string;
  terms: TermInput[];
}

export interface Term {
  id: string;
  sessionId: string;
  term: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  session: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  terms: Term[];
  createdAt?: string;
}

export interface CurrentSessionResponse {
  session: string;
  term: string;
  sessionDetails: AcademicSession;
  termDetails: Term;
}

// Create Academic Session with Terms
export const createAcademicSession = createAsyncThunk(
  "setUp/createAcademicSession",
  async (data: CreateSessionInput, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/api/proxy${routespath.API_CREATE_ACADEMIC_SESSION}`,
        data
      );

      if (!response.data?.success) {
        return rejectWithValue("Failed to create academic session");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create academic session";

      console.error("[Create Academic Session Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get All Academic Sessions
export const fetchAllSessions = createAsyncThunk(
  "setUp/fetchAllSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/proxy${routespath.API_GET_ALL_SESSIONS}`);

      if (!response.data?.success) {
        return rejectWithValue("Failed to fetch sessions");
      }

      return response.data.data || [];
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch academic sessions";

      console.error("[Fetch All Sessions Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Current Active Session & Term
export const fetchCurrentSession = createAsyncThunk(
  "setUp/fetchCurrentSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/proxy${routespath.API_GET_CURRENT_SESSION}`);

      if (!response.data?.success) {
        return rejectWithValue("Failed to fetch current session");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch current session";

      console.error("[Fetch Current Session Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Activate Term
export const activateTerm = createAsyncThunk(
  "setUp/activateTerm",
  async (
    { sessionId, termId }: { sessionId: string; termId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        `/api/proxy${routespath.API_CREATE_ACADEMIC_SESSION}/${sessionId}/terms/${termId}/activate`
      );

      if (!response.data?.success) {
        return rejectWithValue("Failed to activate term");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to activate term";

      console.error("[Activate Term Error]", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
