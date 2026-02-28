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
    assessmentId: string | null;
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

const initialActiveSession = {
  assessmentId: null,
  submissionId: null,
  status: null,
  startedAt: null,
  deadline: null,
  answers: {},
  tabSwitchCount: 0,
  windowBlurCount: 0,
  suspiciousActivity: [],
};

const initialState: StudentState = {
  assessments: [],
  currentAssessment: null,
  activeSession: initialActiveSession,
  loading: false,
  error: null
};

// ---------------------------------------------------------------------------
// localStorage helpers — keeps session alive across page refreshes
// ---------------------------------------------------------------------------
const SESSION_KEY_PREFIX = "exam_session_";

function saveSessionToStorage(assessmentId: string, session: StudentState["activeSession"]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SESSION_KEY_PREFIX + assessmentId,
      JSON.stringify({
        assessmentId: session.assessmentId,
        submissionId: session.submissionId,
        startedAt: session.startedAt,
        deadline: session.deadline,
        answers: session.answers,
        status: session.status,
        tabSwitchCount: session.tabSwitchCount,
        windowBlurCount: session.windowBlurCount,
        suspiciousActivity: session.suspiciousActivity,
      })
    );
  } catch {
    // localStorage can be unavailable in some private browser modes — safe to ignore
  }
}

export function loadSessionFromStorage(assessmentId: string): Partial<StudentState["activeSession"]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY_PREFIX + assessmentId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSessionFromStorage(assessmentId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY_PREFIX + assessmentId);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setAnswer: (state, action: PayloadAction<{ questionId: string; value: any }>) => {
      state.activeSession.answers[action.payload.questionId] = action.payload.value;
      // Persist answers to localStorage so a refresh doesn't lose progress
      if (state.activeSession.assessmentId) {
        saveSessionToStorage(state.activeSession.assessmentId, state.activeSession);
      }
    },
    incrementTabSwitch: (state) => {
      state.activeSession.tabSwitchCount += 1;
      state.activeSession.suspiciousActivity.push(`Tab switched at ${new Date().toISOString()}`);
      if (state.activeSession.assessmentId) {
        saveSessionToStorage(state.activeSession.assessmentId, state.activeSession);
      }
    },
    incrementWindowBlur: (state) => {
      state.activeSession.windowBlurCount += 1;
      state.activeSession.suspiciousActivity.push(`Window focus lost at ${new Date().toISOString()}`);
      if (state.activeSession.assessmentId) {
        saveSessionToStorage(state.activeSession.assessmentId, state.activeSession);
      }
    },
    resetActiveSession: (state) => {
      if (state.activeSession.assessmentId) {
        clearSessionFromStorage(state.activeSession.assessmentId);
      }
      state.activeSession = initialActiveSession;
      state.currentAssessment = null;
    },
    /**
     * Restore an in-progress session from localStorage after a page refresh.
     * Call this in the exam page's first useEffect when assessmentId is available.
     */
    restoreSession: (state, action: PayloadAction<Partial<StudentState["activeSession"]>>) => {
      const saved = action.payload;
      if (!saved) return;
      
      // If we don't have a started session yet, restore everything
      if (!state.activeSession.startedAt && saved.startedAt) {
        state.activeSession = {
          ...state.activeSession,
          ...saved,
        };
      } else if (state.activeSession.startedAt) {
        // If we DO have a live session, just ensure we merge any malpractice data that might be out of sync
        if (saved.tabSwitchCount !== undefined) {
           state.activeSession.tabSwitchCount = Math.max(state.activeSession.tabSwitchCount || 0, saved.tabSwitchCount);
        }
        if (saved.windowBlurCount !== undefined) {
           state.activeSession.windowBlurCount = Math.max(state.activeSession.windowBlurCount || 0, saved.windowBlurCount);
        }
        if (saved.suspiciousActivity && saved.suspiciousActivity.length > state.activeSession.suspiciousActivity.length) {
            state.activeSession.suspiciousActivity = saved.suspiciousActivity;
        }
      }
    },
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
        // FIX #9: If the assessment is already submitted (e.g. finished on another device),
        // clear the stored session from localStorage so we don't restore a stale in-progress session.
        const assessmentId = action.meta.arg as string;
        const payload = action.payload;
        const isAlreadySubmitted =
          payload?.status === "submitted" ||
          payload?.submissions?.some(
            (s: any) => s.status === "submitted" && !!s.finishedAt
          );
        if (isAlreadySubmitted && assessmentId) {
          // Dynamically import to avoid circular dep in the reducer
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem(`exam_session_${assessmentId}`);
            }
          } catch {}
        }
      })
      // Start Assessment
      .addCase(startAssessment.fulfilled, (state, action) => {
        const assessmentId = action.meta.arg; // the id passed to the thunk
        state.activeSession.assessmentId = assessmentId;
        state.activeSession.submissionId = action.payload.submissionId;
        state.activeSession.status = action.payload.status;
        state.activeSession.startedAt = action.payload.startedAt;
        state.activeSession.deadline = action.payload.deadline;
        // Immediately persist so a refresh can recover startedAt
        saveSessionToStorage(assessmentId, state.activeSession);
      })
      // Submit Assessment
      .addCase(submitAssessment.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAssessment.fulfilled, (state) => {
        state.loading = false;
        state.activeSession.status = "submitted";
        // Clear stored session so student can't re-enter
        if (state.activeSession.assessmentId) {
          clearSessionFromStorage(state.activeSession.assessmentId);
        }
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setAnswer,
  incrementTabSwitch,
  incrementWindowBlur,
  resetActiveSession,
  restoreSession,
} = studentSlice.actions;

export default studentSlice.reducer;
