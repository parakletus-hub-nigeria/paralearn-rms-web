import { useMemo } from "react";
import {
  useGetAllSessionsQuery,
  useGetCurrentSessionQuery,
} from "@/reduxToolKit/api/endpoints/academic";

export interface AcademicTerm {
  id: string;
  sessionId: string;
  term: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  session: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  terms: AcademicTerm[];
}

export interface CurrentSessionData {
  session: string;
  term: string;
  sessionDetails: AcademicSession;
  termDetails: AcademicTerm;
}

export interface SessionOption {
  value: string;
  label: string;
  id: string;
}

export interface TermOption {
  value: string;
  label: string;
  id: string;
}

/**
 * Custom hook for managing academic sessions and terms.
 * Provides formatted data for session/term selectors and current active values.
 *
 * @example
 * const { sessionOptions, termOptions, currentSession, currentTerm, isLoading } = useSessionsAndTerms();
 * // Or get terms for a specific session:
 * const { getTermsForSession } = useSessionsAndTerms();
 * const terms = getTermsForSession("sess_2024_2025");
 */
export function useSessionsAndTerms() {
  // Fetch all sessions
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useGetAllSessionsQuery();

  // Fetch current active session
  const {
    data: currentSessionData,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useGetCurrentSessionQuery();

  // Format sessions for dropdown
  const sessionOptions: SessionOption[] = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return sessions.map((session: AcademicSession) => ({
      value: session.session,
      label: session.session,
      id: session.id,
    }));
  }, [sessions]);

  // Get all unique terms across all sessions (for general term dropdown)
  const allTermOptions: TermOption[] = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    const termMap = new Map<string, TermOption>();

    sessions.forEach((session: AcademicSession) => {
      if (session.terms && Array.isArray(session.terms)) {
        session.terms.forEach((term: AcademicTerm) => {
          if (!termMap.has(term.term)) {
            termMap.set(term.term, {
              value: term.term,
              label: term.term,
              id: term.id,
            });
          }
        });
      }
    });

    return Array.from(termMap.values());
  }, [sessions]);

  // Function to get terms for a specific session
  const getTermsForSession = (sessionValue: string): TermOption[] => {
    if (!sessions || !Array.isArray(sessions)) return [];

    const session = sessions.find(
      (s: AcademicSession) => s.session === sessionValue || s.id === sessionValue
    );

    if (!session || !session.terms) return [];

    return session.terms.map((term: AcademicTerm) => ({
      value: term.term,
      label: term.term,
      id: term.id,
    }));
  };

  // Get session ID by session value
  const getSessionIdByValue = (sessionValue: string): string | undefined => {
    if (!sessions || !Array.isArray(sessions)) return undefined;

    const session = sessions.find(
      (s: AcademicSession) => s.session === sessionValue
    );
    return session?.id;
  };

  // Current active session and term values
  const currentSession = currentSessionData?.session || "";
  const currentTerm = currentSessionData?.term || "";
  const currentSessionDetails = currentSessionData?.sessionDetails || null;
  const currentTermDetails = currentSessionData?.termDetails || null;

  // Combined loading state
  const isLoading = isLoadingSessions || isLoadingCurrent;

  // Combined error
  const error = sessionsError || currentError;

  return {
    // Raw data
    sessions,
    currentSessionData: currentSessionData as CurrentSessionData | undefined,

    // Formatted options
    sessionOptions,
    allTermOptions,

    // Current active values
    currentSession,
    currentTerm,
    currentSessionDetails,
    currentTermDetails,

    // Helper functions
    getTermsForSession,
    getSessionIdByValue,

    // States
    isLoading,
    error,
  };
}
