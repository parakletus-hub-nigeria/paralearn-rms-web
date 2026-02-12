"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createAcademicSession,
  fetchAllSessions,
  fetchCurrentSession,
  activateTerm,
  onboardingSetup,
  createClass,
  createSubject,

  updateGradingScale,
  updateCurrentSession,
  AcademicSession,
  CurrentSessionResponse,
  OnboardingSetupResponse,
  CreateClassResponse,
  CreateSubjectResponse,
  UpdateGradingScaleResponse,
} from "./setUpThunk";

interface SetUpState {
  loading: boolean;
  error: string | null;
  success: boolean;
  // Academic sessions state
  sessions: AcademicSession[];
  currentSession: CurrentSessionResponse | null;
  createdSession: AcademicSession | null;
  activateTermData: {
    session: AcademicSession | null;
    term: { id: string; term: string; isActive: boolean } | null;
  } | null;
  // Onboarding setup state
  onboardingSetupData: OnboardingSetupResponse | null;
  // Individual step data
  createdClasses: CreateClassResponse[];
  createdSubjects: CreateSubjectResponse[];
  gradingScaleData: UpdateGradingScaleResponse | null;
}

const initialState: SetUpState = {
  loading: false,
  error: null,
  success: false,
  sessions: [],
  currentSession: null,
  createdSession: null,
  activateTermData: null,
  onboardingSetupData: null,
  createdClasses: [],
  createdSubjects: [],
  gradingScaleData: null,
};

const setUpSlice = createSlice({
  name: "setUp",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCreatedSession: (state) => {
      state.createdSession = null;
    },
    clearActivateTermData: (state) => {
      state.activateTermData = null;
    },
    clearOnboardingSetupData: (state) => {
      state.onboardingSetupData = null;
    },
    clearWizardData: (state) => {
      state.createdClasses = [];
      state.createdSubjects = [];
      state.gradingScaleData = null;
    },
  },

  extraReducers: (builder) => {
    // Create Academic Session
    builder
      .addCase(createAcademicSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAcademicSession.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.createdSession = action.payload;
        // Add to sessions list
        state.sessions.push(action.payload);
      })
      .addCase(createAcademicSession.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create academic session";
        state.success = false;
      });

    // Fetch All Sessions
    builder
      .addCase(fetchAllSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch academic sessions";
      });

    // Fetch Current Session
    builder
      .addCase(fetchCurrentSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentSession.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch current session";
      });

    // Activate Term
    builder
      .addCase(activateTerm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(activateTerm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.activateTermData = action.payload;
        
        // Update the current session if it matches
        if (state.currentSession?.sessionDetails.id === action.payload.session.id) {
          state.currentSession = {
            ...state.currentSession,
            session: action.payload.session.session,
            term: action.payload.term.term,
            sessionDetails: action.payload.session,
            termDetails: {
              id: action.payload.term.id,
              sessionId: action.payload.session.id,
              term: action.payload.term.term,
              startsAt: "",
              endsAt: "",
              isActive: action.payload.term.isActive,
            },
          };
        }

        // Update sessions list to reflect the active term
        const sessionIndex = state.sessions.findIndex(
          (s) => s.id === action.payload.session.id
        );
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex] = action.payload.session;
        }
      })
      .addCase(activateTerm.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to activate term";
        state.success = false;
      });

    // Onboarding Setup
    builder
      .addCase(onboardingSetup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(onboardingSetup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.onboardingSetupData = action.payload;
      })
      .addCase(onboardingSetup.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to complete onboarding setup";
        state.success = false;
      });

    // Create Class
    builder
      .addCase(createClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.createdClasses.push(action.payload);
      })
      .addCase(createClass.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create class";
      });

    // Create Subject
    builder
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.createdSubjects.push(action.payload);
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create subject";
      });

    // Update Grading Scale
    builder
      .addCase(updateGradingScale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateGradingScale.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.gradingScaleData = action.payload;
      })
      .addCase(updateGradingScale.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update grading scale";
        state.success = false;
      });


    // Update Current Session
    builder
      .addCase(updateCurrentSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCurrentSession.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.currentSession = action.payload; // Assuming the API returns the updated session structure
        
        // Update the session in the sessions list as well
        const updatedSession = action.payload.sessionDetails || action.payload; // Handle potential difference in response structure
        const index = state.sessions.findIndex(s => s.id === updatedSession.id);
        if (index !== -1) {
            // Merge or replace
             state.sessions[index] = { ...state.sessions[index], ...updatedSession };
        }
      })
      .addCase(updateCurrentSession.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update academic session";
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCreatedSession,
  clearActivateTermData,
  clearOnboardingSetupData,
  clearWizardData,
} = setUpSlice.actions;

// Export thunks for use in components
export {
  createAcademicSession,
  fetchAllSessions,
  fetchCurrentSession,
  activateTerm,
  onboardingSetup,
  createClass,
  createSubject,
  updateGradingScale,
  updateCurrentSession,
};
const setUpReducer=setUpSlice.reducer;
export default setUpReducer
