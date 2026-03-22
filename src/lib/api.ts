import { createApiClient } from "./apiFactory";
import { tokenManager } from "./tokenManager";

// Lazy import store to avoid circular dependency
let storeInstance: any = null;

const getStore = () => {
  if (!storeInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    // @ts-ignore
    storeInstance = require("@/reduxToolKit/store").store;
  }
  return storeInstance;
};

// Our global axios instance for all core K12 API calls
const apiClient = createApiClient(""); // Empty string uses NextJS relative proxy routing by default

// Quick helpers for auth state
export const setAuthToken = async (token: string): Promise<void> => {
  tokenManager.setToken(token);
  // Sync with Redux state
  const { updateAccessToken } = await import("@/reduxToolKit/user/userSlice");
  getStore()?.dispatch(updateAccessToken({ accessToken: token }));
};

export const removeAuthToken = async (): Promise<void> => {
  tokenManager.removeToken();
  const { updateAccessToken } = await import("@/reduxToolKit/user/userSlice");
  getStore()?.dispatch(updateAccessToken({ accessToken: null }));
};

export const isAuthenticated = (): boolean => {
  return tokenManager.hasToken() || !!getStore()?.getState()?.user?.accessToken;
};

export default apiClient;
