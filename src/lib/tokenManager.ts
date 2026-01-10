import Cookies from "js-cookie";

const TOKEN_KEY = "accessToken";
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: "/",
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
};

/**
 * Token management utility
 * Handles getting, setting, and removing access tokens from cookies
 */
export const tokenManager = {
  /**
   * Get the access token from cookies
   */
  getToken(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }
    return Cookies.get(TOKEN_KEY);
  },

  /**
   * Set the access token in cookies
   */
  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  },

  /**
   * Remove the access token from cookies
   */
  removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.remove(TOKEN_KEY, { path: "/" });
  },

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  },

  /**
   * Clear all auth cookies
   */
  clearAllAuthCookies(): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.remove(TOKEN_KEY, { path: "/" });
  },
};

export default tokenManager;
