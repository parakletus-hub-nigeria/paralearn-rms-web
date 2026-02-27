import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";

// Question interface based on usage in LiveExamInterface
export interface AssessmentQuestion {
  id: string;
  prompt?: string;
  questionText?: string; // Fallback for prompt
  text?: string;
  type: "MCQ" | "MULTI_SELECT" | "ESSAY" | "TEXT" | "TRUE_FALSE" | string;
  questionType?: string;
  choices?: { id: string; text: string }[];
  options?: { id: string; text: string }[]; // Fallback for choices
  marks: number;
}

export interface StudentAssessment {
  id: string;
  title: string;
  instructions: string;
  durationMins: number;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
  totalMarks: number;
  passingMarks: number;
  questionCount: number;
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
      code: string;
    };
  };
  category: {
    id: string;
    name: string;
  };
  submissions: {
    status: string;
    startedAt: string;
    finishedAt: string | null;
    durationSecs?: number;
  }[];
  status: "not_started" | "started" | "ended" | "submitted";
  isOnline?: boolean;
  questions?: AssessmentQuestion[]; // Added questions property
}

export interface StartAssessmentResponse {
  submissionId: string;
  status: string;
  startedAt: string;
  deadline: string;
}

// Fetch all available assessments for the student
export const fetchStudentAssessments = createAsyncThunk(
  "student/fetchAssessments",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const user = state.user?.user;
      console.log(`[fetchStudentAssessments] User:`, user);
      
      // Endpoint: GET /assessments/student/published
      // Returns published assessments filtered by student's enrolled classes
      const response = await apiClient.get(`/api/proxy/assessments/student/published`);
      
      console.log(`[fetchStudentAssessments] Response:`, response.data);
      
      // Extract assessments from response
      const assessments = response.data?.data || response.data || [];
      
      return assessments;
    } catch (error: any) {
      console.error(`[fetchStudentAssessments] Error:`, error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch assessments");
    }
  }
);

// Fetch details for a specific assessment (Lobby/Exam)
export const fetchAssessmentDetails = createAsyncThunk(
  "student/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      // Updated endpoint to avoid collision with :status route
      const response = await apiClient.get(`/api/proxy/assessments/details/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch assessment details");
    }
  }
);

// Start an assessment session
export const startAssessment = createAsyncThunk(
  "student/startAssessment",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/api/proxy/assessments/${id}/start`, {
        deviceMeta: {
          userAgent: window.navigator.userAgent,
          platform: window.navigator.platform
        }
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to start assessment");
    }
  }
);

// Submit assessment answers
export const submitAssessment = createAsyncThunk(
  "student/submitAssessment",
  async ({ assessmentId, data }: { assessmentId: string, data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/api/proxy/assessments/${assessmentId}/submissions`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit assessment");
    }
  }
);
