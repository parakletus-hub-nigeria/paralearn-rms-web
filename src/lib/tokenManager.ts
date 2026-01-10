import Cookies from "js-cookie";

const TOKEN_KEY = "accessToken";
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: "/",
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict" as const, // CSRF protection
};

// Helper to manage our auth token in cookies
export const tokenManager = {
  // Grab token from cookies (client-side only)
  getToken(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }
    return Cookies.get(TOKEN_KEY);
  },

  // Save the token
  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  },

  // Kill the token
  removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.remove(TOKEN_KEY, { path: "/" });
  },

  // Helper to see if we're logged in
  hasToken(): boolean {
    return !!this.getToken();
  },

  // Nuke all auth-related cookies
  clearAllAuthCookies(): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.remove(TOKEN_KEY, { path: "/" });
  },
};

export default tokenManager;
