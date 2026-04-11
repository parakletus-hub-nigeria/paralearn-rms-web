/**
 * Dispatching this action type resets ALL slice state and RTK Query caches
 * to their initial values, preventing previous-tenant data from leaking into
 * a new login session. The logoutUser thunk dispatches this before returning.
 */
export const RESET_STORE = "RESET_STORE" as const;
