import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  fetchStudentAssessments, 
  fetchAssessmentDetails, 
  startAssessment, 
  submitAssessment,
  StudentAssessment
} from "./studentThunks";

interface StudentState {
  assessments: StudentAssessment[];
  currentAssessment: StudentAssessment | null;
  activeSession: {
    submissionId: string | null;
    status: string | null;
    startedAt: string | null;
    deadline: string | null;
    answers: Record<string, any>;
    tabSwitchCount: number;
    windowBlurCount: number;
    suspiciousActivity: string[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  assessments: [],
  currentAssessment: null,
  activeSession: {
    submissionId: null,
    status: null,
    startedAt: null,
    deadline: null,
    answers: {},
    tabSwitchCount: 0,
    windowBlurCount: 0,
    suspiciousActivity: []
  },
  loading: false,
  error: null
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setAnswer: (state, action: PayloadAction<{ questionId: string; value: any }>) => {
      state.activeSession.answers[action.payload.questionId] = action.payload.value;
    },
    incrementTabSwitch: (state) => {
      state.activeSession.tabSwitchCount += 1;
      state.activeSession.suspiciousActivity.push(`Tab switched at ${new Date().toISOString()}`);
    },
    incrementWindowBlur: (state) => {
      state.activeSession.windowBlurCount += 1;
      state.activeSession.suspiciousActivity.push(`Window focus lost at ${new Date().toISOString()}`);
    },
    resetActiveSession: (state) => {
      state.activeSession = initialState.activeSession;
      state.currentAssessment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assessments
      .addCase(fetchStudentAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchStudentAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Details
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => {
        state.currentAssessment = action.payload;
      })
      // Start Assessment
      .addCase(startAssessment.fulfilled, (state, action) => {
        state.activeSession.submissionId = action.payload.submissionId;
        state.activeSession.status = action.payload.status;
        state.activeSession.startedAt = action.payload.startedAt;
        state.activeSession.deadline = action.payload.deadline;
      })
      // Submit Assessment
      .addCase(submitAssessment.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAssessment.fulfilled, (state) => {
        state.loading = false;
        state.activeSession.status = "submitted";
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setAnswer, incrementTabSwitch, incrementWindowBlur, resetActiveSession } = studentSlice.actions;
export default studentSlice.reducer;
