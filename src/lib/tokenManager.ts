import Cookies from "js-cookie";

const TOKEN_KEY = "accessToken";

// Helper to get the base domain for cross-subdomain cookies
const getCookieDomain = () => {
  if (typeof window === "undefined") return undefined;
  const hostname = window.location.hostname;
  
  // Don't domain for localhost or IP addresses
  if (hostname === "localhost" || hostname === "127.0.0.1" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return undefined;
  }
  
  // For production domains (e.g., school.pln.ng -> .pln.ng)
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }
  return undefined;
};

const getCookieOptions = () => ({
  expires: 7, // 7 days
  path: "/",
  domain: getCookieDomain(),
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "lax" as const, // Changed from strict to lax to allow cross-subdomain navigation
});


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
    Cookies.set(TOKEN_KEY, token, getCookieOptions());
  },

  // Kill the token
  removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }
    // Try both with and without domain to be safe during removal
    Cookies.remove(TOKEN_KEY, { path: "/" });
    Cookies.remove(TOKEN_KEY, { path: "/", domain: getCookieDomain() });
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
    Cookies.remove(TOKEN_KEY, { path: "/", domain: getCookieDomain() });
  },
};

export default tokenManager;
