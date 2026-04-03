import { createAsyncThunk } from "@reduxjs/toolkit";
import sabinoteApi from "@/lib/sabinoteApi";

export interface GenerateLessonPayload {
  subject: string;
  grade: string;
  topic: string;
  term: "First" | "Second" | "Third";
  week: number;
  duration?: number;
  curriculum?: string;
}

/** Extracts a string error message from various API error shapes */
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

export const fetchCurricula = createAsyncThunk(
  "lessonGenerator/fetchCurricula",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get("/curricula");
      // API returns { success, data: [...] } — extract the array
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch curricula"));
    }
  }
);

export const generateLesson = createAsyncThunk(
  "lessonGenerator/generateLesson",
  async (payload: GenerateLessonPayload, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.post("/generate", payload);
      // API returns { success, data: { id, lessonNote, walletBalance, generatedAt, ... } }
      const raw = response.data?.data ?? response.data;
      // Normalize: rename lessonNote → content, flatten metadata fields for easy access
      const metadata = raw.lessonNote?.metadata ?? {};
      return {
        id: raw.id,
        subject: metadata.subject ?? payload.subject,
        grade: metadata.grade ?? payload.grade,
        topic: metadata.topic ?? payload.topic,
        term: metadata.term ?? payload.term,
        week: metadata.week ?? payload.week,
        content: raw.lessonNote,          // the full lessonNote object stored as "content"
        walletBalance: raw.walletBalance,
        tokensUsed: raw.tokensUsed,
        cost: raw.cost,
        generatedAt: raw.generatedAt,
        demo: raw.demo ?? false,
        message: raw.message,
      };
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to generate lesson note"));
    }
  }
);

export const fetchHistory = createAsyncThunk(
  "lessonGenerator/fetchHistory",
  async (params: { limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get("/history", { params });
      // API returns { success, data: [...] }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch history"));
    }
  }
);

export const fetchLessonDetail = createAsyncThunk(
  "lessonGenerator/fetchLessonDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get(`/${id}`);
      // API returns { success, data: { id, subject, grade, topic, content: {...}, ... } }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch lesson detail"));
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "lessonGenerator/fetchTransactions",
  async (params: { limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get("/auth/wallet/transactions", { params });
      // API returns { success, data: { transactions, balance, totalSpent, totalPurchased, totalRefunded } }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch transactions"));
    }
  }
);

export const topUpWallet = createAsyncThunk(
  "lessonGenerator/topUpWallet",
  async (amount: number, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.post("/auth/wallet/topup", { amount });
      // API returns { success, data: { balance, transactionId } }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Top up failed"));
    }
  }
);

export const fetchWallet = createAsyncThunk(
  "lessonGenerator/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await sabinoteApi.get("/auth/wallet");
      // API returns { success, data: { balance, isLowBalance, remainingGenerations, alert? } }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      return rejectWithValue(serializeError(error, "Failed to fetch wallet"));
    }
  }
);
